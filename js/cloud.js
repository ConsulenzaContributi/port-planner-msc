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

  const stato = { attivo: false, utente: null, sb: null, ultimoSync: null, errore: null };
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
    disegna();
    try { await sincronizza(); } catch (e) { stato.errore = e.message; disegna(); }
  }

  async function accedi() {
    if (!stato.sb) return;
    const { error } = await stato.sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin + location.pathname }
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
