// ==========================================================
// PUP Hygears portal prototype, "Almanac" direction
// Page states only (filters, form checks, sample results).
// Nothing here talks to a server. In the PHP + MySQL build, every
// "preview" part below becomes a real form submit or query.
// Each section only runs if its form is on the page.
// ==========================================================

// ---------- Small helpers used by several pages ----------

// Reads ?item=... and ?ref=... values from the address bar
var params = new URLSearchParams(window.location.search);

// Key used to remember the last request made in this browser
var LAST_REF = 'hyg-last-request';

// Status icons (same SVGs as in the HTML), always shown with a word
var ICONS = {
  pending: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  approved: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  declined: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
};
var LABELS = { pending: 'Pending', approved: 'Approved', declined: 'Declined' };

function statusHtml(state) {
  return '<span class="status status--' + state + '">' + ICONS[state] + LABELS[state] + '</span>';
}

// Today's date as "YYYY-MM-DD" in local time
function today() {
  var d = new Date();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + month + '-' + day;
}

// ---------- Form errors ----------

// Shows (or clears) the message under one field
function setError(field, message) {
  var box = document.getElementById(field.id + '-error');
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (box) box.textContent = message;
}

// Checks every field that has a data-error message.
// extraCheck (optional) handles rules the browser can't check alone.
function validateForm(form, extraCheck) {
  var fields = form.querySelectorAll('[data-error]');
  var firstBad = null;
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var message = field.checkValidity() ? '' : field.dataset.error;
    if (!message && extraCheck) message = extraCheck(field);
    setError(field, message);
    if (message && !firstBad) firstBad = field;
  }
  if (firstBad) firstBad.focus();
  return firstBad === null;
}

// Clear a field's error as soon as the user fixes it
var checkedFields = document.querySelectorAll('[data-error]');
for (var c = 0; c < checkedFields.length; c++) {
  checkedFields[c].addEventListener('input', function () {
    if (this.getAttribute('aria-invalid') === 'true' && this.checkValidity()) setError(this, '');
  });
}

// Remembers the last request in this browser. try/catch because
// some browsers block storage on file:// pages.
function saveLastRequest(data) {
  try { localStorage.setItem(LAST_REF, JSON.stringify(data)); } catch (err) { /* not saved */ }
}
function loadLastRequest() {
  try { return JSON.parse(localStorage.getItem(LAST_REF) || 'null'); } catch (err) { return null; }
}

// ---------- Tools catalog: search, category and type filters ----------
var catalog = document.getElementById('catalog');
if (catalog) {
  var searchBox = document.getElementById('f-q');
  var categorySelect = document.getElementById('f-cat');
  var itemRows = catalog.querySelectorAll('tbody tr[data-name]');
  var emptyRow = document.getElementById('catalog-empty');
  var countText = document.getElementById('catalog-count');

  // The header search box sends ?q=... here
  if (params.get('q')) searchBox.value = params.get('q');

  // Hide every row that doesn't match all three filters
  function applyFilters() {
    var term = searchBox.value.trim().toLowerCase();
    var type = document.querySelector('input[name="type"]:checked').value;
    var shown = 0;
    for (var i = 0; i < itemRows.length; i++) {
      var row = itemRows[i];
      var matches = row.dataset.name.indexOf(term) !== -1 &&
                    (categorySelect.value === '' || row.dataset.cat === categorySelect.value) &&
                    (type === 'all' || row.dataset.type === type);
      row.hidden = !matches;
      if (matches) shown++;
    }
    emptyRow.hidden = shown > 0;
    countText.textContent = 'Showing ' + shown + ' of ' + itemRows.length + ' items';
  }

  document.getElementById('f-form').addEventListener('input', applyFilters);
  document.getElementById('f-form').addEventListener('change', applyFilters);
  document.getElementById('f-form').addEventListener('submit', function (e) { e.preventDefault(); applyFilters(); });
  document.getElementById('catalog-clear').addEventListener('click', function () {
    searchBox.value = '';
    categorySelect.value = '';
    document.getElementById('t-all').checked = true;
    applyFilters();
    searchBox.focus();
  });
  applyFilters();
}

// ---------- Reserve: validation and the reference number ----------
var reserveForm = document.getElementById('reserve-form');
if (reserveForm) {
  var itemSelect = document.getElementById('r-item');
  var qtyInput = document.getElementById('r-qty');
  var pickupInput = document.getElementById('r-pickup');
  var returnInput = document.getElementById('r-return');
  var reserveDone = document.getElementById('reserve-done');

  pickupInput.min = today();
  returnInput.min = today();
  if (params.get('item')) itemSelect.value = params.get('item');

  function selectedOption() {
    return itemSelect.options[itemSelect.selectedIndex];
  }

  // When the item changes: set the max quantity, and switch off the
  // return date for consumables (they are used up, not returned)
  function syncItem() {
    var option = selectedOption();
    var isConsumable = option.dataset.type === 'consumable';
    qtyInput.max = option.dataset.available || 1;
    document.getElementById('r-qty-hint').textContent = itemSelect.value
      ? option.dataset.available + ' available now.'
      : 'Choose an item to see how many are available.';
    returnInput.disabled = isConsumable;
    returnInput.required = !isConsumable;
    if (isConsumable) { returnInput.value = ''; setError(returnInput, ''); }
    document.getElementById('r-return-hint').textContent = isConsumable
      ? 'Consumables are used up, so there is no return date.'
      : 'Tools come back by this date.';
  }
  itemSelect.addEventListener('change', syncItem);
  pickupInput.addEventListener('change', function () { returnInput.min = pickupInput.value || today(); });
  syncItem();

  reserveForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = validateForm(reserveForm, function (field) {
      if (field === qtyInput && Number(qtyInput.value) > Number(qtyInput.max)) return 'Only ' + qtyInput.max + ' available now. Lower the quantity.';
      if (field === pickupInput && pickupInput.value < today()) return 'Choose a pickup date from today on.';
      if (field === returnInput && returnInput.value && returnInput.value < pickupInput.value) return 'The return date must be on or after the pickup date.';
      return '';
    });
    if (!ok) return;

    // Preview only: a random number in the HYG-YYYY-NNNN format (the database assigns the real one)
    var ref = 'HYG-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    var itemName = selectedOption().textContent.trim();
    saveLastRequest({ ref: ref, item: itemName + ', quantity ' + qtyInput.value });

    document.getElementById('done-ref').textContent = ref;
    document.getElementById('done-item').textContent = itemName + ', quantity ' + qtyInput.value;
    document.getElementById('done-track').href = 'track.html?ref=' + encodeURIComponent(ref);
    reserveForm.hidden = true;
    reserveDone.hidden = false;
    reserveDone.focus();
  });

  document.getElementById('reserve-again').addEventListener('click', function () {
    reserveForm.reset();
    syncItem();
    reserveDone.hidden = true;
    reserveForm.hidden = false;
    document.getElementById('r-name').focus();
  });
}

