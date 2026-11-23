/* =========================================================
   Hygears Web Portal: small vanilla JavaScript for the prototype.
   Each section only runs if its page elements exist, so this one
   file is linked from every page. In the real site, PHP will do the
   saving and checking; this file only shows the states.
   ========================================================= */

/* ---------- Small icons reused in messages (same as in the HTML) ---------- */
var ICON_CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>';
var ICON_CLOCK = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
var ICON_X = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>';


/* ---------- 1. Phone menu: open and close the nav ---------- */
var menuBtn = document.querySelector('.menu-btn');
var siteNav = document.getElementById('site-nav');

if (menuBtn && siteNav) {
  menuBtn.addEventListener('click', function () {
    var isOpen = siteNav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menuBtn.textContent = isOpen ? 'Close' : 'Menu';
  });

  // Escape closes the open menu and puts focus back on the button
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
      menuBtn.click();
      menuBtn.focus();
    }
  });
}


/* ---------- 2. Shared form checking ----------
   showError / clearError switch the red border and the message under
   a field. checkField returns true when one field is valid.          */
function showError(input) {
  var field = input.closest('.field');
  if (field) field.classList.add('has-error');
  input.setAttribute('aria-invalid', 'true');
}

function clearError(input) {
  var field = input.closest('.field');
  if (field) field.classList.remove('has-error');
  input.removeAttribute('aria-invalid');
}

// PUP student number, e.g. 2024-00123-MN-0
var STUDENT_NO = /^\d{4}-\d{5}-[A-Z]{2}-\d$/;
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkField(input) {
  var value = input.value.trim();
  if (input.required && value === '') return false;
  if (input.type === 'email' && value !== '' && !EMAIL.test(value)) return false;
  if (input.dataset.check === 'studno' && !STUDENT_NO.test(value.toUpperCase())) return false;
  if (input.minLength > 0 && value.length < input.minLength) return false;
  return true;
}

/* Checks every required text box, select and textarea in a form.
   extraCheck (optional) runs page-specific rules and returns false on error.
   Returns true when the whole form is valid.                                */
function validateForm(form, extraCheck) {
  var ok = true;
  var firstBad = null;
  var inputs = form.querySelectorAll('input:not([type=radio]):not([type=checkbox]), select, textarea');

  for (var i = 0; i < inputs.length; i++) {
    if (checkField(inputs[i])) {
      clearError(inputs[i]);
    } else {
      showError(inputs[i]);
      ok = false;
      if (!firstBad) firstBad = inputs[i];
    }
  }

  if (extraCheck) {
    var bad = extraCheck();
    if (bad) { ok = false; if (!firstBad) firstBad = bad; }
  }

  // Show the summary box at the top and move focus to the first problem
  var alertBox = form.querySelector('.form-alert');
  if (alertBox) alertBox.classList.toggle('is-visible', !ok);
  if (firstBad) firstBad.focus();
  return ok;
}

// Clear a field's error as soon as the user fixes it
document.addEventListener('input', function (e) {
  if (e.target.closest && e.target.closest('.field.has-error') && checkField(e.target)) {
    clearError(e.target);
  }
});

// Today's date as yyyy-mm-dd, for the date inputs
function todayString() {
  var d = new Date();
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}


/* ---------- 3. Tools page: search and filters ---------- */
var board = document.getElementById('board');

