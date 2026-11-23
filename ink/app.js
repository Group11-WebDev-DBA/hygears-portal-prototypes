// Hygears portal prototype: page states only. Nothing here sends data anywhere.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const params = new URLSearchParams(location.search);

const ICON = {
  check: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>',
  clock: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>',
  x: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
};
const TAGS = {
  pending: ['tag--wait', 'clock', 'Pending'], approved: ['tag--on', 'check', 'Approved'], declined: ['tag--out', 'x', 'Declined'],
  accepted: ['tag--on', 'check', 'Accepted'], returned: ['tag--on', 'check', 'Returned'],
};
const tag = (k) => `<span class="tag ${TAGS[k][0]}">${ICON[TAGS[k][1]]}${TAGS[k][2]}</span>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (iso) => (iso ? new Date(iso + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'None, consumable');
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const rows = (pairs) => `<dl class="slip__rows">${pairs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;

// localStorage can throw on file:// in some browsers; the prototype still works without it.
const store = {
  get() { try { return JSON.parse(localStorage.getItem('hyg-requests') || '{}'); } catch { return {}; } },
  put(ref, v) { try { const all = store.get(); all[ref] = v; localStorage.setItem('hyg-requests', JSON.stringify(all)); } catch { /* not saved */ } },
};

// ---------- Mobile menu ----------
const menuBtn = $('.menu-toggle'), navLinks = $('#nav-links');
menuBtn?.addEventListener('click', () => menuBtn.setAttribute('aria-expanded', navLinks.classList.toggle('is-open')));

// ---------- Field validation: native validity plus per-field messages ----------
const extraChecks = {
  'r-qty': (el) => { const max = Number(el.max || 0); return max && Number(el.value) > max ? `Only ${max} available right now.` : ''; },
  'r-return': (el, f) => (el.value && f.elements.pickup.value && el.value < f.elements.pickup.value ? el.dataset.bad : ''),
};
function validate(form) {
  let first = null;
  for (const el of form.elements) {
    if (!el.id || el.disabled || !el.willValidate || el.type === 'submit') continue;
    let msg = '';
    if (el.validity.valueMissing) msg = el.dataset.req || 'This field is required.';
    else if (!el.validity.valid) msg = el.dataset.bad || 'Check this value.';
    else if (extraChecks[el.id]) msg = extraChecks[el.id](el, form);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const err = $(`#${el.id}-err`);
    if (err) err.textContent = msg;
    if (msg && !first) first = el;
  }
  first?.focus();
  return !first;
}

$$('input[type="date"]').forEach((el) => { el.min = todayISO(); });

// ---------- Home: the reservation counter ----------
const counter = $('#counter');
if (counter) {
  const sel = $('#c-item'), hint = $('#c-item-hint'), qty = $('#c-qty');
  sel.addEventListener('change', () => {
    const o = sel.selectedOptions[0], n = Number(o.dataset.available || 0);
    if (!sel.value) { hint.textContent = 'Pick an item to see how many are on the shelf.'; return; }
    qty.max = n;
    hint.textContent = `${n} on the shelf now. ${o.dataset.type === 'tool' ? 'Tools come back by a return date.' : 'Consumables are yours to use up.'}`;
  });
  counter.addEventListener('submit', (e) => {
    if (!sel.value) { e.preventDefault(); sel.setAttribute('aria-invalid', 'true'); $('#c-item-err').textContent = 'Choose an item first.'; sel.focus(); }
  });
}

// ---------- Tools: filter ----------
const filters = $('#filters');
if (filters) {
  const table = $('#items'), empty = $('#no-match'), count = $('#count');
  const all = $$('tbody tr', table);
  const apply = () => {
    const q = $('#q').value.trim().toLowerCase(), cat = $('#cat').value, type = filters.elements.type.value;
    let shown = 0;
    all.forEach((tr) => {
      const ok = (!q || tr.dataset.name.includes(q)) && (!cat || tr.dataset.category === cat) && (!type || tr.dataset.type === type);
      tr.hidden = !ok; shown += ok;
    });
    table.hidden = !shown; empty.hidden = !!shown;
    count.textContent = shown === all.length ? `Showing all ${all.length} items.` : `Showing ${shown} of ${all.length} items.`;
  };
  filters.addEventListener('input', apply);
  filters.addEventListener('submit', (e) => e.preventDefault());
  $('#clear-filters').addEventListener('click', () => { filters.reset(); apply(); $('#q').focus(); });
}

// ---------- Tools: reserve form ----------
const rForm = $('#reserve-form');
if (rForm) {
  const item = $('#r-item'), qty = $('#r-qty'), ret = $('#r-return'), done = $('#reserve-done');
  const syncItem = () => {
    const o = item.selectedOptions[0], n = Number(o?.dataset.available || 0), consumable = o?.dataset.type === 'consumable';
    if (item.value) { qty.max = n; $('#r-qty-hint').textContent = `Up to ${n}.`; } else { qty.removeAttribute('max'); $('#r-qty-hint').textContent = 'Pick an item first.'; }
    ret.disabled = consumable; ret.required = !consumable;
    if (consumable) { ret.value = ''; ret.setAttribute('aria-invalid', 'false'); $('#r-return-err').textContent = ''; }
    $('#r-return-hint').textContent = consumable ? 'Consumables are used up, so no return date.' : 'Tools only. On or after the pickup date.';
  };
  item.addEventListener('change', syncItem);
  $('#r-pickup').addEventListener('change', (e) => { ret.min = e.target.value || todayISO(); });

  // Prefill from the home counter or a row's Reserve link
  if (params.get('item')) { item.value = params.get('item'); syncItem(); }
  if (params.get('qty')) qty.value = params.get('qty');
  if (params.get('pickup')) $('#r-pickup').value = params.get('pickup');

  $$('[data-reserve]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    item.value = a.dataset.reserve; syncItem();
    $('#reserve').scrollIntoView();
    $('#r-name').focus({ preventScroll: true });
  }));

  rForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(rForm)) return;
    const f = rForm.elements;
    const ref = `HYG-${new Date().getFullYear()}-${String(150 + Math.floor(Math.random() * 9850)).padStart(4, '0')}`;
    const data = { item: item.selectedOptions[0].text.replace(/ \(.*\)$/, ''), qty: f.qty.value, pickup: f.pickup.value, ret: f.return.value };
    store.put(ref, data);
    done.innerHTML = `
      <div class="slip__title"><p class="slip__name">Request recorded in this preview</p>${tag('pending')}</div>
      <p class="note">Your reference number</p><p class="slip__ref">${ref}</p>
      ${rows([['Item', data.item], ['Quantity', data.qty], ['Pickup', fmt(data.pickup)], ['Return', fmt(data.ret)], ['Name', f.name.value.trim()]])}
      <p class="note">Prototype: nothing was sent. On the live site this request goes to the officers, and the number works on Track request.</p>
      <div class="slip__foot"><a class="btn" href="track.html?ref=${ref}">Track request</a><button class="btn btn--quiet" type="button" id="reserve-again">Reserve another</button></div>`;
    rForm.hidden = true; done.hidden = false; done.focus();
    $('#reserve-again').addEventListener('click', () => { rForm.reset(); syncItem(); done.hidden = true; rForm.hidden = false; $('#r-name').focus(); });
  });
}

