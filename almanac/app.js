// Hygears portal prototype: page states only. Nothing here talks to a server yet;
// the PHP + MySQL build replaces every "preview" branch below with a real request.
document.documentElement.classList.add('js');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const params = new URLSearchParams(location.search);
const LAST_REF = 'hyg-last-request';

// ---------- Form errors ----------
function setError(el, msg) {
  const out = document.getElementById(el.id + '-error');
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (out) out.textContent = msg;
}

// Checks every field that carries data-error; `extra` adds rules native validation cannot express.
function validate(form, extra) {
  let first = null;
  $$('[data-error]', form).forEach((el) => {
    let msg = el.checkValidity() ? '' : el.dataset.error;
    if (!msg && extra) msg = extra(el) || '';
    setError(el, msg);
    if (msg && !first) first = el;
  });
  if (first) first.focus();
  return !first;
}

$$('[data-error]').forEach((el) => el.addEventListener('input', () => {
  if (el.getAttribute('aria-invalid') === 'true' && el.checkValidity()) setError(el, '');
}));

const today = () => new Date().toISOString().slice(0, 10);

// ---------- Tools catalog: search, category and type filters ----------
const catalog = $('#catalog');
if (catalog) {
  const q = $('#f-q'), cat = $('#f-cat'), rows = $$('tbody tr[data-name]', catalog);
  const empty = $('#catalog-empty'), count = $('#catalog-count');
  if (params.get('q')) q.value = params.get('q');
  const apply = () => {
    const term = q.value.trim().toLowerCase();
    const type = $('input[name="type"]:checked').value;
    let shown = 0;
    rows.forEach((r) => {
      const ok = r.dataset.name.includes(term) && (!cat.value || r.dataset.cat === cat.value) && (type === 'all' || r.dataset.type === type);
      r.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown > 0;
    count.textContent = `Showing ${shown} of ${rows.length} items`;
  };
  [q, cat, ...$$('input[name="type"]')].forEach((el) => el.addEventListener('input', apply));
  $('#f-form').addEventListener('submit', (e) => { e.preventDefault(); apply(); });
  $('#catalog-clear').addEventListener('click', () => { q.value = ''; cat.value = ''; $('#t-all').checked = true; apply(); q.focus(); });
  apply();
}

// ---------- Reserve: validation and the reference number ----------
const reserve = $('#reserve-form');
if (reserve) {
  const item = $('#r-item'), qty = $('#r-qty'), pick = $('#r-pickup'), ret = $('#r-return');
  pick.min = today();
  if (params.get('item')) item.value = params.get('item');
  const opt = () => item.selectedOptions[0];
  const sync = () => {
    const o = opt();
    qty.max = o && o.dataset.available ? o.dataset.available : 1;
    ret.required = !o || o.dataset.type !== 'consumable';
    $('#r-return-hint').textContent = ret.required ? 'Tools come back by this date.' : 'Consumables are used up, so leave this blank.';
  };
  item.addEventListener('change', sync);
  sync();

  reserve.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = validate(reserve, (el) => {
      if (el === qty && Number(qty.value) > Number(qty.max)) return `Only ${qty.max} available now. Lower the quantity.`;
      if (el === pick && pick.value < today()) return 'Choose a pickup date from today on.';
      if (el === ret && ret.value && ret.value < pick.value) return 'The return date must be on or after the pickup date.';
      return '';
    });
    if (!ok) return;
    // Preview only: a random number in the HYG-YYYY-NNNN format; the database assigns the real one.
    const ref = `HYG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
    localStorage.setItem(LAST_REF, JSON.stringify({ ref, item: opt().textContent.trim() }));
    $('#done-ref').textContent = ref;
    $('#done-item').textContent = `${opt().textContent.trim()}, quantity ${qty.value}`;
    $('#done-track').href = `track.html?ref=${encodeURIComponent(ref)}`;
    reserve.hidden = true;
    $('#reserve-done').hidden = false;
    $('#reserve-done').focus();
  });
  $('#reserve-again').addEventListener('click', () => {
    reserve.reset(); sync();
    $('#reserve-done').hidden = true; reserve.hidden = false; $('#r-name').focus();
  });
}

// ---------- Track: three example states, plus the request made in this browser ----------
const track = $('#track-form');
if (track) {
  const input = $('#t-ref'), out = $('#track-result');
  const examples = {
    'HYG-2026-0142': { state: 'pending', item: 'Digital multimeter, quantity 1', next: 'Waiting for an officer. Check again before your pickup date.' },
    'HYG-2026-0139': { state: 'approved', item: 'Soldering station, quantity 1', next: 'Approved. Collect it from the officers on your pickup date.' },
    'HYG-2026-0131': { state: 'declined', item: 'Cordless drill, quantity 1', next: 'Declined: none left on that pickup date. Try another date or item.' },
  };
  const label = { pending: 'Pending', approved: 'Approved', declined: 'Declined' };
  const look = () => {
    input.value = input.value.trim().toUpperCase();
    if (!validate(track)) { out.hidden = true; return; }
    let hit = examples[input.value];
    const last = JSON.parse(localStorage.getItem(LAST_REF) || 'null');
    if (!hit && last && last.ref === input.value) hit = { state: 'pending', item: last.item, next: 'Waiting for an officer. This preview never sends it, so it stays pending.' };
    out.hidden = false;
    if (!hit) {
      $('#tr-ref').textContent = input.value;
      $('#tr-status').innerHTML = '';
      $('#tr-item').textContent = '';
      $('#tr-next').textContent = 'No request has that number in this preview. Check the number on your confirmation, or try one of the examples.';
      return;
    }
    $('#tr-ref').textContent = input.value;
    $('#tr-status').innerHTML = `<span class="status status--${hit.state}">${$('#icon-' + hit.state).innerHTML}${label[hit.state]}</span>`;
    $('#tr-item').textContent = hit.item;
    $('#tr-next').textContent = hit.next;
  };
  track.addEventListener('submit', (e) => { e.preventDefault(); look(); });
  if (params.get('ref')) { input.value = params.get('ref'); look(); }
}

// ---------- Join ----------
const join = $('#join-form');
if (join) {
  join.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(join)) { $('#join-status').textContent = ''; return; }
    $('#join-status').textContent = 'Every field checks out. This is a preview, so nothing was sent; on the live site the application goes to the officers.';
  });
}

// ---------- Officer: sign-in, then approve or decline ----------
const login = $('#login-form');
if (login) {
  const dash = $('#dashboard'), live = $('#dash-live'), pendingFig = $('#fig-pending');
  login.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(login)) return;
    $('#login').hidden = true;
    dash.classList.add('is-open');
    $('#dash-title').focus();
  });
  $('#sign-out').addEventListener('click', () => {
    dash.classList.remove('is-open'); $('#login').hidden = false; login.reset(); $('#o-email').focus();
  });

  const recount = () => {
    const n = $$('#pending-table tbody tr[data-state="pending"]').length;
    pendingFig.textContent = n;
    $('#pending-empty').hidden = n > 0;
  };
  $('#pending-table').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const row = btn.closest('tr'), ref = row.dataset.ref, act = btn.dataset.act;
    const state = act === 'undo' ? 'pending' : act;
    const label = { pending: 'Pending', approved: 'Approved', declined: 'Declined' }[state];
    row.dataset.state = state;
    $('.cell-status', row).innerHTML = `<span class="status status--${state}">${$('#icon-' + state).innerHTML}${label}</span>`;
    $('.cell-act', row).innerHTML = state === 'pending'
      ? '<div class="actions"><button class="btn btn--sm btn--primary" type="button" data-act="approved">Approve</button><button class="btn btn--sm" type="button" data-act="declined">Decline</button></div>'
      : '<button class="btn btn--sm" type="button" data-act="undo">Undo</button>';
    live.textContent = state === 'pending' ? `${ref} is pending again.` : `${ref} ${label.toLowerCase()}. Undo is next to it.`;
    $('button', $('.cell-act', row)).focus();
    recount();
  });
  recount();
}

// ---------- Photo slots: swap in the org's own files later without touching layout ----------
window.hallmarkSlots = (m) => { for (const [k, v] of Object.entries(m)) { const s = document.querySelector(`[data-slot="${k}"]`); if (!s) continue; const im = new Image(); im.src = typeof v === 'string' ? v : v.src; im.alt = (typeof v === 'object' && v.alt) || s.dataset.alt || ''; s.querySelectorAll(':scope > img').forEach((o) => o.remove()); s.prepend(im); } };
document.querySelectorAll('[data-slot] img').forEach((i) => { if (i.complete && !i.naturalWidth) i.remove(); else i.addEventListener('error', () => i.remove(), { once: true }); });