if (board) {
  var searchBox = document.getElementById('search');
  var categorySelect = document.getElementById('category');
  var availableOnly = document.getElementById('available-only');
  var chips = document.querySelectorAll('.chip');
  var countText = document.getElementById('result-count');
  var emptyState = document.getElementById('empty-state');
  var items = board.querySelectorAll('.item');
  var currentType = 'all';

  // Show only the items that match every filter
  function applyFilters() {
    var word = searchBox.value.trim().toLowerCase();
    var category = categorySelect.value;
    var shown = 0;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var matches =
        item.dataset.name.indexOf(word) !== -1 &&
        (category === 'all' || item.dataset.category === category) &&
        (currentType === 'all' || item.dataset.type === currentType) &&
        (!availableOnly.checked || Number(item.dataset.available) > 0);

      item.classList.toggle('is-hidden', !matches);
      if (matches) shown++;
    }

    countText.textContent = shown === items.length
      ? 'Showing all ' + items.length + ' items'
      : 'Showing ' + shown + ' of ' + items.length + ' items';
    emptyState.classList.toggle('is-visible', shown === 0);
  }

  // Type chips work like radio buttons: one pressed at a time
  for (var c = 0; c < chips.length; c++) {
    chips[c].addEventListener('click', function () {
      for (var j = 0; j < chips.length; j++) chips[j].setAttribute('aria-pressed', 'false');
      this.setAttribute('aria-pressed', 'true');
      currentType = this.dataset.type;
      applyFilters();
    });
  }

  searchBox.addEventListener('input', applyFilters);
  categorySelect.addEventListener('change', applyFilters);
  availableOnly.addEventListener('change', applyFilters);

  document.getElementById('clear-filters').addEventListener('click', function () {
    searchBox.value = '';
    categorySelect.value = 'all';
    availableOnly.checked = false;
    chips[0].click(); // "All" chip, which also re-runs the filter
    searchBox.focus();
  });
}


/* ---------- 4. Reserve page ---------- */
var reserveForm = document.getElementById('reserve-form');

if (reserveForm) {
  var itemSelect = document.getElementById('item');
  var qtyInput = document.getElementById('quantity');
  var qtyHint = document.getElementById('quantity-hint');
  var pickupInput = document.getElementById('pickup');
  var returnInput = document.getElementById('return');
  var returnField = document.getElementById('return-field');

  pickupInput.min = todayString();
  returnInput.min = todayString();

  // When the item changes: update the quantity limit and hide return date for consumables
  function updateItemInfo() {
    var option = itemSelect.options[itemSelect.selectedIndex];
    if (!option || option.value === '') {
      qtyHint.textContent = 'Choose an item first to see how many are available.';
      return;
    }
    var available = Number(option.dataset.available);
    var isTool = option.dataset.type === 'tool';
    qtyInput.max = available;
    qtyHint.textContent = available + (isTool ? ' available now.' : ' in stock.') + ' Request up to ' + available + '.';
    returnField.hidden = !isTool;
    returnInput.required = isTool;
  }

  // Pre-select the item from the link, e.g. reserve.html?item=soldering-station
  var params = new URLSearchParams(window.location.search);
  if (params.get('item')) itemSelect.value = params.get('item');
  updateItemInfo();
  itemSelect.addEventListener('change', updateItemInfo);
  pickupInput.addEventListener('change', function () { returnInput.min = pickupInput.value; });

  // Rules that need more than "is it filled in"
  function reserveRules() {
    var firstBad = null;
    var qty = Number(qtyInput.value);
    if (!(qty >= 1 && qty <= Number(qtyInput.max || 1))) { showError(qtyInput); firstBad = firstBad || qtyInput; }
    if (pickupInput.value && pickupInput.value < todayString()) { showError(pickupInput); firstBad = firstBad || pickupInput; }
    if (returnInput.required && returnInput.value && returnInput.value < pickupInput.value) { showError(returnInput); firstBad = firstBad || returnInput; }
    return firstBad;
  }

  reserveForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(reserveForm, reserveRules)) return;

    // Prototype: always the sample number. PHP will create the real one.
    var success = document.getElementById('reserve-success');
    reserveForm.hidden = true;
    document.getElementById('reserve-route').closest('aside').hidden = true;
    success.hidden = false;
    success.focus();
    window.scrollTo(0, 0);
  });
}


/* ---------- 5. Track page ---------- */
var trackForm = document.getElementById('track-form');

// Sample requests (the real ones come from the database)
var SAMPLE_REQUESTS = {
  'HYG-2026-0142': { status: 'Pending',  item: 'Soldering station', qty: 1, pickup: 'Nov 25, 2026', ret: 'Nov 27, 2026', sent: 'Nov 23, 2026' },
  'HYG-2026-0138': { status: 'Approved', item: 'Digital multimeter', qty: 1, pickup: 'Nov 24, 2026', ret: 'Nov 26, 2026', sent: 'Nov 21, 2026' },
  'HYG-2026-0131': { status: 'Declined', item: 'Cordless drill', qty: 1, pickup: 'Nov 22, 2026', ret: 'Nov 23, 2026', sent: 'Nov 19, 2026',
                     reason: 'None available on those dates. Try other dates.' }
};

