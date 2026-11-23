// ==========================================================
// PUP Hygears portal prototype, "Ink" direction
// Page states only (menus, filters, form checks, sample results).
// Nothing here sends data anywhere. On the real site PHP does that.
// Each section only runs if its form or element is on the page.
// ==========================================================

// ---------- Small helpers used by several pages ----------

// Reads ?item=dmm style values from the address bar
var params = new URLSearchParams(window.location.search);

// Icons for the status tags (the same SVGs as in the HTML)
var ICONS = {
  check: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>',
  clock: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>',
  x: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>'
};

// Builds a status tag: a word plus an icon, never colour alone
function makeTag(state) {
  var tags = {
    pending: ['tag--wait', 'clock', 'Pending'],
    approved: ['tag--on', 'check', 'Approved'],
    declined: ['tag--out', 'x', 'Declined'],
    accepted: ['tag--on', 'check', 'Accepted'],
    returned: ['tag--on', 'check', 'Returned']
  };
  var t = tags[state];
  return '<span class="tag ' + t[0] + '">' + ICONS[t[1]] + t[2] + '</span>';
}

// Stops typed text from being read as HTML (same job as PHP's htmlspecialchars)
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// "2026-11-24" becomes "24 Nov 2026"
function formatDate(iso) {
  if (!iso) return 'None, consumable';
  return new Date(iso + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Today's date as "YYYY-MM-DD" in local time
function todayISO() {
  var d = new Date();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + month + '-' + day;
}

// Builds the label/value rows inside a slip
function slipRows(pairs) {
  var html = '<dl class="slip__rows">';
  for (var i = 0; i < pairs.length; i++) {
    html += '<div><dt>' + pairs[i][0] + '</dt><dd>' + escapeHtml(pairs[i][1]) + '</dd></div>';
  }
  return html + '</dl>';
}

// Saves sent requests in this browser so Track request can find them.
// try/catch because some browsers block storage on file:// pages.
function loadRequests() {
  try { return JSON.parse(localStorage.getItem('hyg-requests') || '{}'); } catch (err) { return {}; }
}
function saveRequest(ref, data) {
  try {
    var all = loadRequests();
    all[ref] = data;
    localStorage.setItem('hyg-requests', JSON.stringify(all));
  } catch (err) { /* not saved, the prototype still works */ }
}

// ---------- Phone menu ----------
var menuButton = document.querySelector('.menu-toggle');
var navLinks = document.getElementById('nav-links');
if (menuButton) {
  menuButton.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', isOpen);
  });
}

// ---------- Form validation ----------
// Uses the browser's built-in checks (required, pattern, type="email")
// and shows our own message under each field. Messages live in
// data-req (field empty) and data-bad (wrong format) in the HTML.
function validateForm(form) {
  var firstBad = null;
  for (var i = 0; i < form.elements.length; i++) {
    var field = form.elements[i];
    if (!field.id || field.disabled || !field.willValidate || field.type === 'submit') continue;

    var message = '';
    if (field.validity.valueMissing) {
      message = field.dataset.req || 'This field is required.';
    } else if (!field.validity.valid) {
      message = field.dataset.bad || 'Check this value.';
    } else {
      message = extraCheck(field, form);
    }

    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    var errorBox = document.getElementById(field.id + '-err');
    if (errorBox) errorBox.textContent = message;
    if (message && !firstBad) firstBad = field;
  }
  if (firstBad) firstBad.focus();
  return firstBad === null;
}

// Checks the browser can't do alone
function extraCheck(field, form) {
  if (field.id === 'r-qty' && field.max && Number(field.value) > Number(field.max)) {
    return 'Only ' + field.max + ' available right now.';
  }
  if (field.id === 'r-return' && field.value && form.elements.pickup.value && field.value < form.elements.pickup.value) {
    return field.dataset.bad;
  }
  return '';
}

// No date field accepts a day in the past
var dateFields = document.querySelectorAll('input[type="date"]');
for (var d = 0; d < dateFields.length; d++) dateFields[d].min = todayISO();