// ---------- Track: three example states, plus the request made in this browser ----------
var trackForm = document.getElementById('track-form');
if (trackForm) {
  var refInput = document.getElementById('t-ref');
  var trackResult = document.getElementById('track-result');
  var EXAMPLES = {
    'HYG-2026-0142': { state: 'pending', item: 'Digital multimeter, quantity 1', next: 'Waiting for an officer. Check again before your pickup date.' },
    'HYG-2026-0139': { state: 'approved', item: 'Soldering station, quantity 1', next: 'Approved. Collect it from the officers on your pickup date.' },
    'HYG-2026-0131': { state: 'declined', item: 'Cordless drill, quantity 1', next: 'Declined: none left on that pickup date. Try another date or item.' }
  };

  function lookUp() {
    refInput.value = refInput.value.trim().toUpperCase();
    if (!validateForm(trackForm)) { trackResult.hidden = true; return; }

    var found = EXAMPLES[refInput.value];
    var last = loadLastRequest();
    if (!found && last && last.ref === refInput.value) {
      found = { state: 'pending', item: last.item, next: 'Waiting for an officer. This preview never sends it, so it stays pending.' };
    }

    trackResult.hidden = false;
    document.getElementById('tr-ref').textContent = refInput.value;
    if (found) {
      document.getElementById('tr-status').innerHTML = statusHtml(found.state);
      document.getElementById('tr-item').textContent = found.item;
      document.getElementById('tr-next').textContent = found.next;
    } else {
      document.getElementById('tr-status').innerHTML = '';
      document.getElementById('tr-item').textContent = '';
      document.getElementById('tr-next').textContent = 'No request has that number in this preview. Check the number on your confirmation, or try one of the examples.';
    }
  }

  trackForm.addEventListener('submit', function (e) { e.preventDefault(); lookUp(); });
  if (params.get('ref')) { refInput.value = params.get('ref'); lookUp(); }
}

// ---------- Join ----------
var joinForm = document.getElementById('join-form');
if (joinForm) {
  joinForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = document.getElementById('join-status');
    if (!validateForm(joinForm)) { status.textContent = ''; return; }
    status.textContent = 'Every field checks out. This is a preview, so nothing was sent; on the live site the application goes to the officers.';
  });
}

// ---------- Officer: sign-in, then approve or decline ----------
var loginForm = document.getElementById('login-form');
if (loginForm) {
  var dashboard = document.getElementById('dashboard');
  var liveMessage = document.getElementById('dash-live');

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(loginForm)) return;
    document.getElementById('login').hidden = true;
    dashboard.classList.add('is-open');
    document.getElementById('dash-title').focus();
  });

  document.getElementById('sign-out').addEventListener('click', function () {
    dashboard.classList.remove('is-open');
    document.getElementById('login').hidden = false;
    loginForm.reset();
    document.getElementById('o-email').focus();
  });

  // Update the pending count and show the empty message when none are left
  function recount() {
    var pending = document.querySelectorAll('#pending-table tbody tr[data-state="pending"]').length;
    document.getElementById('fig-pending').textContent = pending;
    document.getElementById('pending-empty').hidden = pending > 0;
  }

  // One click handler for Approve, Decline and Undo on every row
  document.getElementById('pending-table').addEventListener('click', function (e) {
    var button = e.target.closest('button[data-act]');
    if (!button) return;
    var row = button.closest('tr');
    var ref = row.dataset.ref;
    var state = button.dataset.act === 'undo' ? 'pending' : button.dataset.act;

    row.dataset.state = state;
    row.querySelector('.cell-status').innerHTML = statusHtml(state);
    var actCell = row.querySelector('.cell-act');
    if (state === 'pending') {
      actCell.innerHTML = '<div class="actions"><button class="btn btn--sm btn--primary" type="button" data-act="approved">Approve</button>' +
        '<button class="btn btn--sm" type="button" data-act="declined">Decline</button></div>';
      liveMessage.textContent = ref + ' is pending again.';
    } else {
      actCell.innerHTML = '<button class="btn btn--sm" type="button" data-act="undo">Undo</button>';
      liveMessage.textContent = ref + ' ' + LABELS[state].toLowerCase() + '. Undo is next to it.';
    }
    actCell.querySelector('button').focus();
    recount();
  });
  recount();
}