// ---------- Track ----------
const tForm = $('#track-form');
if (tForm) {
  const SAMPLE = {
    'HYG-2026-0142': { state: 'pending', item: 'Digital multimeter', qty: 1, pickup: '2026-11-24', ret: '2026-11-27', note: 'No officer has reviewed it yet. Check again before your pickup date.' },
    'HYG-2026-0137': { state: 'approved', item: 'Cordless drill', qty: 1, pickup: '2026-11-23', ret: '2026-11-25', note: 'Approved. Pick it up on your pickup date. The pickup room is still to be confirmed by the officers.' },
    'HYG-2026-0129': { state: 'declined', item: 'Heat gun', qty: 1, pickup: '2026-11-22', ret: '2026-11-24', note: 'Declined. Officer’s note (sample): both heat guns are out until 28 Nov. Try a later date.' },
  };
  const input = $('#ref'), out = $('#track-result');
  const run = () => {
    const ref = input.value.trim().toUpperCase();
    input.value = ref;
    if (!validate(tForm)) { out.innerHTML = ''; return; }
    if (!/^HYG-\d{4}-\d{4}$/.test(ref)) {
      input.setAttribute('aria-invalid', 'true'); $('#ref-err').textContent = 'Write it like HYG-2026-0142: HYG, the year, then four digits.'; input.focus(); out.innerHTML = ''; return;
    }
    const saved = store.get()[ref];
    const r = SAMPLE[ref] || (saved && { state: 'pending', ...saved, note: 'Saved in this browser by the prototype. No officer has reviewed it yet.' });
    out.innerHTML = r
      ? `<div class="slip"><div class="slip__title"><p class="slip__ref">${ref}</p>${tag(r.state)}</div><p>${esc(r.note)}</p>
         ${rows([['Item', r.item], ['Quantity', r.qty], ['Pickup', fmt(r.pickup)], ['Return', fmt(r.ret)]])}</div>`
      : `<div class="slip"><p class="slip__name">No request matches ${esc(ref)}</p><p>Check the number on your reservation slip. Sample numbers to try are listed below.</p></div>`;
  };
  tForm.addEventListener('submit', (e) => { e.preventDefault(); run(); });
  if (params.get('ref')) { input.value = params.get('ref'); run(); }
}

