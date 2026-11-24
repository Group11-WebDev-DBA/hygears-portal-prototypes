/* PUP Hygears portal prototype: the small states every page needs.
   Plain script (no modules) so the pages work when opened by double-click.
   All data below is sample data; the PHP + MySQL build replaces it. */
(function () {
  'use strict';

  /* ---------- Small helpers ---------- */
  // $ finds the first element that matches a CSS selector, $$ finds all of them as an array
  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }
  // esc makes typed text safe to put inside HTML (so "<b>" shows as text, not as a tag)
  function esc(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
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
    // stock level badge: Out, Low or OK, each with its own icon
    function stockLevel(item) {
      if (item.avail === 0) return `<span class="badge badge--declined">${ICON.x}Out</span>`;
      if (item.avail <= LOW) return `<span class="badge badge--low">${ICON.alert}Low</span>`;
      return `<span class="badge">${ICON.check}OK</span>`;
    }
    // Approve + Decline buttons for one row; data-id tells the click handler which cell to replace
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

  // ---------- News: the posts ----------
  // On the real site each post is a row in the posts table, and PHP runs
  // SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC.
  // Here the five sample posts below are the starting rows. When an officer
  // saves a post, the whole list is saved in this browser (localStorage),
  // so news.html and article.html show it too.
  // Dates are sample dates; the article text is sample text written from
  // the events on the Hygears Facebook page.
  var SAMPLE_POSTS = [
    {
      id: 1, category: 'Competition', date: '2026-11-21', status: 'published', sample: true,
      title: 'A PUP student is a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge',
      summary: 'A PUP student reached the finals of the first national SOLIDWORKS Mechanical Design Challenge. Hygears is cheering them on.',
      cover: '', coverAlt: '', captionBy: '',
      body: 'PUP Hygears congratulates a PUP student who was named a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge 2026.\n\n' +
        'SOLIDWORKS is the 3D design software engineering students use to model parts and assemblies before anything is cut or printed. A design challenge built around it tests how well students can turn an idea into a working mechanical design.\n\n' +
        'Reaching the finals of the first edition of a national challenge is a big step for a student from our university, and it shows the kind of design work PUP engineering students can do.\n\n' +
        'At Hygears the same skill goes into the Luna cars: every part starts as a model on screen before the team builds it. We hope this news gets more students practising design and joining projects where they can use it.\n\n' +
        'The results of the final round will be posted here once they are announced.'
    },
    {
      id: 2, category: 'Progress report', date: '2026-11-17', status: 'published', sample: true,
      title: 'Luna team progress report (sample)',
      summary: 'A sample that shows how the Luna team’s progress reports will look. The real report comes from the team.',
      cover: 'img/luna-night.jpg', coverAlt: 'The black Luna car parked at night beside the PUP Lagoon sign, under string lights and trees.', captionBy: '',
      body: 'This is a sample post. No real details of the current Luna build are known yet, so this text only shows where a progress report goes and how it reads.\n\n' +
        'A real report would start with where the build stands: which parts of the car the team is working on, such as the chassis, the motor and controller, the battery or the body.\n\n' +
        'Next it would say what changed since the last report, what was tested and what the team learned. Photos from the workshop fit here, each with a caption.\n\n' +
        'It would end with what comes next and how members and supporters can help.\n\n' +
        'Officers can replace this sample from the Posts section of the officer dashboard.'
    },
    {
      id: 3, category: 'Recruitment', date: '2026-11-12', status: 'published', sample: true,
      title: 'ASCEND 2026: meet the five committees',
      summary: 'Hygears is recruiting for ASCEND 2026. Here are the five committees you can pick from when you apply.',
      cover: 'img/team-2.jpg', coverAlt: 'More than twenty Hygears members in matching red and black team shirts stand in a line on the PUP campus.', captionBy: '',
      photos: [{ after: 3, src: 'img/team-luna.jpg', alt: 'Hygears members gather around their black Luna car on a tree-lined road on the PUP campus.', caption: 'The team with a Luna car on campus.' }],
      body: 'ASCEND 2026 is the Hygears recruitment season, and applications are open to PUP students. When you apply, you pick the committee you would most like to work in.\n\n' +
        'Finance and Operations keeps the organization running: budgets, purchases and the paperwork behind every project.\n\n' +
        'Internal Affairs looks after the members, from welcoming new ones to the activities that keep everyone together.\n\n' +
        'Innovation and Research works on the technical side: the research and engineering behind the Luna cars and the team’s projects.\n\n' +
        'External Affairs works with partners and other organizations outside Hygears.\n\n' +
        'Creative Media and Design makes the posts, photos and designs that tell people what Hygears is doing.\n\n' +
        'Members come from Mechanical, Electronics and Communications, Industrial, Electrical and Computer Engineering, and Marketing. Apply from the Join page.'
    },
    {
      id: 4, category: 'Announcement', date: '2026-11-05', status: 'published', sample: true,
      title: 'General Assembly: “The Force Awakens: Refining Our Legacy”',
      summary: 'The Hygears General Assembly brought the Merakis together under the theme “The Force Awakens: Refining Our Legacy”.',
      cover: '', coverAlt: '', captionBy: '',
      body: 'Hygears held its General Assembly under the theme “The Force Awakens: Refining Our Legacy”.\n\n' +
        'The General Assembly is where the members, whom Hygears calls Merakis, meet as one organization: to hear where Hygears is headed, meet the officers and committees, and start the year’s work.\n\n' +
        'Photos and highlights from the assembly will be added here by the Creative Media and Design committee.'
    },
    {
      id: 5, category: 'Workshop', date: '2026-10-25', status: 'published', sample: true,
      title: 'PHYNIX 2026: PUP Hygears Research Workshop',
      summary: 'PHYNIX 2026 is the Hygears research workshop for “Nex-thinkers, N-explorers, Nex-creators”.',
      cover: 'img/team-luna.jpg', coverAlt: 'Hygears members gather around their black Luna car on a tree-lined road on the PUP campus, some kneeling in front.', captionBy: '',
      photos: [{ after: 1, src: 'img/luna-night.jpg', alt: 'The black Luna car parked at night beside the PUP Lagoon sign, under string lights.', caption: 'A Luna car at PUP.' }],
      body: 'PHYNIX 2026 is the PUP Hygears Research Workshop. Its tagline says who it is for: “Nex-thinkers, N-explorers, Nex-creators”.\n\n' +
        'Research is part of why Hygears exists. In the organization’s own words, it aims to further enhance the awareness of PUP students in the field of research.\n\n' +
        'This sample article will be replaced with the real program: the topics, the speakers, the schedule and photos from the day.\n\n' +
        'Watch this page and the Hygears Facebook page for updates.'
    }
  ];

  // All posts: the copy saved in this browser, or the samples the first time.
  // try/catch because some browsers block storage on file:// pages.
  function getPosts() {
    try {
      var saved = localStorage.getItem('hyg-posts');
      if (saved) return JSON.parse(saved);
    } catch (err) { /* fall back to the samples */ }
    return SAMPLE_POSTS.slice();
  }

  // Saves the list. Returns false when the browser refuses (blocked or full).
  function savePosts(posts) {
    try {
      localStorage.setItem('hyg-posts', JSON.stringify(posts));
      return true;
    } catch (err) {
      return false;
    }
  }

  // Newest first: by date, then by id for posts on the same day
  function sortNewest(posts) {
    posts.sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.id - a.id;
    });
    return posts;
  }

  // Only the published posts, newest first (what news.html shows)
  function publishedPosts() {
    var all = getPosts();
    var list = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].status === 'published') list.push(all[i]);
    }
    return sortNewest(list);
  }

  // Finds one post by its id, or null
  function findPost(id, posts) {
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === id) return posts[i];
    }
    return null;
  }

  // Body text: a blank line starts a new paragraph
  function toParagraphs(text) {
    var parts = text.split(/\n\s*\n/);
    var list = [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].trim() !== '') list.push(parts[i].trim());
    }
    return list;
  }

  // The summary, or the start of the body when the officer left it empty
  function summaryOf(post) {
    if (post.summary) return post.summary;
    var text = post.body.replace(/\s+/g, ' ').trim();
    return text.length > 160 ? text.slice(0, 157) + '...' : text;
  }

  // "2026-11-21" becomes "21 November 2026"
  function longDate(iso) {
    return new Date(iso + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* ---------- News: one post card (news.html, the home strip, "More posts") ---------- */
  // the list photo has empty alt because the title right under it says the same
  const postCard = p => `<li class="card post">
      ${p.cover ? `<img class="post__cover" src="${esc(p.cover)}" alt="" loading="lazy">` : `<div class="slot">${ICON.cam}Photo from Hygears</div>`}
      <div class="post__meta"><span class="badge">${esc(p.category)}</span><time class="t-small muted" datetime="${p.date}">${longDate(p.date)}</time></div>
      <h3><a href="article.html?id=${p.id}">${esc(p.title)}</a></h3>
      <p>${esc(summaryOf(p))}</p>
      <a class="card__go" href="article.html?id=${p.id}">Read more<span class="visually-hidden">: ${esc(p.title)}</span>${ICON.arrow}</a>
    </li>`;

  /* ---------- Home: "Latest from Hygears" (the 3 newest posts) ---------- */
  if (page === 'index') {
    $('#latest-posts').innerHTML = publishedPosts().slice(0, 3).map(postCard).join('');
  }

  /* ---------- News page: list with a category filter ---------- */
  if (page === 'news') {
    const cat = $('#n-cat');
    const render = () => {
      const shown = publishedPosts().filter(p => !cat.value || p.category === cat.value);
      $('#news-list').innerHTML = shown.map(postCard).join('');
      $('#news-empty').hidden = shown.length > 0;
      $('#news-count').textContent = cat.value
        ? `Showing ${shown.length} ${cat.value.toLowerCase()} post${shown.length === 1 ? '' : 's'}`
        : `Showing all ${shown.length} posts, newest first`;
    };
    cat.addEventListener('change', render);
    render();
  }

  /* ---------- Article page: article.html?id=N ---------- */
  if (page === 'article') {
    const published = publishedPosts();
    const post = params.get('id') ? findPost(Number(params.get('id')), published) : published[0];
    if (!post) {
      // a wrong id, or a post that was unpublished
      $('#article').innerHTML = `<h1 id="article-title">This post is not available</h1>
        <p class="t-lead">It may have been unpublished, or the link is wrong.</p>
        <p class="article__by"><a class="link" href="news.html">See all news</a></p>`;
    } else {
      document.title = `${post.title}, PUP Hygears`;
      // paragraphs, with any inline photo placed after paragraph number "after"
      const body = toParagraphs(post.body).map((text, k) => {
        const photos = (post.photos || []).filter(ph => ph.after === k + 1);
        return `<p>${esc(text)}</p>` + photos.map(ph =>
          `<figure><img src="${esc(ph.src)}" alt="${esc(ph.alt)}" loading="lazy"><figcaption>${esc(ph.caption)}</figcaption></figure>`).join('');
      }).join('');
      $('#article').innerHTML = `
        <div class="post__meta"><span class="badge">${esc(post.category)}</span><time class="t-small muted" datetime="${post.date}">${longDate(post.date)}</time>${post.sample ? '<span class="badge badge--sample">Sample article</span>' : ''}</div>
        <h1 id="article-title">${esc(post.title)}</h1>
        <p class="t-lead">${esc(summaryOf(post))}</p>
        ${post.cover ? `<figure><img src="${esc(post.cover)}" alt="${esc(post.coverAlt || '')}"></figure>` : ''}
        <div class="article__body">${body}</div>
        <p class="article__by">Caption by ${post.captionBy ? `<strong>${esc(post.captionBy)}</strong>` : '<span class="fill">writer’s name to come</span>'} for PUP Hygears.</p>`;
    }
    // "More posts": up to 3 other published posts
    $('#more-posts').innerHTML = published.filter(p => p !== post).slice(0, 3).map(postCard).join('');
  }

  /* ---------- Officer: Posts list and the New post form ---------- */
  if (page === 'officer') {
    const form = $('#post-form'), rows = $('#t-posts'), status = $('#post-status');
    const cover = $('#np-cover'), coverErr = $('#np-cover-err'), box = $('#np-preview-box'), preview = $('#np-preview');
    const MAX_PHOTO = 2 * 1024 * 1024;                   // 2 MB, the same limit PHP would check
    const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    let coverData = '';                                  // the chosen photo as a data URL
    let coverBad = false;                                // true when the chosen file was refused
    let editingId = null;                                // id of the post being edited, or null
    let publishClicked = true;                           // which submit button was pressed

    const postBadge = s => (s === 'published' ? `<span class="badge badge--approved">${ICON.check}Published</span>` : `<span class="badge">${ICON.clock}Draft</span>`);
    // fills the officer table, drafts included, newest first
    const drawPosts = () => {
      const posts = sortNewest(getPosts());
      rows.innerHTML = posts.length ? posts.map(p => `<tr>
          <td data-label="Title"><b>${esc(p.title)}</b></td><td data-label="Category">${esc(p.category)}</td>
          <td data-label="Date" class="nowrap">${fmtDate(p.date)}</td><td data-label="Status">${postBadge(p.status)}</td>
          <td><div class="btn-row"><button class="btn btn--secondary btn--sm" type="button" data-post-edit="${p.id}" aria-label="Edit ${esc(p.title)}">Edit</button><button class="btn btn--secondary btn--sm" type="button" data-post-toggle="${p.id}" aria-label="${p.status === 'published' ? 'Unpublish' : 'Publish'} ${esc(p.title)}">${p.status === 'published' ? 'Unpublish' : 'Publish'}</button></div></td>
        </tr>`).join('') : '<tr><td colspan="5">No posts yet. Write the first one below.</td></tr>';
    };
    const showPreview = src => { coverData = src; preview.src = src; box.hidden = !src; };

    // cover photo: check the type and size, then preview it with FileReader
    cover.addEventListener('change', () => {
      const file = cover.files[0];
      coverBad = false;
      if (file && PHOTO_TYPES.indexOf(file.type) === -1) { coverBad = true; coverErr.textContent = 'That file is not a JPG, PNG or WebP photo.'; }
      else if (file && file.size > MAX_PHOTO) { coverBad = true; coverErr.textContent = `That photo is ${(file.size / 1048576).toFixed(1)} MB. Use one under 2 MB.`; }
      coverErr.hidden = !coverBad;
      if (coverBad) cover.setAttribute('aria-invalid', 'true'); else cover.removeAttribute('aria-invalid');
      if (!file || coverBad) { if (coverBad) cover.value = ''; showPreview(''); return; }
      // FileReader turns the file into a data URL the <img> can show right away
      const reader = new FileReader();
      reader.addEventListener('load', () => showPreview(reader.result));
      reader.readAsDataURL(file);
    });
    $('#np-remove').addEventListener('click', () => { cover.value = ''; showPreview(''); cover.focus(); });

    // puts the form back to "New post"
    const resetForm = () => {
      form.reset();
      showPreview('');
      coverBad = false;
      editingId = null;
      $('#np-date').value = today();
      $('#post-form-h').textContent = 'New post';
      $('#np-cancel').hidden = true;
      $$('.field__error', form).forEach(e => { e.hidden = true; });
      $$('[aria-invalid]', form).forEach(e => e.removeAttribute('aria-invalid'));
      $('[data-form-status]', form).textContent = '';
    };

    // remember which submit button was pressed (Publish or Save draft)
    $$('button[type="submit"]', form).forEach(b => b.addEventListener('click', () => { publishClicked = b.dataset.status === 'published'; }));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const ok = validate(form, (el, v) => {
        if (el === cover) return !coverBad;
        if (el.id === 'np-alt') return !(coverData && !v);
      });
      if (!ok) return;
      const f = form.elements, posts = getPosts();
      let post = editingId === null ? null : findPost(editingId, posts);
      const verb = post ? 'Saved changes to' : 'Published';
      if (!post) {
        // new post: the next id (the database's AUTO_INCREMENT does this)
        post = { id: posts.reduce((max, p) => Math.max(max, p.id), 0) + 1, sample: false };
        posts.push(post);
      }
      Object.assign(post, {
        title: f.title.value.trim(), category: f.category.value, date: f.date.value,
        cover: coverData, coverAlt: coverData ? f.cover_alt.value.trim() : '',
        summary: f.summary.value.trim(), body: f.body.value.trim(), captionBy: f.caption_by.value.trim(),
        status: publishClicked ? 'published' : 'draft'
      });
      if (!savePosts(posts)) {
        $('[data-form-status]', form).textContent = 'This browser would not save the post. The photo may be too big for browser storage: try a smaller one, or remove it.';
        return;
      }
      status.innerHTML = publishClicked
        ? `${verb} “${esc(post.title)}”. It is in the list above and shows on <a class="link" href="news.html">News</a> in this browser.`
        : `Saved “${esc(post.title)}” as a draft. It stays off News until you publish it.`;
      resetForm();
      drawPosts();
      status.focus();
    });

    $('#np-cancel').addEventListener('click', () => { resetForm(); status.textContent = ''; $('#post-form-h').focus(); });

    // Edit and Publish/Unpublish buttons in the table (one listener for all rows)
    rows.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      const posts = getPosts();
      if (b.dataset.postEdit) {
        const p = findPost(Number(b.dataset.postEdit), posts), f = form.elements;
        resetForm();
        editingId = p.id;
        f.title.value = p.title; f.category.value = p.category; f.date.value = p.date;
        f.cover_alt.value = p.coverAlt || ''; f.summary.value = p.summary || ''; f.body.value = p.body; f.caption_by.value = p.captionBy || '';
        showPreview(p.cover || '');
        $('#post-form-h').textContent = 'Edit post';
        $('#np-cancel').hidden = false;
        $('#post-form-h').focus();
        form.scrollIntoView();
      }
      if (b.dataset.postToggle) {
        const p = findPost(Number(b.dataset.postToggle), posts);
        p.status = p.status === 'published' ? 'draft' : 'published';
        status.innerHTML = !savePosts(posts) ? 'This browser would not save the change.'
          : p.status === 'published' ? `Published “${esc(p.title)}”. It shows on <a class="link" href="news.html">News</a> again.`
          : `Unpublished “${esc(p.title)}”. It no longer shows on News.`;
        drawPosts();
        status.focus();
      }
    });

    $('#np-date').value = today();
    drawPosts();
  }

  /* ---------- Join: applications open or closed ---------- */
  // recruitment is seasonal; the real site reads an officer setting. join.html?season=closed previews closed.
  if (page === 'join') {
    const open = params.get('season') !== 'closed';
    $('#apps-open').hidden = !open;
    $('#apps-closed').hidden = open;
    $('#apply').hidden = !open;
  }
})();