// Builds one stop of the route line (same markup as in the HTML pages)
function stopHTML(stateClass, mark, name, stateWord) {
  return '<li class="' + stateClass + '"><span class="stop-mark" aria-hidden="true">' + mark + '</span>' +
         '<span class="stop-name">' + name + '</span><span class="stop-state">' + stateWord + '</span></li>';
}

function showRequest(ref) {
  var result = document.getElementById('track-result');
  var r = SAMPLE_REQUESTS[ref];

  if (!r) {
    result.innerHTML = '<div class="panel panel-white"><p class="status">' + ICON_X + ' Not found</p>' +
      '<h2>No request with that number</h2><p class="muted">Check the number in your confirmation. It looks like HYG-2026-0142.</p></div>';
    return;
  }

  var icon = r.status === 'Approved' ? ICON_CHECK : (r.status === 'Declined' ? ICON_X : ICON_CLOCK);
  var route, note;

  if (r.status === 'Pending') {
    route = stopHTML('is-done', ICON_CHECK, 'Reserved', 'Done') + stopHTML('is-current', '2', 'Officer review', 'You are here') +
            stopHTML('is-next', '3', 'Pick up', 'Next') + stopHTML('is-next', '4', 'Return', 'Later');
    note = '<p>An officer has not reviewed this yet. Check back later.</p>' +
           '<button type="button" class="btn btn-secondary" id="cancel-request">Cancel request</button>';
  } else if (r.status === 'Approved') {
    route = stopHTML('is-done', ICON_CHECK, 'Reserved', 'Done') + stopHTML('is-done', ICON_CHECK, 'Officer review', 'Approved') +
            stopHTML('is-current', '3', 'Pick up', 'You are here') + stopHTML('is-next', '4', 'Return', 'Next');
    note = '<p>Ready for pickup on ' + r.pickup + '. Bring this reference number to <span class="slot">pickup room to confirm</span>.</p>';
  } else {
    route = stopHTML('is-done', ICON_CHECK, 'Reserved', 'Done') + stopHTML('is-stopped', ICON_X, 'Officer review', 'Declined');
    note = '<p><strong>Reason:</strong> ' + r.reason + '</p><a class="btn btn-primary" href="tools.html">Reserve again</a>';
  }

  result.innerHTML =
    '<div class="panel">' +
      '<p class="status">' + icon + ' ' + r.status + '</p>' +
      '<p class="ref-number">' + ref + '</p>' +
      '<dl class="details"><dt>Item</dt><dd>' + r.item + ' &times; ' + r.qty + '</dd>' +
      '<dt>Pickup</dt><dd>' + r.pickup + '</dd><dt>Return</dt><dd>' + r.ret + '</dd>' +
      '<dt>Sent</dt><dd>' + r.sent + '</dd></dl>' +
      '<ol class="route">' + route + '</ol>' + note +
      ' <span class="sample-tag">Sample</span>' +
    '</div>';

  // Pending requests can be cancelled (confirm first, it cannot be undone)
  var cancelBtn = document.getElementById('cancel-request');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function () {
      if (confirm('Cancel request ' + ref + '? This cannot be undone.')) {
        result.innerHTML = '<div class="panel"><p class="status">' + ICON_X + ' Cancelled</p>' +
          '<p class="ref-number">' + ref + '</p><p>Your request was cancelled. The item is free for others.</p>' +
          '<a class="btn btn-primary" href="tools.html">Browse tools</a></div>';
      }
    });
  }
}

