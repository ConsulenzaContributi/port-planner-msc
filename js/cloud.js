/* ============================================================================
   CLOUD — accesso con Google, sincronizzazione dei piani, assistente online.

   Regola di fondo: l'app resta utilizzabile senza tutto questo. Se non c'è
   configurazione, o non c'è rete, o non hai fatto l'accesso, si continua a
   lavorare su localStorage esattamente come prima. Il cloud è un di più che si
   innesta sopra, non una dipendenza — il giorno dello scalo, a Tunisi, la rete
   potrebbe non esserci e l'app deve funzionare comunque.

   Che cosa aggiunge quando è attivo:
   - accesso con il tuo account Google (Supabase Auth);
   - i piani e le schede tue seguono l'utente, non il browser: li ritrovi sul
     telefono;
   - l'assistente passa dalla Edge Function invece che dal proxy su localhost,
     che dal cellulare non esiste.

   Il conflitto fra due dispositivi si risolve con updated_at: vince la copia
   più recente. Per due persone su un solo viaggio è la regola giusta, ed è
   l'unica che si può spiegare in una riga.
   ============================================================================ */

(function () {
  const CFG = window.SUPABASE_CFG || {};
  const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  const CHIAVE_SYNC = 'crociera-sync';

  const stato = { attivo: false, utente: null, sb: null, ultimoSync: null, errore: null, tokenGoogle: null };
  window.CLOUD = stato;

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function carica(url) {
    return new Promise(function (ok, no) {
      const s = document.createElement('script');
      s.src = url; s.onload = ok; s.onerror = () => no(new Error('libreria non raggiungibile'));
      document.head.appendChild(s);
    });
  }

  /* ------------------------------------------------------------- avvio */

  async function avvia() {
    if (!CFG.url || !CFG.chiave) return;              /* modalità solo-locale */
    try { await carica(CDN); } catch (e) { stato.errore = 'offline'; disegna(); return; }

    stato.sb = window.supabase.createClient(CFG.url, CFG.chiave, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    stato.attivo = true;

    const { data } = await stato.sb.auth.getSession();
    if (data && data.session) await entrato(data.session);
    else disegna();

    stato.sb.auth.onAuthStateChange(function (evento, sessione) {
      if (evento === 'SIGNED_IN' && sessione) entrato(sessione);
      if (evento === 'SIGNED_OUT') { stato.utente = null; disegna(); }
    });
  }

  async function entrato(sessione) {
    stato.utente = sessione.user;
    /* Il token Google della sessione: serve per parlare con l'API Gmail
       DIRETTAMENTE dal browser, con i permessi che hai concesso tu al login.
       Non passa mai dal nostro server, non lo salviamo da nessuna parte:
       vive solo qui, e scade da solo dopo circa un'ora (a quel punto la
       ricerca nella mail chiede semplicemente di rientrare). */
    if (sessione.provider_token) stato.tokenGoogle = sessione.provider_token;
    disegna();
    try { await sincronizza(); } catch (e) { stato.errore = e.message; disegna(); }
  }

  async function accedi() {
    if (!stato.sb) return;
    const { error } = await stato.sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: location.origin + location.pathname,
        /* gmail.readonly SOLO in lettura: l'app può cercare le tue conferme
           di prenotazione, non può inviare né cancellare niente. */
        scopes: 'https://www.googleapis.com/auth/gmail.readonly',
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
    if (error) { stato.errore = error.message; disegna(); }
  }

  async function esci() {
    if (stato.sb) await stato.sb.auth.signOut();
    stato.utente = null; disegna();
  }

  /* ------------------------------------------------------ sincronizzazione */

  const quando = r => new Date(r.updated_at || 0).getTime();

  async function sincronizza() {
    if (!stato.utente) return;
    const st = window.APPSTATE;
    const uid = stato.utente.id;
    const locali = leggiMarcatori();

    /* 1. tiro giù quello che c'è sul server */
    const [piani, poi, imp] = await Promise.all([
      stato.sb.from('piani').select('*'),
      stato.sb.from('poi_custom').select('*'),
      stato.sb.from('impostazioni').select('*').maybeSingle()
    ]);
    if (piani.error) throw piani.error;

    (piani.data || []).forEach(function (r) {
      const mio = locali.piani[r.scalo_id] || 0;
      if (quando(r) >= mio) {
        st.piani[r.scalo_id] = { scaloId: r.scalo_id, ritmo: r.ritmo, items: r.items || [] };
        if (r.seme != null) st.seme[r.scalo_id] = Number(r.seme);
      }
    });

    (poi.data || []).forEach(function (r) {
      if (!window.ENGINE.getPoi(r.poi_id)) window.ENGINE.registraPoi(r.dati);
    });

    if (imp.data && typeof imp.data.fuori_scope === 'boolean') st.fuoriScope = imp.data.fuori_scope;

    if (window.APPRENDER) window.APPRENDER();

    /* 2. e rimando su tutto quello che ho io */
    await spingi(uid);
    stato.ultimoSync = new Date();
    stato.errore = null;
    disegna();
  }

  async function spingi(uid) {
    const st = window.APPSTATE;
    const righe = Object.keys(st.piani).map(function (id) {
      return {
        user_id: uid, scalo_id: id,
        ritmo: st.piani[id].ritmo || 'medio',
        items: st.piani[id].items || [],
        seme: st.seme[id] != null ? st.seme[id] : null,
        updated_at: new Date().toISOString()
      };
    });
    if (righe.length) {
      const r = await stato.sb.from('piani').upsert(righe, { onConflict: 'user_id,scalo_id' });
      if (r.error) throw r.error;
    }

    const miei = window.ENGINE.POI.filter(p => p.custom).map(p => ({
      user_id: uid, poi_id: p.id, dati: p, updated_at: new Date().toISOString()
    }));
    if (miei.length) {
      const r = await stato.sb.from('poi_custom').upsert(miei, { onConflict: 'user_id,poi_id' });
      if (r.error) throw r.error;
    }

    const r3 = await stato.sb.from('impostazioni')
      .upsert({ user_id: uid, fuori_scope: !!st.fuoriScope, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' });
    if (r3.error) throw r3.error;

    segnaTutti();
  }

  /* Marcatori locali: servono a non far vincere una copia vecchia del server
     su una modifica appena fatta qui. */
  function leggiMarcatori() {
    try { return JSON.parse(localStorage.getItem(CHIAVE_SYNC)) || { piani: {} }; }
    catch (e) { return { piani: {} }; }
  }
  function segnaTutti() {
    const m = { piani: {} }, ora = Date.now();
    Object.keys(window.APPSTATE.piani).forEach(id => { m.piani[id] = ora; });
    try { localStorage.setItem(CHIAVE_SYNC, JSON.stringify(m)); } catch (e) { }
  }

  /* Ogni salvataggio locale programma una spinta, non la fa subito: durante il
     riordino delle tappe si salva molte volte al secondo. */
  let timer = null;
  function spingiPrestoOPoi() {
    if (!stato.utente) return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      spingi(stato.utente.id)
        .then(function () { stato.ultimoSync = new Date(); stato.errore = null; disegna(); })
        .catch(function (e) { stato.errore = e.message; disegna(); });
    }, 2500);
  }

  /* --------------------------------------------------------------- Gmail

     Sola lettura, e la ricerca resta SEMPRE ristretta alla singola tappa:
     ogni chiamata aggiunge le parole della città e dell'anno del viaggio,
     così non si finisce mai a leggere email che non c'entrano. Il contenuto
     della mail non tocca mai il nostro database — solo l'oggetto, il
     mittente e l'id, che bastano per riaprirla su Gmail con un clic. */

  window.CLOUD.gmailPronto = () => !!stato.tokenGoogle;

  window.CLOUD.cercaEmail = async function (parole) {
    if (!stato.tokenGoogle) throw new Error('Serve accedere di nuovo: il permesso per leggere la mail non è ancora stato concesso, o è scaduto.');
    const q = encodeURIComponent(parole);
    const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8&q=' + q, {
      headers: { authorization: 'Bearer ' + stato.tokenGoogle }
    });
    if (r.status === 401) { stato.tokenGoogle = null; throw new Error('Il permesso per leggere la mail è scaduto: esci e rientra con Google.'); }
    if (!r.ok) throw new Error('Gmail ha risposto ' + r.status);
    const j = await r.json();
    const messaggi = j.messages || [];
    /* Un'altra chiamata per ogni email trovata, solo per intestazione e
       riassunto — mai il corpo del messaggio, non ci serve. */
    const dettagli = await Promise.all(messaggi.map(async function (m) {
      const rr = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/' + m.id +
        '?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date', {
        headers: { authorization: 'Bearer ' + stato.tokenGoogle }
      });
      if (!rr.ok) return null;
      const d = await rr.json();
      const h = (d.payload && d.payload.headers) || [];
      const campo = n => (h.find(x => x.name === n) || {}).value || '';
      return {
        messageId: d.id, threadId: d.threadId,
        oggetto: campo('Subject') || '(senza oggetto)',
        mittente: campo('From'), data: campo('Date'),
        estratto: d.snippet || ''
      };
    }));
    return dettagli.filter(Boolean);
  };

  window.CLOUD.emailCollegate = async function (poiId) {
    if (!stato.utente) return [];
    const r = await stato.sb.from('email_collegate').select('*')
      .eq('poi_id', poiId).order('updated_at', { ascending: false });
    return r.error ? [] : r.data;
  };

  window.CLOUD.collegaEmail = async function (poiId, m) {
    if (!stato.utente) throw new Error('Serve l\'accesso con Google.');
    const r = await stato.sb.from('email_collegate').upsert({
      user_id: stato.utente.id, poi_id: poiId,
      message_id: m.messageId, thread_id: m.threadId,
      oggetto: m.oggetto, mittente: m.mittente, data_mail: m.data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,poi_id,message_id' });
    if (r.error) throw r.error;
  };

  window.CLOUD.scollegaEmail = async function (poiId, messageId) {
    if (!stato.utente) return;
    await stato.sb.from('email_collegate').delete()
      .eq('poi_id', poiId).eq('message_id', messageId);
  };

  /* Monta il riquadro «Email collegate» dentro la scheda di un'attrazione.
     ui.js chiama questa dopo aver disegnato il modale — lascia a lui il resto
     della scheda, questo pezzo si occupa solo di sé stesso. */
  window.CLOUD.montaGmailBox = function (poiId, nomePoi) {
    const box = document.getElementById('gmail-box');
    if (!box) return;

    if (!stato.utente) {
      box.innerHTML = '<h4>Email di conferma</h4>' +
        '<p class="mut small">Accedi con Google per cercare e collegare qui la ricevuta o il biglietto di questa attrazione.</p>';
      return;
    }
    if (!stato.tokenGoogle) {
      box.innerHTML = '<h4>Email di conferma</h4>' +
        '<p class="mut small">Il permesso per leggere la mail non è (ancora) attivo su questa sessione: esci e rientra con Google per concederlo.</p>';
      return;
    }

    box.innerHTML =
      '<h4>Email di conferma</h4>' +
      '<div id="gmail-collegate"><p class="mut small">Carico…</p></div>' +
      '<div class="gmail-cerca">' +
      '<input id="gmail-q" placeholder="Parole da cercare nella mail…" value="' + (nomePoi || '') + '">' +
      '<button class="btn tiny primary" id="gmail-btn-cerca">Cerca</button></div>' +
      '<div id="gmail-risultati"></div>';

    const escl = s => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const apriGmail = m => 'https://mail.google.com/mail/u/0/#search/rfc822msgid:' + encodeURIComponent(m.messageId || m.message_id);

    function elenco() {
      window.CLOUD.emailCollegate(poiId).then(function (righe) {
        const c = document.getElementById('gmail-collegate');
        if (!c) return;
        c.innerHTML = righe.length
          ? righe.map(r => '<div class="gmail-riga">' +
              '<a href="' + apriGmail(r) + '" target="_blank" rel="noopener">' + escl(r.oggetto) + '</a>' +
              '<span class="mut small">' + escl(r.mittente) + '</span>' +
              '<button class="btn tiny ghost" data-scollega="' + escl(r.message_id) + '">togli</button></div>').join('')
          : '<p class="mut small">Nessuna email collegata finora.</p>';
        c.querySelectorAll('[data-scollega]').forEach(b => b.addEventListener('click', function () {
          window.CLOUD.scollegaEmail(poiId, b.getAttribute('data-scollega')).then(elenco);
        }));
      });
    }
    elenco();

    document.getElementById('gmail-btn-cerca').addEventListener('click', function () {
      const parole = document.getElementById('gmail-q').value.trim();
      const ris = document.getElementById('gmail-risultati');
      if (!parole) return;
      ris.innerHTML = '<p class="attesa">Cerco nella mail…</p>';
      window.CLOUD.cercaEmail(parole).then(function (trovate) {
        ris.innerHTML = trovate.length
          ? trovate.map(m => '<div class="gmail-riga">' +
              '<b>' + escl(m.oggetto) + '</b><span class="mut small">' + escl(m.mittente) + ' · ' + escl(m.data) + '</span>' +
              '<p class="mut small">' + escl(m.estratto) + '</p>' +
              '<button class="btn tiny primary" data-collega=\'' + escl(JSON.stringify(m)) + '\'>Collega a questa scheda</button></div>').join('')
          : '<p class="mut small">Nessuna email trovata con queste parole.</p>';
        ris.querySelectorAll('[data-collega]').forEach(b => b.addEventListener('click', function () {
          window.CLOUD.collegaEmail(poiId, JSON.parse(b.getAttribute('data-collega'))).then(function () {
            ris.innerHTML = ''; document.getElementById('gmail-q').value = ''; elenco();
          }).catch(e => { ris.insertAdjacentHTML('afterbegin', '<p class="av err">' + escl(e.message) + '</p>'); });
        }));
      }).catch(function (e) { ris.innerHTML = '<p class="av err">' + escl(e.message) + '</p>'; });
    });
  };

  /* ------------------------------------------- assistente: dove va a finire */

  /* llm.js chiama questa se esiste. Con l'accesso fatto si passa dalla Edge
     Function (raggiungibile dal telefono, chiave al sicuro nei secrets);
     senza, si torna al proxy su localhost. */
  window.CLOUD.chiama = async function (azione, corpo) {
    if (!stato.utente || !stato.sb) return null;
    const { data } = await stato.sb.auth.getSession();
    const token = data && data.session && data.session.access_token;
    if (!token) return null;
    return fetch(CFG.url + '/functions/v1/' + (CFG.funzione || 'assistente'), {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token, apikey: CFG.chiave },
      body: JSON.stringify(Object.assign({ azione: azione }, corpo))
    });
  };

  /* --------------------------------------------------------------- barra */

  function disegna() {
    let b = document.getElementById('cloud-bar');
    if (!b) { b = document.createElement('div'); b.id = 'cloud-bar'; b.className = 'cloud-bar'; document.body.appendChild(b); }

    if (!CFG.url || !CFG.chiave) { b.innerHTML = ''; return; }
    if (stato.errore === 'offline') {
      b.innerHTML = '<span class="cb-off" title="L\'app funziona lo stesso: i dati restano su questo dispositivo.">☁︎ offline — dati solo qui</span>';
      return;
    }
    if (!stato.utente) {
      b.innerHTML = '<button class="cb-btn" data-cloud="entra">Accedi con Google</button>' +
        '<span class="cb-nota">per ritrovare i piani sul telefono</span>';
      return;
    }
    const e = stato.utente.email || 'collegato';
    b.innerHTML = '<span class="cb-ok" title="' + esc(e) + '">☁︎ ' + esc(e.split('@')[0]) + '</span>' +
      (stato.errore ? '<span class="cb-err" title="' + esc(stato.errore) + '">⚠︎ non sincronizzato</span>'
        : '<span class="cb-nota">' + (stato.ultimoSync ? 'salvato ' + stato.ultimoSync.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : 'sincronizzo…') + '</span>') +
      '<button class="cb-btn ghost" data-cloud="sync">↻</button>' +
      '<button class="cb-btn ghost" data-cloud="esci">esci</button>';
  }

  document.addEventListener('click', function (ev) {
    const el = ev.target.closest('[data-cloud]');
    if (!el) return;
    ev.preventDefault(); ev.stopPropagation();
    const a = el.getAttribute('data-cloud');
    if (a === 'entra') accedi();
    if (a === 'esci') esci();
    if (a === 'sync') sincronizza().catch(e => { stato.errore = e.message; disegna(); });
  }, true);

  /* --------------------------------------------------------------- innesto */

  /* ui.js chiama questa a ogni salvataggio locale. */
  window.CLOUD.dopoSalvataggio = spingiPrestoOPoi;

  avvia();
})();