// ---------- Join ----------
const jForm = $('#join-form');
if (jForm) {
  const done = $('#join-done');
  jForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(jForm)) return;
    const f = jForm.elements;
    done.innerHTML = `
      <div class="slip__title"><p class="slip__name">Application recorded in this preview</p>${tag('pending')}</div>
      ${rows([['Name', f.name.value.trim()], ['Student number', f.student_number.value.trim()], ['Course', f.course.value], ['Year and section', f.year_section.value.trim()], ['Committee', f.committee.value]])}
      <p class="note">Prototype: nothing was sent. On the live site this goes to the officers, who reply to ${esc(f.email.value.trim())}.</p>
      <div class="slip__foot"><button class="btn btn--quiet" type="button" id="join-edit">Edit application</button></div>`;
    jForm.hidden = true; done.hidden = false; done.focus();
    $('#join-edit').addEventListener('click', () => { done.hidden = true; jForm.hidden = false; $('#j-name').focus(); });
  });
}

// ---------- Officer desk ----------
const lForm = $('#login-form');
if (lForm) {
  const main = $('#main');
  const signIn = (who) => { $('#who').textContent = who; main.classList.add('is-signed-in'); };
  try { if (sessionStorage.getItem('hyg-officer')) signIn(sessionStorage.getItem('hyg-officer')); } catch { /* no session store */ }
  lForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(lForm)) return;
    const who = lForm.elements.email.value.trim();
    try { sessionStorage.setItem('hyg-officer', who); } catch { /* not kept */ }
    signIn(who); $('#dash-title').focus();
  });
  $('#sign-out').addEventListener('click', () => { try { sessionStorage.removeItem('hyg-officer'); } catch { /* none */ } main.classList.remove('is-signed-in'); lForm.reset(); $('#o-email').focus(); });

  // Days late, counted from today's date
  $$('[data-due]').forEach((el) => {
    const days = Math.max(0, Math.round((new Date(todayISO()) - new Date(el.dataset.due)) / 864e5));
    el.textContent = days;
  });

  const STATE_FOR = { approve: 'approved', decline: 'declined', accept: 'accepted', returned: 'returned' };
  const recount = () => $$('[data-table]').forEach((t) => {
    const open = $$('tr[data-row]', t).filter((tr) => !tr.classList.contains('row-done')).length;
    const c = $(`[data-count="${t.dataset.table}"]`); if (c) c.textContent = open;
    const emptyRow = $('.empty-row', t); if (emptyRow) emptyRow.hidden = open > 0;
  });
  // One handler for every row action; each choice can be undone until the page reloads.
  $('.dash').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const tr = btn.closest('tr'), act = tr.querySelector('.act'), state = tr.querySelector('.state');
    if (btn.dataset.act === 'undo') {
      act.innerHTML = tr.dataset.prevAct; state.innerHTML = tr.dataset.prevState; tr.classList.remove('row-done');
      act.querySelector('button')?.focus();
    } else {
      tr.dataset.prevAct = act.innerHTML; tr.dataset.prevState = state.innerHTML;
      state.innerHTML = tag(STATE_FOR[btn.dataset.act]); tr.classList.add('row-done');
      act.innerHTML = '<button class="btn btn--quiet btn--sm" type="button" data-act="undo">Undo</button>';
      act.querySelector('button').focus();
    }
    recount();
  });
}