// ---------- Home: the reservation counter ----------
var counter = document.getElementById('counter');
if (counter) {
  var counterItem = document.getElementById('c-item');
  var counterHint = document.getElementById('c-item-hint');

  // Show how many are on the shelf for the picked item
  counterItem.addEventListener('change', function () {
    var option = counterItem.options[counterItem.selectedIndex];
    if (!counterItem.value) {
      counterHint.textContent = 'Pick an item to see how many are on the shelf.';
      return;
    }
    document.getElementById('c-qty').max = option.dataset.available;
    var typeText = option.dataset.type === 'tool' ? 'Tools come back by a return date.' : 'Consumables are yours to use up.';
    counterHint.textContent = option.dataset.available + ' on the shelf now. ' + typeText;
  });

  // The counter sends you to the full form on Tools; it needs an item first
  counter.addEventListener('submit', function (e) {
    if (!counterItem.value) {
      e.preventDefault();
      counterItem.setAttribute('aria-invalid', 'true');
      document.getElementById('c-item-err').textContent = 'Choose an item first.';
      counterItem.focus();
    }
  });
}

// ---------- Tools: search and filters ----------
var filters = document.getElementById('filters');
if (filters) {
  var itemsTable = document.getElementById('items');
  var noMatch = document.getElementById('no-match');
  var countText = document.getElementById('count');
  var itemRows = itemsTable.querySelectorAll('tbody tr');

  // Hide every row that doesn't match the search, category and type
  function applyFilters() {
    var search = document.getElementById('q').value.trim().toLowerCase();
    var category = document.getElementById('cat').value;
    var type = filters.elements.type.value;
    var shown = 0;

    for (var i = 0; i < itemRows.length; i++) {
      var row = itemRows[i];
      var matches = (search === '' || row.dataset.name.indexOf(search) !== -1) &&
                    (category === '' || row.dataset.category === category) &&
                    (type === '' || row.dataset.type === type);
      row.hidden = !matches;
      if (matches) shown++;
    }

    itemsTable.hidden = shown === 0;
    noMatch.hidden = shown !== 0;
    countText.textContent = shown === itemRows.length
      ? 'Showing all ' + itemRows.length + ' items.'
      : 'Showing ' + shown + ' of ' + itemRows.length + ' items.';
  }

  filters.addEventListener('input', applyFilters);
  filters.addEventListener('change', applyFilters);
  filters.addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('clear-filters').addEventListener('click', function () {
    filters.reset();
    applyFilters();
    document.getElementById('q').focus();
  });
}

// ---------- Tools: reserve form ----------
var reserveForm = document.getElementById('reserve-form');
if (reserveForm) {
  var itemSelect = document.getElementById('r-item');
  var qtyInput = document.getElementById('r-qty');
  var returnInput = document.getElementById('r-return');
  var reserveDone = document.getElementById('reserve-done');

  // When the item changes: set the max quantity, and switch off
  // the return date for consumables (they are used up)
  function syncItem() {
    var option = itemSelect.options[itemSelect.selectedIndex];
    var isConsumable = option.dataset.type === 'consumable';

    if (itemSelect.value) {
      qtyInput.max = option.dataset.available;
      document.getElementById('r-qty-hint').textContent = 'Up to ' + option.dataset.available + '.';
    } else {
      qtyInput.removeAttribute('max');
      document.getElementById('r-qty-hint').textContent = 'Pick an item first.';
    }

    returnInput.disabled = isConsumable;
    returnInput.required = !isConsumable;
    if (isConsumable) {
      returnInput.value = '';
      returnInput.setAttribute('aria-invalid', 'false');
      document.getElementById('r-return-err').textContent = '';
    }
    document.getElementById('r-return-hint').textContent = isConsumable
      ? 'Consumables are used up, so no return date.'
      : 'Tools only. On or after the pickup date.';
  }

  itemSelect.addEventListener('change', syncItem);
  document.getElementById('r-pickup').addEventListener('change', function () {
    returnInput.min = this.value || todayISO();
  });

  // Fill in what the home counter or a row's Reserve link passed along
  if (params.get('item')) { itemSelect.value = params.get('item'); syncItem(); }
  if (params.get('qty')) qtyInput.value = params.get('qty');
  if (params.get('pickup')) document.getElementById('r-pickup').value = params.get('pickup');

  // Reserve buttons in the table pick the item and jump to the form
  var reserveLinks = document.querySelectorAll('[data-reserve]');
  for (var r = 0; r < reserveLinks.length; r++) {
    reserveLinks[r].addEventListener('click', function (e) {
      e.preventDefault();
      itemSelect.value = this.dataset.reserve;
      syncItem();
      document.getElementById('reserve').scrollIntoView();
      document.getElementById('r-name').focus({ preventScroll: true });
    });
  }

  reserveForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(reserveForm)) return;

    var f = reserveForm.elements;
    // Sample reference number like HYG-2026-0142 (the database makes the real one)
    var ref = 'HYG-' + new Date().getFullYear() + '-' + String(150 + Math.floor(Math.random() * 9850)).padStart(4, '0');
    var itemName = itemSelect.options[itemSelect.selectedIndex].text.replace(/ \(.*\)$/, '');
    var data = { item: itemName, qty: f.qty.value, pickup: f.pickup.value, ret: f['return'].value };
    saveRequest(ref, data);

    reserveDone.innerHTML =
      '<div class="slip__title"><p class="slip__name">Request recorded in this preview</p>' + makeTag('pending') + '</div>' +
      '<p class="note">Your reference number</p><p class="slip__ref">' + ref + '</p>' +
      slipRows([['Item', data.item], ['Quantity', data.qty], ['Pickup', formatDate(data.pickup)], ['Return', formatDate(data.ret)], ['Name', f.name.value.trim()]]) +
      '<p class="note">Prototype: nothing was sent. On the live site this request goes to the officers, and the number works on Track request.</p>' +
      '<div class="slip__foot"><a class="btn" href="track.html?ref=' + ref + '">Track request</a>' +
      '<button class="btn btn--quiet" type="button" id="reserve-again">Reserve another</button></div>';
    reserveForm.hidden = true;
    reserveDone.hidden = false;
    reserveDone.focus();

    document.getElementById('reserve-again').addEventListener('click', function () {
      reserveForm.reset();
      syncItem();
      reserveDone.hidden = true;
      reserveForm.hidden = false;
      document.getElementById('r-name').focus();
    });
  });
}