if (trackForm) {
  var refInput = document.getElementById('ref');

  // Check the typed number, then show its result
  function runTrack() {
    refInput.value = refInput.value.trim().toUpperCase();
    if (!/^HYG-\d{4}-\d{4}$/.test(refInput.value)) {
      showError(refInput);
      refInput.focus();
      return;
    }
    clearError(refInput);
    showRequest(refInput.value);
  }

  trackForm.addEventListener('submit', function (e) {
    e.preventDefault();
    runTrack();
  });

  // Sample buttons fill the box and search
  var sampleBtns = document.querySelectorAll('.sample-ref');
  for (var s = 0; s < sampleBtns.length; s++) {
    sampleBtns[s].addEventListener('click', function () {
      refInput.value = this.dataset.ref;
      runTrack();
    });
  }

  // Coming from the Reserve success or the home page box: track.html?ref=HYG-2026-0142
  var refParam = new URLSearchParams(window.location.search).get('ref');
  if (refParam) {
    refInput.value = refParam;
    runTrack();
  }
}


/* ---------- 6. Join page ---------- */
var joinForm = document.getElementById('join-form');

if (joinForm) {
  var committeeField = document.getElementById('committee-field');

  // Radio buttons need their own check: one must be chosen
  function committeeRule() {
    var chosen = joinForm.querySelector('input[name=committee]:checked');
    committeeField.classList.toggle('has-error', !chosen);
    return chosen ? null : joinForm.querySelector('input[name=committee]');
  }
  joinForm.addEventListener('change', function (e) {
    if (e.target.name === 'committee') committeeField.classList.remove('has-error');
  });

  joinForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(joinForm, committeeRule)) return;

    var fullName = document.getElementById('j-name').value.trim();
    document.getElementById('join-first-name').textContent = fullName.split(' ')[0];
    document.getElementById('join-email-out').textContent = document.getElementById('j-email').value.trim();

    var success = document.getElementById('join-success');
    joinForm.hidden = true;
    success.hidden = false;
    success.focus();
    window.scrollTo(0, 0);
  });
}


/* ---------- 7. Officer page: sign-in and dashboard actions ---------- */
var signinForm = document.getElementById('signin-form');

if (signinForm) {
  var signin = document.getElementById('signin');
  var dashboard = document.getElementById('dashboard');
  var announce = document.getElementById('dash-announce');

  // Prototype sign-in: any filled-in email and password works
  signinForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(signinForm)) return;
    signin.hidden = true;
    dashboard.hidden = false;
    document.getElementById('dash-title').focus();
  });

  document.getElementById('signout').addEventListener('click', function () {
    dashboard.hidden = true;
    signin.hidden = false;
    signinForm.reset();
    document.getElementById('o-email').focus();
  });

  // Update the four summary numbers from what is still waiting in each table
  function updateCounts() {
    document.getElementById('count-pending').textContent = document.querySelectorAll('#pending-table [data-decide]').length / 2;
    document.getElementById('count-overdue').textContent = document.querySelectorAll('#overdue-table [data-returned]').length;
    document.getElementById('count-apps').textContent = document.querySelectorAll('#apps-table [data-reviewed]').length;
  }

  // One click listener for all dashboard buttons
  dashboard.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var row = btn.closest('tr');
    var ref = row ? row.querySelector('td').textContent.trim() : '';

    if (btn.dataset.decide) {
      // Approve or Decline: write the new status with its icon, then remove the buttons
      var decision = btn.dataset.decide;
      row.querySelector('.row-status').innerHTML =
        '<span class="status">' + (decision === 'Approved' ? ICON_CHECK : ICON_X) + ' ' + decision + '</span>';
      btn.closest('td').innerHTML = '';
      announce.textContent = ref + ' ' + decision.toLowerCase() + '.';
    } else if (btn.hasAttribute('data-returned')) {
      btn.closest('td').innerHTML = '<span class="status">' + ICON_CHECK + ' Returned</span>';
      announce.textContent = ref + ' marked returned.';
    } else if (btn.hasAttribute('data-reviewed')) {
      btn.closest('td').innerHTML = '<span class="status">' + ICON_CHECK + ' Reviewed</span>';
      announce.textContent = 'Application from ' + ref + ' marked reviewed.';
    } else {
      return;
    }
    updateCounts();
  });
}
