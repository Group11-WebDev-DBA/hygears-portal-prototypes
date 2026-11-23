/* PUP Hygears portal prototype: the small states every page needs.
   Plain script (no modules) so the pages work when opened by double-click.
   All data below is sample data; the PHP + MySQL build replaces it. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const YEAR = new Date().getFullYear();

  const ICON = {
    clock: '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.5 1.5"/></svg>',
    check: '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>',
    x: '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    alert: '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5 14 13H2z"/><path d="M8 6.5v3M8 11.2v.1"/></svg>',
    cam: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    arrow: '<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6h8"/><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>'
  };
  // status is always an icon plus a word, never colour alone
  const BADGE = {
    Pending: `<span class="badge">${ICON.clock}Pending</span>`,
    Approved: `<span class="badge badge--approved">${ICON.check}Approved</span>`,
    Declined: `<span class="badge badge--declined">${ICON.x}Declined</span>`
  };

  /* ---------- Sample catalog (the real list comes from the org) ---------- */
  const ITEMS = [
    { id: 'multimeter', name: 'Digital multimeter', cat: 'Electrical', type: 'tool', avail: 4, total: 5, unit: 'units' },
    { id: 'soldering', name: 'Soldering station', cat: 'Electrical', type: 'tool', avail: 2, total: 3, unit: 'units' },
    { id: 'drill', name: 'Cordless drill', cat: 'Power tools', type: 'tool', avail: 1, total: 2, unit: 'units' },
    { id: 'torque', name: 'Torque wrench', cat: 'Hand tools', type: 'tool', avail: 0, total: 1, unit: 'units' },
    { id: 'crimper', name: 'Wire crimper', cat: 'Electrical', type: 'tool', avail: 3, total: 3, unit: 'units' },
    { id: 'heatgun', name: 'Heat gun', cat: 'Power tools', type: 'tool', avail: 1, total: 1, unit: 'units' },
    { id: 'goggles', name: 'Safety goggles', cat: 'Safety', type: 'tool', avail: 8, total: 10, unit: 'pairs' },
    { id: 'pla', name: 'PLA filament 1kg', cat: 'Fabrication', type: 'consumable', avail: 5, total: 5, unit: 'spools' },
    { id: 'heatshrink', name: 'Heat-shrink tubing pack', cat: 'Electrical', type: 'consumable', avail: 6, total: 6, unit: 'packs' },
    { id: 'zipties', name: 'Zip ties pack', cat: 'Fabrication', type: 'consumable', avail: 10, total: 12, unit: 'packs' },
    { id: 'tape', name: 'Electrical tape', cat: 'Electrical', type: 'consumable', avail: 7, total: 8, unit: 'rolls' },
    { id: 'epoxy', name: 'Epoxy resin kit', cat: 'Fabrication', type: 'consumable', avail: 2, total: 4, unit: 'kits' }
  ];
  const byId = id => ITEMS.find(i => i.id === id);
  const typeWord = t => (t === 'tool' ? 'Tool' : 'Consumable');

  /* ---------- Saved reservations (this browser only) ---------- */
  const store = {
    all() { try { return JSON.parse(localStorage.getItem('hyg-reservations') || '[]'); } catch (e) { return []; } },
    add(r) { try { localStorage.setItem('hyg-reservations', JSON.stringify([r, ...this.all()].slice(0, 20))); } catch (e) { /* private mode: the ticket still shows */ } },
    next() {
      let n = 150;
      try { n = Number(localStorage.getItem('hyg-counter') || 150) + 1; localStorage.setItem('hyg-counter', n); } catch (e) { n = 150 + Math.floor(Math.random() * 800); }
      return `HYG-${YEAR}-${String(n).padStart(4, '0')}`;
    }
  };

  /* ---------- Hero entrance ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('m-enter-done')));

  /* ---------- Menu (under 1024px) ---------- */
  const nav = $('.nav'), toggle = $('.nav__toggle');
  if (nav && toggle) {
    const set = open => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => set(!nav.classList.contains('is-open')));
    $$('.nav__links a').forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); toggle.focus(); } });
    matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) set(false); });
  }

  /* ---------- Form validation: checked on submit, each error under its field ---------- */
  const today = () => new Date().toISOString().slice(0, 10);
  const RULES = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    sn: v => /^\d{4}-\d{5}-[A-Z]{2}-\d$/i.test(v),
    long: v => v.trim().length >= 30,
    ref: v => /^HYG-\d{4}-\d{4}$/i.test(v.trim()),
    future: v => v >= today()
  };
  function validate(form, extra) {
    const bad = [];
    $$('input, select, textarea', form).forEach(el => {
      const v = el.value.trim();
      let ok = true;
      if (el.required && !v) ok = false;
      else if (v && el.dataset.rule && RULES[el.dataset.rule]) ok = RULES[el.dataset.rule](v);
      if (ok && extra) ok = extra(el, v) !== false;
      const err = form.querySelector('#' + el.id + '-err');
      if (ok) el.removeAttribute('aria-invalid'); else el.setAttribute('aria-invalid', 'true');
      if (err) err.hidden = ok;
      if (!ok) bad.push(el);
    });
    const status = $('[data-form-status]', form);
    if (status) status.textContent = bad.length ? `${bad.length} ${bad.length === 1 ? 'field needs' : 'fields need'} fixing before sending.` : '';
    if (bad.length) bad[0].focus();
    return bad.length === 0;
  }
  const fmtDate = v => (v ? new Date(v + 'T00:00').toLocaleDateString('en-PH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'No return (consumable)');
  const params = new URLSearchParams(location.search);
  const page = document.body.dataset.page;

  /* ---------- Tools: search and filter ---------- */
  if (page === 'tools') {
    const list = $('#items'), count = $('#count'), empty = $('#empty');
    const q = $('#q'), cat = $('#cat');
    const card = i => `<li class="card item">
        <div class="slot">${ICON.cam}Photo from Hygears</div>
        <h3>${esc(i.name)}</h3>
        <div class="item__meta"><span class="badge">${typeWord(i.type)}</span><span class="t-small muted">${esc(i.cat)}</span></div>
        <p class="item__stock${i.avail ? '' : ' is-out'}">${i.avail ? `Available now: ${i.avail} ${i.unit}` : 'None available now'}</p>
        ${i.avail
          ? `<a class="btn btn--secondary" href="reserve.html?item=${i.id}" aria-label="Reserve ${esc(i.name)}">Reserve${ICON.arrow}</a>`
          : `<button class="btn" type="button" disabled>Not available</button>`}
      </li>`;
    const render = () => {
      const term = q.value.trim().toLowerCase();
      const type = ($('input[name="type"]:checked') || {}).value || '';
      const shown = ITEMS.filter(i => (!term || i.name.toLowerCase().includes(term) || i.cat.toLowerCase().includes(term)) && (!cat.value || i.cat === cat.value) && (!type || i.type === type));
      list.innerHTML = shown.map(card).join('');
      empty.hidden = shown.length > 0;
      count.textContent = `Showing ${shown.length} of ${ITEMS.length} sample items`;
    };
    q.addEventListener('input', render);
    cat.addEventListener('change', render);
    $$('input[name="type"]').forEach(r => r.addEventListener('change', render));
    if (params.get('q')) q.value = params.get('q');
    render();
  }

  /* ---------- Reserve: form, success ticket with reference number ---------- */
  if (page === 'reserve') {
    const form = $('#reserve-form'), sel = $('#r-item'), qty = $('#r-qty'), hint = $('#r-qty-hint'), ret = $('#r-return');
    sel.insertAdjacentHTML('beforeend', ITEMS.map(i => `<option value="${i.id}"${i.avail ? '' : ' disabled'}>${esc(i.name)} (${typeWord(i.type).toLowerCase()}${i.avail ? '' : ', none available'})</option>`).join(''));
    $('#r-pickup').min = today(); ret.min = today();
    const sync = () => {
      const it = byId(sel.value);
      hint.textContent = it ? `Available now: ${it.avail} ${it.unit}` : 'Available now: choose an item first';
      qty.max = it ? it.avail : '';
      ret.required = !!(it && it.type === 'tool');
      $('#r-return-hint').textContent = it && it.type === 'consumable' ? 'Consumables are not returned: leave it empty' : 'Required for tools';
    };
    sel.addEventListener('change', sync);
    if (byId(params.get('item')) && byId(params.get('item')).avail) sel.value = params.get('item');
    sync();
    form.addEventListener('submit', e => {
      e.preventDefault();
      const it = byId(sel.value);
      const ok = validate(form, (el, v) => {
        if (el === qty) { const n = Number(v); return Number.isInteger(n) && n >= 1 && (!it || n <= it.avail); }
        if (el === ret && v) return v >= $('#r-pickup').value;
      });
      if (!ok) return;
      const r = { ref: store.next(), item: it.name, qty: Number(qty.value), pickup: $('#r-pickup').value, ret: ret.value, name: $('#r-name').value.trim(), status: 'Pending' };
      store.add(r);
      $('#done-ref').textContent = r.ref;
      $('#done-summary').innerHTML = [['Item', `${r.item}, ${r.qty}`], ['Pickup', fmtDate(r.pickup)], ['Return', fmtDate(r.ret)], ['Name', r.name]]
        .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
      $('#done-track').href = `track.html?ref=${encodeURIComponent(r.ref)}`;
      form.hidden = true;
      const done = $('#reserve-done');
      done.hidden = false;
      done.focus();
    });
  }

  /* ---------- Track: one sample per state, plus this browser's own requests ---------- */
  if (page === 'track') {
    const SAMPLES = {
      'HYG-2026-0137': { item: 'Soldering station, 1', pickup: '2026-11-30', ret: '2026-12-04', status: 'Pending', note: 'Officers have not reviewed it yet. Requests are usually checked before the pickup date.' },
      'HYG-2026-0142': { item: 'Digital multimeter, 1', pickup: '2026-11-27', ret: '2026-12-02', status: 'Approved', note: 'Approved. Bring your PUP ID on the pickup date and return the tool by the return date.' },
      'HYG-2026-0129': { item: 'Cordless drill, 1', pickup: '2026-11-25', ret: '2026-11-28', status: 'Declined', note: 'Declined: the drill is out on those dates. Reserve again for later dates or pick another item.' }
    };
    const form = $('#track-form'), input = $('#t-ref'), out = $('#track-result');
    const show = ref => {
      ref = ref.trim().toUpperCase();
      const own = store.all().find(r => r.ref === ref);
      const t = SAMPLES[ref] || (own && { item: `${own.item}, ${own.qty}`, pickup: own.pickup, ret: own.ret, status: 'Pending', note: 'Sent from this browser. Officers have not reviewed it yet.' });
      if (!t) {
        input.setAttribute('aria-invalid', 'true');
        $('#t-ref-err').textContent = `No request found for ${ref}. Check the number on your confirmation.`;
        $('#t-ref-err').hidden = false;
        out.innerHTML = '';
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      $('#t-ref-err').hidden = true;
      out.innerHTML = `<div class="ticket">
        <div class="ticket__head"><div><p class="t-label">Reservation${SAMPLES[ref] ? ' (sample)' : ''}</p><p class="ticket__ref">${esc(ref)}</p></div>${BADGE[t.status]}</div>
        <div class="ticket__body">
          <dl><div><dt>Item</dt><dd>${esc(t.item)}</dd></div><div><dt>Pickup</dt><dd>${fmtDate(t.pickup)}</dd></div><div><dt>Return</dt><dd>${fmtDate(t.ret)}</dd></div></dl>
          <p>${esc(t.note)}</p>
          ${t.status === 'Declined' ? `<div class="btn-row"><a class="btn btn--secondary" href="tools.html">See tools and supplies</a></div>` : ''}
        </div></div>`;
    };
    form.addEventListener('submit', e => {
      e.preventDefault();
      $('#t-ref-err').textContent = 'Write the reference number in the format HYG-2026-0142.';
      if (validate(form, (el, v) => RULES.ref(v))) show(input.value);
    });
    $$('[data-sample]').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.sample; show(b.dataset.sample); }));
    if (params.get('ref')) { input.value = params.get('ref'); show(params.get('ref')); }
  }

  /* ---------- Join ---------- */
  if (page === 'join') {
    const form = $('#join-form');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(form)) return;
      const ref = `APP-${YEAR}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      $('#join-ref').textContent = ref;
      $('#join-msg').textContent = `Thanks, ${$('#j-name').value.trim().split(' ')[0]}. Your application for ${$('#j-committee').value} is with the officers. They reply to ${$('#j-email').value.trim()}.`;
      form.hidden = true;
      const done = $('#join-done');
      done.hidden = false;
      done.focus();
    });
  }

  /* ---------- Officer: sample sign-in, then the dashboard ---------- */
  if (page === 'officer') {
    const PENDING = [
      { ref: 'HYG-2026-0137', who: 'A. Santos, BSECE 3-2', item: 'Soldering station', qty: 1, dates: '30 Nov to 4 Dec' },
      { ref: 'HYG-2026-0146', who: 'R. Dela Cruz, BSME 4-1', item: 'PLA filament 1kg', qty: 2, dates: '1 Dec, consumable' },
      { ref: 'HYG-2026-0147', who: 'K. Ramos, BSEE 2-1', item: 'Digital multimeter', qty: 1, dates: '2 Dec to 5 Dec' },
      { ref: 'HYG-2026-0148', who: 'J. Villanueva, BSCpE 3-1', item: 'Wire crimper', qty: 1, dates: '3 Dec to 7 Dec' }
    ];
    const OVERDUE = [
      { ref: 'HYG-2026-0118', item: 'Heat gun', who: 'M. Garcia', due: '18 Nov' },
      { ref: 'HYG-2026-0121', item: 'Torque wrench', who: 'P. Mendoza', due: '20 Nov' }
    ];
    const APPS = [
      { name: 'L. Torres', course: 'BSME 2-1', com: 'Innovation and Research', reason: 'Wants hands-on work on the drivetrain.' },
      { name: 'C. Bautista', course: 'BS Marketing 1-2', com: 'Creative Media and Design', reason: 'Can run the team’s social posts.' },
      { name: 'E. Aquino', course: 'BSIE 3-1', com: 'Finance and Operations', reason: 'Wants to manage the build budget.' }
    ];
    const LOW = 1;   // at or below this many available, stock reads Low
    const stockLevel = i => (i.avail === 0 ? `<span class="badge badge--declined">${ICON.x}Out</span>` : i.avail <= LOW ? `<span class="badge badge--low">${ICON.alert}Low</span>` : `<span class="badge">${ICON.check}OK</span>`);
    const decide = (label, id) => `<div class="btn-row"><button class="btn btn--primary btn--sm" type="button" data-act="Approved" data-id="${id}" aria-label="Approve ${label}">Approve</button><button class="btn btn--secondary btn--sm" type="button" data-act="Declined" data-id="${id}" aria-label="Decline ${label}">Decline</button></div>`;
    const stats = () => {
      const open = $$('#t-pending [data-act="Approved"]').length, apps = $$('#t-apps [data-act="Approved"]').length;
      $('#stats').innerHTML = [[open, 'reservations to review'], [OVERDUE.length, 'items overdue'], [apps, 'applications to review'], [ITEMS.filter(i => i.avail <= LOW).length, 'items low or out']]
        .map(([n, w]) => `<div class="stat"><strong>${n}</strong><span class="t-small">${w}</span></div>`).join('');
    };
    const draw = () => {
      $('#t-pending').innerHTML = PENDING.map((r, k) => `<tr><td data-label="Reference" class="mono">${r.ref}</td><td data-label="Student">${esc(r.who)}</td><td data-label="Item">${esc(r.item)}</td><td data-label="Qty">${r.qty}</td><td data-label="Dates">${r.dates}</td><td data-cell="p${k}">${decide(r.ref, 'p' + k)}</td></tr>`).join('');
      $('#t-overdue').innerHTML = OVERDUE.map(r => `<tr><td data-label="Reference" class="mono">${r.ref}</td><td data-label="Item">${esc(r.item)}</td><td data-label="Student">${esc(r.who)}</td><td data-label="Due"><span class="badge">${ICON.alert}Due ${r.due}</span></td></tr>`).join('');
      $('#t-stock').innerHTML = ITEMS.map(i => `<tr><td data-label="Item">${esc(i.name)}</td><td data-label="Type">${typeWord(i.type)}</td><td data-label="Available">${i.avail} of ${i.total}</td><td data-label="Level">${stockLevel(i)}</td></tr>`).join('');
      $('#t-apps').innerHTML = APPS.map((a, k) => `<tr><td data-label="Name">${esc(a.name)}</td><td data-label="Course">${esc(a.course)}</td><td data-label="Committee">${esc(a.com)}</td><td data-label="Reason">${esc(a.reason)}</td><td data-cell="a${k}">${decide(a.name, 'a' + k)}</td></tr>`).join('');
      stats();
    };
    // one listener for every Approve / Decline: the cell turns into the decision, with an icon and its word
    $('#dash').addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const cell = $(`[data-cell="${b.dataset.id}"]`);
      cell.innerHTML = BADGE[b.dataset.act];
      cell.setAttribute('tabindex', '-1');
      cell.focus();
      stats();
    });
    const login = $('#login-form');
    login.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(login)) return;
      $('#login-block').hidden = true;
      $('#dash').hidden = false;
      draw();
      $('#dash-h').setAttribute('tabindex', '-1');
      $('#dash-h').focus();
    });
    $('#signout').addEventListener('click', () => { $('#dash').hidden = true; $('#login-block').hidden = false; login.reset(); $('#o-email').focus(); });
  }
})();
