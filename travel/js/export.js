/* ============================================================================
   IDEA PREMIUM 7 — Export PDF/Google Calendar.

   PDF: nessuna libreria esterna. Si usa window.print() con un foglio di stile
   dedicato (css/print.css, caricato solo per lo stampabile) — il browser
   genera il PDF con "Salva come PDF" dalla finestra di stampa. Niente
   dipendenze, funziona offline, funziona su telefono.

   Calendario: generazione di un file .ics standard (RFC 5545), un evento per
   ogni attività pianificata con orario reale. Si scarica e si importa in
   Google Calendar, Apple Calendar, Outlook — nessuna integrazione OAuth
   necessaria per il solo export (vedi README per la sync bidirezionale,
   che invece richiederebbe Google Calendar API con OAuth).
   ============================================================================ */

window.EXPORT = (function () {
  const E = window.ENGINE, T = E.T;

  function tuttiIPiani() {
    const out = [];
    window.VIAGGIO.tappe.forEach(function (t) {
      t.giorni.forEach(function (g) {
        const k = t.id + '|' + g.data;
        const p = window.APPSTATE.piani[k];
        if (p && p.items.length) out.push({ tappa: t, data: g.data, plan: p, valutazione: E.valuta(p) });
      });
    });
    return out;
  }

  /* ------------------------------------------------------------------- PDF */
  function stampabile() {
    const piani = tuttiIPiani();
    const html = piani.map(function (x) {
      const righe = x.valutazione.steps.filter(s => s.tipo === 'visit').map(s =>
        '<tr><td>' + T.hhmm(s.inizio) + '–' + T.hhmm(s.inizio + s.min) + '</td><td>' + s.poi.nome + '</td>' +
        '<td>' + (s.costo ? '€' + s.costo : 'gratis') + '</td></tr>').join('');
      return '<section class="pg"><h2>' + x.tappa.citta + ' — ' + x.data + '</h2>' +
        '<table><thead><tr><th>Orario</th><th>Attività</th><th>Costo</th></tr></thead><tbody>' + righe + '</tbody></table>' +
        '<p>Rientro previsto: ' + T.hhmm(x.valutazione.fine) + ' · Spesa: €' + x.valutazione.costo + '</p></section>';
    }).join('');

    const w = window.open('', '_blank');
    w.document.write('<html><head><title>' + window.VIAGGIO.nome + ' — itinerario</title>' +
      '<style>body{font-family:system-ui,sans-serif;padding:2em;color:#222}h1{margin-bottom:0}' +
      '.pg{page-break-inside:avoid;margin-bottom:2em}table{width:100%;border-collapse:collapse}' +
      'th,td{text-align:left;padding:.4em;border-bottom:1px solid #ddd}@media print{.no-print{display:none}}</style>' +
      '</head><body><h1>' + window.VIAGGIO.nome + '</h1>' +
      '<p>' + window.VIAGGIO.dataPartenza + ' → ' + window.VIAGGIO.dataArrivo + '</p>' +
      '<button class="no-print" onclick="print()">Stampa / Salva PDF</button>' + html + '</body></html>');
    w.document.close();
  }

  /* ------------------------------------------------------------------- ICS */
  function icsData(d) { return d.replace(/-/g, ''); }
  function icsOra(dataIso, minutiDalMezzanotte) {
    const h = Math.floor(minutiDalMezzanotte / 60) % 24, m = Math.round(minutiDalMezzanotte % 60);
    return icsData(dataIso) + 'T' + String(h).padStart(2, '0') + String(m).padStart(2, '0') + '00';
  }
  function escIcs(s) { return String(s || '').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n'); }

  function generaIcs() {
    const piani = tuttiIPiani();
    const eventi = [];
    piani.forEach(function (x) {
      x.valutazione.steps.filter(s => s.tipo === 'visit').forEach(function (s) {
        eventi.push([
          'BEGIN:VEVENT',
          'UID:' + s.poi.id + '-' + x.data + '@travel-planner',
          'DTSTAMP:' + icsData(new Date().toISOString().slice(0, 10)) + 'T000000Z',
          'DTSTART:' + icsOra(x.data, s.inizio),
          'DTEND:' + icsOra(x.data, s.inizio + s.min),
          'SUMMARY:' + escIcs(s.poi.nome),
          'LOCATION:' + escIcs(x.tappa.citta),
          'DESCRIPTION:' + escIcs((s.poi.perche || '') + (s.costo ? ' — €' + s.costo + ' a persona' : '')),
          'END:VEVENT'
        ].join('\r\n'));
      });
    });
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Travel Planner//IT', 'CALSCALE:GREGORIAN']
      .concat(eventi).concat(['END:VCALENDAR']).join('\r\n');
  }

  function scaricaIcs() {
    const blob = new Blob([generaIcs()], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (window.VIAGGIO.id || 'viaggio') + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------------------------------------------------------------- menu */
  function apriMenu() {
    let m = document.getElementById('llm-modal');
    if (!m) { m = document.createElement('div'); m.id = 'llm-modal'; m.className = 'modal'; document.body.appendChild(m); }
    m.innerHTML = '<div class="m-back" data-act="chiudi-modal"></div><div class="m-box">' +
      '<header><div><h3>Esporta il viaggio</h3></div><button class="x" data-act="chiudi-modal">✕</button></header>' +
      '<div class="m-body"><div class="riga">' +
        '<button class="btn primary" data-export="pdf">📄 Itinerario stampabile (PDF)</button>' +
        '<button class="btn ghost" data-export="ics">📅 Esporta in Calendario (.ics)</button>' +
      '</div><p class="mut small">Il file .ics si importa in Google Calendar, Apple Calendar o Outlook: ' +
      'apri il calendario → Impostazioni → Importa, e seleziona il file scaricato.</p></div></div>';
    m.classList.remove('hidden');
  }

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-export]');
    if (!el) return;
    if (el.getAttribute('data-export') === 'pdf') stampabile();
    if (el.getAttribute('data-export') === 'ics') scaricaIcs();
  });

  return { apriMenu, stampabile, scaricaIcs, generaIcs };
})();
