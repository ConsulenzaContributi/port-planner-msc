/* ============================================================================
   CLOUD — generalizzazione di js/cloud.js (crociera): accesso Google, sync
   dei piani (ora per tappa+giorno), Gmail, budget extra e storico ritmo.

   Stessa regola di fondo: l'app resta utilizzabile senza tutto questo, in
   locale. Il cloud si innesta sopra, non è una dipendenza.
   ============================================================================ */

(function () {
  const CFG = window.SUPABASE_CFG || {};
  const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  const CHIAVE_SYNC = 'travel-sync';

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
    if (sessione.provider_token) stato.tokenGoogle = sessione.provider_token;
    disegna();
    try { await sincronizza(); } catch (e) { stato.errore = e.message; disegna(); }
  }

  function indirizzoDiRitorno() { return location.origin + location.pathname; }

  async function accedi() {
    if (!stato.sb) return;
    const { error } = await stato.sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: indirizzoDiRitorno(),
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
  const chiavePiano = (tappaId, data) => tappaId + '|' + data;

  async function sincronizza() {
    if (!stato.utente) return;
    const st = window.APPSTATE;
    const uid = stato.utente.id;
    const locali = leggiMarcatori();

    const [piani, attivita, imp] = await Promise.all([
      stato.sb.from('piani').select('*'),
      stato.sb.from('attivita_custom').select('*'),
      stato.sb.from('impostazioni').select('*').maybeSingle()
    ]);
    if (piani.error) throw piani.error;

    (piani.data || []).forEach(function (r) {
      const k = chiavePiano(r.tappa_id, r.data);
      const mio = locali.piani[k] || 0;
      if (quando(r) >= mio) {
        st.piani[k] = { tappaId: r.tappa_id, data: r.data, ritmo: r.ritmo, items: r.items || [] };
        if (r.seme != null) st.seme[k] = Number(r.seme);
      }
    });

    (attivita.data || []).forEach(function (r) {
      if (!window.ENGINE.getAttivita(r.attivita_id)) window.ENGINE.registraAttivita(r.dati);
    });

    if (imp.data) {
      if (typeof imp.data.fuori_scope === 'boolean') st.fuoriScope = imp.data.fuori_scope;
      if (imp.data.raggio_km_default != null) st.raggioKm = st.raggioKm || Number(imp.data.raggio_km_default);
    }

    if (window.APPRENDER) window.APPRENDER();

    await spingi(uid);
    stato.ultimoSync = new Date();
    stato.errore = null;
    disegna();
  }

  async function spingi(uid) {
    const st = window.APPSTATE;
    const righe = Object.keys(st.piani).map(function (k) {
      const p = st.piani[k];
      return {
        user_id: uid, tappa_id: p.tappaId, data: p.data,
        ritmo: p.ritmo || 'medio', items: p.items || [],
        seme: st.seme[k] != null ? st.seme[k] : null,
        updated_at: new Date().toISOString()
      };
    });
    if (righe.length) {
      const r = await stato.sb.from('piani').upsert(righe, { onConflict: 'user_id,tappa_id,data' });
      if (r.error) throw r.error;
    }

    const mie = window.ENGINE.ATTIVITA.filter(p => p.custom).map(p => ({
      user_id: uid, attivita_id: p.id, dati: p, updated_at: new Date().toISOString()
    }));
    if (mie.length) {
      const r = await stato.sb.from('attivita_custom').upsert(mie, { onConflict: 'user_id,attivita_id' });
      if (r.error) throw r.error;
    }

    const r3 = await stato.sb.from('impostazioni')
      .upsert({ user_id: uid, fuori_scope: !!st.fuoriScope, raggio_km_default: st.raggioKm || 3, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' });
    if (r3.error) throw r3.error;

    segnaTutti();
  }

  function leggiMarcatori() {
    try { return JSON.parse(localStorage.getItem(CHIAVE_SYNC)) || { piani: {} }; }
    catch (e) { return { piani: {} }; }
  }
  function segnaTutti() {
    const m = { piani: {} }, ora = Date.now();
    Object.keys(window.APPSTATE.piani).forEach(k => { m.piani[k] = ora; });
    try { localStorage.setItem(CHIAVE_SYNC, JSON.stringify(m)); } catch (e) { }
  }

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

  /* --------------------------------------------------- budget e ritmo (premium) */

  window.CLOUD.salvaBudget = async function (voci) {
    if (!stato.utente) return;
    await stato.sb.from('budget_voci').delete().eq('user_id', stato.utente.id).eq('viaggio_id', window.VIAGGIO.id);
    if (!voci.length) return;
    const righe = voci.map(v => ({
      user_id: stato.utente.id, viaggio_id: window.VIAGGIO.id, tappa_id: v.tappaId || null,
      categoria: v.categoria || 'altro', descrizione: v.descrizione, importo: v.importo, data: v.data || null
    }));
    await stato.sb.from('budget_voci').insert(righe);
  };

  window.CLOUD.salvaRitmoStorico = async function (storico) {
    if (!stato.utente) return;
    const righe = storico.map(g => ({
      user_id: stato.utente.id, viaggio_id: g.viaggioId || window.VIAGGIO.id, data: g.data,
      attivita_previste: g.attivitaPreviste, attivita_completate: g.attivitaCompletate,
      km_piedi: g.kmPiedi, feedback: g.feedback
    }));
    if (righe.length) await stato.sb.from('ritmo_storico').upsert(righe, { onConflict: 'user_id,viaggio_id,data' });
  };

  /* ------------------------------------------------- collaborazione (premium, placeholder)

     Idea premium 5. La tabella viaggio_collaboratori (0003_premium.sql) è
     pronta ma richiede che il viaggio sia una riga vera in "viaggi", non un
     file statico: qui sotto solo l'interfaccia visiva del pannello "Invita",
     che spiega la limitazione invece di fingere che funzioni. */
  window.CLOUD.invitaCollaboratore = async function () {
    throw new Error('La collaborazione multiutente richiede che il viaggio sia salvato nel database ' +
      '(tabella "viaggi"), non solo nel file dati locale. È il prossimo passo naturale dopo questo MVP: ' +
      'vedi README → "Cosa manca ancora".');
  };

  /* --------------------------------------------------------------- Gmail */

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

  window.CLOUD.emailCollegate = async function (attivitaId) {
    if (!stato.utente) return [];
    const r = await stato.sb.from('email_collegate').select('*')
      .eq('attivita_id', attivitaId).order('updated_at', { ascending: false });
    return r.error ? [] : r.data;
  };

  window.CLOUD.collegaEmail = async function (attivitaId, m) {
    if (!stato.utente) throw new Error('Serve l\'accesso con Google.');
    const r = await stato.sb.from('email_collegate').upsert({
      user_id: stato.utente.id, attivita_id: attivitaId,
      message_id: m.messageId, thread_id: m.threadId,
      oggetto: m.oggetto, mittente: m.mittente, data_mail: m.data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,attivita_id,message_id' });
    if (r.error) throw r.error;
  };

  window.CLOUD.scollegaEmail = async function (attivitaId, messageId) {
    if (!stato.utente) return;
    await stato.sb.from('email_collegate').delete()
      .eq('attivita_id', attivitaId).eq('message_id', messageId);
  };

  /* ------------------------------------------------- assistente: dove va a finire */

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

    if (!CFG.url || !CFG.chiave) {
      b.innerHTML = '<span class="cb-off" title="Configura data/supabase.js per attivare cloud, assistente AI e Gmail.">☁︎ modalità locale — configura Supabase</span>';
      return;
    }
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

  window.CLOUD.dopoSalvataggio = spingiPrestoOPoi;

  avvia();
})();
