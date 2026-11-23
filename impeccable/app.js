/* PUP Hygears portal prototype: shared behaviour for every page.
   Sample data lives here; the real site will load it from MySQL through PHP. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Icon + silhouette sprite ----------
     Each tool silhouette is one SVG path built from rounded rectangles (rr) and circles (ci).
     "evenodd" turns inner shapes into holes. The path has no fill of its own, so style.css
     paints it solid black (on the board) or as a dashed outline (all units out). */
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;
  const ci = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 -${2 * r} 0z`;
  const SIL = {
    multimeter: rr(17, 4, 30, 56, 6) + rr(22, 9, 20, 12, 2) + ci(32, 35, 8) + ci(32, 35, 2.5) + ci(24, 51, 2.5) + ci(40, 51, 2.5),
    solder: rr(4, 34, 34, 24, 4) + rr(9, 39, 14, 8, 1.5) + ci(30, 46, 4) + rr(45, 6, 10, 30, 5) + rr(47, 36, 6, 6, 1) + 'M48.5 42h3l-.9 16h-1.2z',
    drill: rr(8, 12, 40, 16, 6) + rr(48, 15, 7, 10, 2) + 'M55 18.5h7v3h-7z' + 'M20 28h15l-3 18h-10z' + rr(14, 46, 26, 12, 3) + rr(13, 17, 3, 6, 1) + rr(19, 17, 3, 6, 1),
    torque: ci(11, 32, 8) + rr(8, 29, 6, 6, 1) + rr(19, 29.5, 29, 5, 2.5) + rr(48, 26, 14, 12, 4) + rr(51, 30, 8, 4, 1),
    crimper: 'M27 4h10l1 18h-12z' + ci(32, 27, 5) + ci(32, 27, 1.8) + 'M27 32h4l-6 28h-8z' + 'M33 32h4l10 28h-8z',
    heatgun: rr(6, 14, 40, 16, 7) + rr(46, 17, 14, 10, 2) + 'M18 30h14l-3 26h-10z' + rr(12, 19, 3, 6, 1) + rr(18, 19, 3, 6, 1) + rr(24, 19, 3, 6, 1),
    goggles: rr(0, 27, 6, 9, 1.5) + rr(58, 27, 6, 9, 1.5) + 'M17 18h30a11 11 0 0 1 11 11v8a11 11 0 0 1-11 11h-6l-4-6h-10l-4 6h-6a11 11 0 0 1-11-11v-8a11 11 0 0 1 11-11z' + rr(11, 23, 19, 14, 6) + rr(34, 23, 19, 14, 6),
    spool: rr(8, 4, 9, 56, 3) + rr(47, 4, 9, 56, 3) + rr(17, 13, 30, 38, 1) + rr(17, 20, 30, 1.6, .8) + rr(17, 27, 30, 1.6, .8) + rr(17, 34, 30, 1.6, .8) + rr(17, 41, 30, 1.6, .8),
    shrink: rr(6, 12, 52, 6, 3) + rr(10, 22, 44, 8, 4) + rr(4, 34, 56, 10, 5) + rr(14, 48, 36, 6, 3),
    zipties: rr(14, 24, 46, 4, 2) + rr(4, 21, 10, 10, 2) + rr(6.5, 24, 5, 4, 1) + rr(18, 38, 42, 4, 2) + rr(8, 35, 10, 10, 2) + rr(10.5, 38, 5, 4, 1),
    tape: ci(32, 31, 24) + ci(32, 31, 11) + rr(30, 55, 28, 5, 1),
    epoxy: rr(12, 1, 34, 4, 1) + rr(14, 6, 14, 40, 3) + rr(30, 6, 14, 40, 3) + 'M24 46h10l-3 14h-4z'
  };
  const ICONS = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    alert: '<path d="M12 4L2.8 19.5h18.4z"/><path d="M12 10v4.2M12 17.2v.1"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M3.5 6.5l8.5 7 8.5-7"/>',
    pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.1"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>'
  };
  const sprite = document.createElement('div');
  sprite.hidden = true;
  sprite.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' +
    Object.entries(SIL).map(([k, d]) => `<symbol id="s-${k}" viewBox="0 0 64 64"><path fill-rule="evenodd" d="${d}"/></symbol>`).join('') +
    Object.entries(ICONS).map(([k, d]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${d}</symbol>`).join('') + '</svg>';
  document.body.prepend(sprite);
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const sil = (name, ghost) => `<svg class="sil${ghost ? ' sil--ghost' : ''}" viewBox="0 0 64 64" aria-hidden="true"><use href="#s-${name}"/></svg>`;
  // Static markup can ask for an icon with <i data-icon="mail"></i>
  $$('[data-icon]').forEach(el => { el.outerHTML = icon(el.dataset.icon); });

  /* ---------- Sample inventory ---------- */
  const ITEMS = [
    { id: 'multimeter', name: 'Digital multimeter', cat: 'Electronics', type: 'tool', total: 5, avail: 4, unit: 'units', sil: 'multimeter', use: 'Measure voltage, current and resistance when testing circuits.' },
    { id: 'soldering-station', name: 'Soldering station', cat: 'Electronics', type: 'tool', total: 3, avail: 2, unit: 'units', sil: 'solder', use: 'Join wires and components on boards. Temperature-controlled iron with stand.' },
    { id: 'cordless-drill', name: 'Cordless drill', cat: 'Power tools', type: 'tool', total: 2, avail: 1, unit: 'units', sil: 'drill', use: 'Drill and drive screws in wood, plastic and thin metal. Comes with one battery.' },
    { id: 'torque-wrench', name: 'Torque wrench', cat: 'Hand tools', type: 'tool', total: 2, avail: 1, unit: 'units', sil: 'torque', use: 'Tighten bolts to a set torque, for wheels and chassis parts.' },
    { id: 'wire-crimper', name: 'Wire crimper', cat: 'Electronics', type: 'tool', total: 2, avail: 2, unit: 'units', sil: 'crimper', use: 'Crimp terminals and connectors onto wire ends.' },
    { id: 'heat-gun', name: 'Heat gun', cat: 'Power tools', type: 'tool', total: 1, avail: 0, unit: 'units', sil: 'heatgun', use: 'Shrink tubing, soften plastics and strip paint.' },
    { id: 'safety-goggles', name: 'Safety goggles', cat: 'Safety', type: 'tool', total: 10, avail: 8, unit: 'pairs', sil: 'goggles', use: 'Eye protection for drilling, cutting and soldering.' },
    { id: 'pla-filament', name: 'PLA filament, 1 kg', cat: 'Fabrication', type: 'consumable', total: 4, avail: 3, unit: 'spools', sil: 'spool', use: 'For 3D printing prototypes and brackets.' },
    { id: 'heat-shrink', name: 'Heat-shrink tubing pack', cat: 'Electronics', type: 'consumable', total: 8, avail: 6, unit: 'packs', sil: 'shrink', use: 'Insulate soldered joints. Mixed sizes.' },
    { id: 'zip-ties', name: 'Zip ties pack', cat: 'Fabrication', type: 'consumable', total: 12, avail: 10, unit: 'packs', sil: 'zipties', use: 'Bundle and secure wires and hoses.' },
    { id: 'electrical-tape', name: 'Electrical tape', cat: 'Electronics', type: 'consumable', total: 6, avail: 0, unit: 'rolls', sil: 'tape', use: 'Insulate and bundle wiring.' },
    { id: 'epoxy-kit', name: 'Epoxy resin kit', cat: 'Fabrication', type: 'consumable', total: 3, avail: 2, unit: 'kits', sil: 'epoxy', use: 'Bond and fill parts. Two-part resin with mixing nozzle.' }
  ];
  const byId = id => ITEMS.find(i => i.id === id);
  const typeWord = t => (t === 'tool' ? 'Tool, returned' : 'Consumable, used up');

  function availLine(i) {
    if (!i.avail) return `${icon('x')}<span>None available now</span>`;
    const pegs = i.total <= 12
      ? `<span class="pegs" aria-hidden="true">${Array.from({ length: i.total }, (_, n) => `<span class="peg${n < i.avail ? '' : ' is-off'}"></span>`).join('')}</span>` : '';
    return `${pegs}<span class="num">${i.avail} of ${i.total} ${i.unit} available</span>`;
  }

  function slotHTML(i, opts = {}) {
    const action = opts.noAction ? '' : (i.avail
      ? `<a class="btn btn--primary btn--small" href="reserve.html?item=${i.id}" aria-label="Reserve ${esc(i.name)}">Reserve</a>`
      : `<button class="btn btn--small" type="button" disabled>None left</button>`);
    return `<li class="slot${i.avail ? '' : ' is-out'}">
      <div class="sil-frame">${sil(i.sil)}</div>
      <div class="plate">
        <h3>${opts.link && i.avail ? `<a href="reserve.html?item=${i.id}">${esc(i.name)}</a>` : esc(i.name)}</h3>
        ${opts.short ? '' : `<p class="meta">${esc(i.cat)} · ${i.type === 'tool' ? 'Tool' : 'Consumable'}</p>`}
        <p class="avail">${availLine(i)}</p>
        ${action}
      </div></li>`;
  }

  /* ---------- Header menu (phone) ---------- */
  const menuBtn = $('.menu-btn'), nav = $('#site-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = menuBtn.getAttribute('aria-expanded') !== 'true';
      menuBtn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { menuBtn.click(); menuBtn.focus(); }
    });
  }

  /* ---------- Home: board peek ---------- */
  const peek = $('#board-peek');
  if (peek) {
    peek.innerHTML = ['soldering-station', 'multimeter', 'cordless-drill', 'heat-gun', 'pla-filament', 'safety-goggles']
      .map(id => slotHTML(byId(id), { short: true, noAction: true, link: true })).join('');
  }

  /* ---------- Tools: full board with search and filters ---------- */
  const board = $('#tool-board');
  if (board) {
    const q = $('#q'), cat = $('#cat'), count = $('#count');
    const cats = [...new Set(ITEMS.map(i => i.cat))].sort();
    cat.insertAdjacentHTML('beforeend', cats.map(c => `<option>${esc(c)}</option>`).join(''));
    const params = new URLSearchParams(location.search);
    if (params.get('q')) q.value = params.get('q');
    function render() {
      const term = q.value.trim().toLowerCase();
      const type = $('input[name="type"]:checked').value;
      const list = ITEMS.filter(i =>
        (!term || (i.name + ' ' + i.cat + ' ' + i.use).toLowerCase().includes(term)) &&
        (!cat.value || i.cat === cat.value) &&
        (type === 'all' || i.type === type));
      board.innerHTML = list.map(i => slotHTML(i)).join('');
      $('#empty').hidden = list.length > 0;
      const free = list.filter(i => i.avail).length;
      count.textContent = list.length ? `${list.length} item${list.length > 1 ? 's' : ''}, ${free} available now` : 'No items match';
    }
    q.addEventListener('input', render);
    cat.addEventListener('change', render);
    $$('input[name="type"]').forEach(r => r.addEventListener('change', render));
    $('#clear-filters').addEventListener('click', () => { q.value = ''; cat.value = ''; $('#type-all').checked = true; render(); q.focus(); });
    render();
  }

  /* ---------- Form helpers ---------- */
  const STUDENT_NO = /^\d{4}-\d{5}-[A-Z]{2}-\d$/;   // PUP format, e.g. 2024-01234-MN-0
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function setError(input, msg) {
    const err = document.getElementById(input.id + '-error');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) { err.innerHTML = msg ? icon('alert') + '<span>' + esc(msg) + '</span>' : ''; err.classList.toggle('is-shown', !!msg); }
  }
  // Validate on submit, then live once a field has been flagged
  function runForm(form, rules, onOk) {
    const summary = $('.error-summary', form);
    form.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid') === 'true') setError(e.target, rules[e.target.id] ? rules[e.target.id](e.target) : ''); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = [];
      Object.entries(rules).forEach(([id, check]) => {
        const el = document.getElementById(id);
        if (!el || el.disabled) return;
        const msg = check(el); setError(el, msg);
        if (msg) bad.push({ id, msg });
      });
      if (bad.length) {
        summary.hidden = false;
        $('ul', summary).innerHTML = bad.map(b => `<li><a href="#${b.id}">${esc(b.msg)}</a></li>`).join('');
        $('.es-title', summary).focus();
        return;
      }
      summary.hidden = true;
      onOk();
    });
    summary && summary.addEventListener('click', e => {
      const a = e.target.closest('a'); if (!a) return;
      e.preventDefault(); document.getElementById(a.getAttribute('href').slice(1)).focus();
    });
  }
  const need = label => el => el.value.trim() ? '' : `Enter your ${label}.`;
  const studentNo = el => !el.value.trim() ? 'Enter your student number.' : STUDENT_NO.test(el.value.trim().toUpperCase()) ? '' : 'Student number should look like 2024-01234-MN-0.';
  const email = el => !el.value.trim() ? 'Enter your email address.' : EMAIL.test(el.value.trim()) ? '' : 'Enter an email like juan.delacruz@iskolarngbayan.pup.edu.ph.';
  const PROFILE_KEY = 'hg-profile';
  const saveProfile = data => { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(data)); } catch (e) { /* private mode */ } };
  const loadProfile = () => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; } catch (e) { return {}; } };
  const isoToday = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const niceDate = iso => iso ? new Date(iso + 'T00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  /* ---------- Reserve ---------- */
  const rForm = $('#reserve-form');
  if (rForm) {
    const itemSel = $('#r-item'), qty = $('#r-qty'), ret = $('#r-return'), pick = $('#r-pickup');
    itemSel.innerHTML = '<option value="">Choose an item</option>' + ITEMS.map(i =>
      `<option value="${i.id}"${i.avail ? '' : ' disabled'}>${esc(i.name)}${i.avail ? ` (${i.avail} available)` : ' (none left)'}</option>`).join('');
    const pre = new URLSearchParams(location.search).get('item');
    if (pre && byId(pre) && byId(pre).avail) itemSel.value = pre;
    const prof = loadProfile();
    ['name', 'sn', 'email', 'course'].forEach(k => { if (prof[k]) $('#r-' + k).value = prof[k]; });
    $('#r-remembered').hidden = !prof.name;
    pick.min = ret.min = isoToday();

    function syncItem() {
      const i = byId(itemSel.value), strip = $('#picked');
      if (!i) { strip.hidden = true; qty.max = 10; return; }
      strip.hidden = false;
      strip.innerHTML = `<div class="sil-frame">${sil(i.sil)}</div><div><p class="picked-name">${esc(i.name)}</p><p class="meta small muted">${esc(i.cat)} · ${typeWord(i.type)}</p><p class="avail">${availLine(i)}</p></div>`;
      qty.max = i.avail;
      $('#r-qty-hint').textContent = `Up to ${i.avail} ${i.unit}.`;
      const consumable = i.type === 'consumable';
      ret.disabled = consumable;
      $('#r-return-field').hidden = consumable;
      $('#r-consumable-note').hidden = !consumable;
      if (consumable) setError(ret, '');
    }
    itemSel.addEventListener('change', syncItem);
    syncItem();

    runForm(rForm, {
      'r-item': el => el.value ? '' : 'Choose the item you want to borrow.',
      'r-qty': el => { const n = +el.value, max = +el.max || 1; return !el.value ? 'Enter how many you need.' : (n < 1 || n > max || !Number.isInteger(n)) ? `Enter a whole number from 1 to ${max}.` : ''; },
      'r-name': need('full name'),
      'r-sn': studentNo,
      'r-email': email,
      'r-course': el => el.value.trim() ? '' : 'Enter your course and section, like BSME 2-1.',
      'r-purpose': el => el.value.trim().length >= 10 ? '' : 'Tell officers what it is for (at least 10 characters).',
      'r-pickup': el => !el.value ? 'Choose a pickup date.' : el.value < isoToday() ? 'Pickup date cannot be in the past.' : '',
      'r-return': el => !el.value ? 'Choose a return date.' : (pick.value && el.value < pick.value) ? 'Return date must be on or after the pickup date.' : ''
    }, () => {
      const i = byId(itemSel.value);
      let n = 142; try { n = Math.max(142, +localStorage.getItem('hg-seq') || 142) + 1; localStorage.setItem('hg-seq', n); } catch (e) { n = 143; }
      const ref = `HYG-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`;
      const rec = { ref, item: i.name, qty: qty.value, pickup: pick.value, ret: ret.disabled ? '' : ret.value, status: 'pending', who: $('#r-name').value.trim() };
      try { const all = JSON.parse(localStorage.getItem('hg-requests') || '{}'); all[ref] = rec; localStorage.setItem('hg-requests', JSON.stringify(all)); } catch (e) { /* ignore */ }
      if ($('#r-remember').checked) saveProfile({ name: $('#r-name').value.trim(), sn: $('#r-sn').value.trim().toUpperCase(), email: $('#r-email').value.trim(), course: $('#r-course').value.trim() });
      const done = $('#reserve-done');
      $('#done-ref').textContent = ref;
      $('#done-item').textContent = `${rec.qty} × ${i.name}`;
      $('#done-pickup').textContent = niceDate(rec.pickup);
      $('#done-return').textContent = rec.ret ? niceDate(rec.ret) : 'Consumable, not returned';
      $('#done-board').innerHTML = `<div class="sil-frame">${sil(i.sil, true)}${sil(i.sil)}</div>`;
      $('#done-track').href = `track.html?ref=${ref}`;
      rForm.hidden = true; $('#picked').hidden = true;
      done.hidden = false;
      done.classList.add('is-lifted');
      $('h2', done).focus();
    });
  }

  /* ---------- Track ---------- */
  const SAMPLE_REQ = {
    'HYG-2026-0137': { item: 'Soldering station', qty: 1, pickup: '2026-11-24', ret: '2026-11-26', status: 'pending', who: 'Sample student' },
    'HYG-2026-0142': { item: 'Digital multimeter', qty: 2, pickup: '2026-11-23', ret: '2026-11-25', status: 'approved', who: 'Sample student' },
    'HYG-2026-0129': { item: 'Heat gun', qty: 1, pickup: '2026-11-21', ret: '2026-11-22', status: 'declined', who: 'Sample student', note: 'The only heat gun is out until Nov 28. Please request again after that date.' }
  };
  const tForm = $('#track-form');
  if (tForm) {
    const input = $('#t-ref'), out = $('#track-result');
    const STATUS = {
      pending: { chip: `<span class="chip chip--pending">${icon('clock')}Pending</span>`, say: 'Officers have your request and will review it.', steps: ['done', 'now', 'todo'] },
      approved: { chip: `<span class="chip chip--approved">${icon('check')}Approved</span>`, say: 'Approved. Bring your student ID when you pick it up.', steps: ['done', 'done', 'now'] },
      declined: { chip: `<span class="chip chip--declined">${icon('x')}Declined</span>`, say: 'This request was declined.', steps: ['done', 'no', 'todo'] }
    };
    const stepNames = ['Request sent', 'Officer review', 'Ready for pickup'];
    function lookup(ref) {
      let mine = {}; try { mine = JSON.parse(localStorage.getItem('hg-requests') || '{}'); } catch (e) { /* ignore */ }
      return SAMPLE_REQ[ref] || mine[ref];
    }
    function show(ref) {
      const r = lookup(ref);
      if (!r) { setError(input, `We couldn't find ${ref}. Check the number on your confirmation, or try one of the samples below.`); out.hidden = true; return; }
      setError(input, '');
      const s = STATUS[r.status];
      out.innerHTML = `<div class="result">
        <div><p class="ref-label">Reference</p><p class="ref-big num">${esc(ref)}</p></div>
        <div>${s.chip}</div>
        <p>${s.say}${r.note ? ' ' + esc(r.note) : ''}</p>
        <ol class="steps">${stepNames.map((n, k) => {
          const st = s.steps[k], ic = st === 'done' ? 'check' : st === 'no' ? 'x' : st === 'now' ? 'clock' : '';
          const word = { done: 'done', now: 'in progress', no: 'declined', todo: 'not yet' }[st];
          return `<li class="is-${st}"><span class="dot">${ic ? icon(ic) : ''}</span><span>${n} <span class="visually-hidden">(${word})</span></span></li>`;
        }).join('')}</ol>
        <dl class="details"><dt>Item</dt><dd>${esc(r.qty)} × ${esc(r.item)}</dd><dt>Pickup</dt><dd>${niceDate(r.pickup)}</dd><dt>Return</dt><dd>${r.ret ? niceDate(r.ret) : 'Consumable, not returned'}</dd></dl>
      </div>`;
      out.hidden = false;
    }
    tForm.addEventListener('submit', e => {
      e.preventDefault();
      const ref = input.value.trim().toUpperCase();
      if (!ref) { setError(input, 'Enter your reference number, like HYG-2026-0142.'); input.focus(); return; }
      show(ref);
    });
    $$('[data-ref]').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.ref; show(b.dataset.ref); out.focus(); }));
    const fromUrl = new URLSearchParams(location.search).get('ref');
    if (fromUrl) { input.value = fromUrl; show(fromUrl.toUpperCase()); }
  }

  /* ---------- Join ---------- */
  const jForm = $('#join-form');
  if (jForm) {
    const prof = loadProfile();
    if (prof.name) $('#j-name').value = prof.name;
    if (prof.sn) $('#j-sn').value = prof.sn;
    if (prof.email) $('#j-email').value = prof.email;
    runForm(jForm, {
      'j-name': need('full name'),
      'j-sn': studentNo,
      'j-email': email,
      'j-course': el => el.value ? '' : 'Choose your course.',
      'j-year': el => el.value.trim() ? '' : 'Enter your year and section, like 1-2.',
      'j-committee-1': () => $('input[name="committee"]:checked') ? '' : 'Choose the committee you would like to join.',
      'j-reason': el => el.value.trim().length >= 20 ? '' : 'Tell us why you want to join (at least 20 characters).'
    }, () => {
      $('#join-done-name').textContent = $('#j-name').value.trim().split(' ')[0];
      $('#join-done-committee').textContent = $('input[name="committee"]:checked').value;
      $('#join-done-email').textContent = $('#j-email').value.trim();
      jForm.hidden = true;
      const done = $('#join-done'); done.hidden = false; $('h2', done).focus();
    });
    // committee radios share one error slot
    $$('input[name="committee"]').forEach(r => r.addEventListener('change', () => setError($('#j-committee-1'), '')));
  }

  /* ---------- Officer ---------- */
  const login = $('#login-form');
  if (login) {
    const desk = $('#desk'), loginWrap = $('#login');
    runForm(login, {
      'o-user': el => el.value.trim() ? '' : 'Enter your officer username.',
      'o-pass': el => el.value ? '' : 'Enter your password.'
    }, () => { loginWrap.hidden = true; desk.hidden = false; $('#desk-title').focus(); });
    $('#sign-out').addEventListener('click', () => { desk.hidden = true; loginWrap.hidden = false; login.reset(); $('#o-user').focus(); });

    const msg = $('#desk-msg');
    const pendingLeft = () => $$('#pending-body tr:not(.is-decided)').length;
    desk.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const row = b.closest('tr'), ref = row.dataset.ref, act = b.dataset.act;
      const cell = $('.actions', row);
      if (act === 'approve' || act === 'decline') {
        row.classList.add('is-decided');
        cell.innerHTML = act === 'approve'
          ? `<span class="chip chip--approved">${icon('check')}Approved</span>`
          : `<span class="chip chip--declined">${icon('x')}Declined</span>`;
        msg.textContent = `${ref} ${act === 'approve' ? 'approved' : 'declined'}. ${pendingLeft()} pending left.`;
        $('#n-pending').textContent = pendingLeft();
      } else if (act === 'returned') {
        cell.innerHTML = `<span class="chip chip--approved">${icon('check')}Returned</span>`;
        msg.textContent = `${ref} marked as returned.`;
      } else if (act === 'reviewed') {
        cell.innerHTML = `<span class="chip chip--approved">${icon('check')}Reviewed</span>`;
        msg.textContent = `Application from ${row.dataset.name} marked as reviewed.`;
      }
      // The pressed button is gone; keep keyboard focus on the row's new status
      const chip = $('.chip', cell); chip.tabIndex = -1; chip.focus();
    });
    const stock = $('#stock-board');
    stock.innerHTML = ITEMS.map(i => slotHTML(i, { short: true, noAction: true })).join('');
  }
})();