// ---------- Track request ----------
var trackForm = document.getElementById('track-form');
if (trackForm) {
  // Three sample requests, one for each state
  var SAMPLES = {
    'HYG-2026-0142': { state: 'pending', item: 'Digital multimeter', qty: 1, pickup: '2026-11-24', ret: '2026-11-27', note: 'No officer has reviewed it yet. Check again before your pickup date.' },
    'HYG-2026-0137': { state: 'approved', item: 'Cordless drill', qty: 1, pickup: '2026-11-23', ret: '2026-11-25', note: 'Approved. Pick it up on your pickup date. The pickup room is still to be confirmed by the officers.' },
    'HYG-2026-0129': { state: 'declined', item: 'Heat gun', qty: 1, pickup: '2026-11-22', ret: '2026-11-24', note: 'Declined. Officer’s note (sample): both heat guns are out until 28 Nov. Try a later date.' }
  };
  var refInput = document.getElementById('ref');
  var trackResult = document.getElementById('track-result');

  function runTrack() {
    var ref = refInput.value.trim().toUpperCase();
    refInput.value = ref;
    trackResult.innerHTML = '';
    if (!validateForm(trackForm)) return;

    if (!/^HYG-\d{4}-\d{4}$/.test(ref)) {
      refInput.setAttribute('aria-invalid', 'true');
      document.getElementById('ref-err').textContent = 'Write it like HYG-2026-0142: HYG, the year, then four digits.';
      refInput.focus();
      return;
    }

    var request = SAMPLES[ref];
    var saved = loadRequests()[ref];
    if (!request && saved) {
      request = { state: 'pending', item: saved.item, qty: saved.qty, pickup: saved.pickup, ret: saved.ret, note: 'Saved in this browser by the prototype. No officer has reviewed it yet.' };
    }

    if (request) {
      trackResult.innerHTML = '<div class="slip"><div class="slip__title"><p class="slip__ref">' + ref + '</p>' + makeTag(request.state) + '</div>' +
        '<p>' + escapeHtml(request.note) + '</p>' +
        slipRows([['Item', request.item], ['Quantity', request.qty], ['Pickup', formatDate(request.pickup)], ['Return', formatDate(request.ret)]]) + '</div>';
    } else {
      trackResult.innerHTML = '<div class="slip"><p class="slip__name">No request matches ' + escapeHtml(ref) + '</p>' +
        '<p>Check the number on your reservation slip. Sample numbers to try are listed below.</p></div>';
    }
  }

  trackForm.addEventListener('submit', function (e) { e.preventDefault(); runTrack(); });
  if (params.get('ref')) { refInput.value = params.get('ref'); runTrack(); }
}

// ---------- Join ----------
var joinForm = document.getElementById('join-form');
if (joinForm) {
  var joinDone = document.getElementById('join-done');
  joinForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(joinForm)) return;

    var f = joinForm.elements;
    joinDone.innerHTML =
      '<div class="slip__title"><p class="slip__name">Application recorded in this preview</p>' + makeTag('pending') + '</div>' +
      slipRows([['Name', f.name.value.trim()], ['Student number', f.student_number.value.trim()], ['Course', f.course.value], ['Year and section', f.year_section.value.trim()], ['Committee', f.committee.value]]) +
      '<p class="note">Prototype: nothing was sent. On the live site this goes to the officers, who reply to ' + escapeHtml(f.email.value.trim()) + '.</p>' +
      '<div class="slip__foot"><button class="btn btn--quiet" type="button" id="join-edit">Edit application</button></div>';
    joinForm.hidden = true;
    joinDone.hidden = false;
    joinDone.focus();

    document.getElementById('join-edit').addEventListener('click', function () {
      joinDone.hidden = true;
      joinForm.hidden = false;
      document.getElementById('j-name').focus();
    });
  });
}

// ---------- Officer desk ----------
var loginForm = document.getElementById('login-form');
if (loginForm) {
  var mainArea = document.getElementById('main');

  function signIn(email) {
    document.getElementById('who').textContent = email;
    mainArea.classList.add('is-signed-in');
  }

  // Stay signed in while this tab is open (PHP uses $_SESSION for this)
  try {
    if (sessionStorage.getItem('hyg-officer')) signIn(sessionStorage.getItem('hyg-officer'));
  } catch (err) { /* no session storage */ }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(loginForm)) return;
    var email = loginForm.elements.email.value.trim();
    try { sessionStorage.setItem('hyg-officer', email); } catch (err) { /* not kept */ }
    signIn(email);
    document.getElementById('dash-title').focus();
  });

  document.getElementById('sign-out').addEventListener('click', function () {
    try { sessionStorage.removeItem('hyg-officer'); } catch (err) { /* nothing to remove */ }
    mainArea.classList.remove('is-signed-in');
    loginForm.reset();
    document.getElementById('o-email').focus();
  });

  // Days late, counted from today's date
  var dueCells = document.querySelectorAll('[data-due]');
  for (var i = 0; i < dueCells.length; i++) {
    var msLate = new Date(todayISO()) - new Date(dueCells[i].dataset.due);
    dueCells[i].textContent = Math.max(0, Math.round(msLate / 86400000));
  }

  // Update the counts at the top and show "nothing left" rows when a table is done
  function recount() {
    var tables = document.querySelectorAll('[data-table]');
    for (var t = 0; t < tables.length; t++) {
      var open = tables[t].querySelectorAll('tr[data-row]:not(.row-done)').length;
      var countCell = document.querySelector('[data-count="' + tables[t].dataset.table + '"]');
      if (countCell) countCell.textContent = open;
      var emptyRow = tables[t].querySelector('.empty-row');
      if (emptyRow) emptyRow.hidden = open > 0;
    }
  }

  // One click handler for every row button (approve, decline, accept,
  // mark returned and undo). The old buttons are kept so Undo can restore them.
  var STATE_FOR = { approve: 'approved', decline: 'declined', accept: 'accepted', returned: 'returned' };
  document.querySelector('.dash').addEventListener('click', function (e) {
    var button = e.target.closest('button[data-act]');
    if (!button) return;
    var row = button.closest('tr');
    var actCell = row.querySelector('.act');
    var stateCell = row.querySelector('.state');

    if (button.dataset.act === 'undo') {
      actCell.innerHTML = row.dataset.prevAct;
      stateCell.innerHTML = row.dataset.prevState;
      row.classList.remove('row-done');
      actCell.querySelector('button').focus();
    } else {
      row.dataset.prevAct = actCell.innerHTML;
      row.dataset.prevState = stateCell.innerHTML;
      stateCell.innerHTML = makeTag(STATE_FOR[button.dataset.act]);
      row.classList.add('row-done');
      // The label tells screen reader users what Undo will reverse
      actCell.innerHTML = '<button class="btn btn--quiet btn--sm" type="button" data-act="undo" aria-label="Undo, marked ' + STATE_FOR[button.dataset.act] + '">Undo</button>';
      actCell.querySelector('button').focus();
    }
    recount();
  });
}
