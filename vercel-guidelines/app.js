/* =========================================================
   PUP Hygears Web Portal: shared JavaScript for every page.
   Plain functions and event listeners, no libraries.
   Each section checks that its elements exist first, so the
   same file is safe to load on every page.
   In the real PHP site, the "fake" parts (sample reference
   number, sample track results, sign-in) come from MySQL.
   ========================================================= */

/* ---------- 1. Small helpers ---------- */

// Same icons as in the HTML, for the parts JavaScript draws
var ICONS = {
  check: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12 5 5 9-10"/></svg>',
  x: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  clock: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  alert: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17v.5"/></svg>'
};

// Reads ?name=value from the address bar
function getParam(name) {
  var params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}

// Writes the page state into the address bar so it can be shared or bookmarked.
// Some browsers block this on file:// pages, so errors are ignored.
function setParams(values) {
  var params = new URLSearchParams();
  for (var key in values) {
    if (values[key]) {
      params.set(key, values[key]);
    }
  }
  var query = params.toString();
  try {
    history.replaceState(null, "", query ? "?" + query : window.location.pathname);
  } catch (e) {
    // ignore: the page still works, only the URL doesn't update
  }
}

// Turns "2026-11-25" into a local date (avoids the time zone shift of new Date("2026-11-25"))
function parseDate(text) {
  var parts = text.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// Formats dates the way the visitor's browser expects (e.g. "Nov 25, 2026")
var dateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

function formatDate(text) {
  return dateFormat.format(parseDate(text));
}

// Today's date as "YYYY-MM-DD", used for the min value of date inputs
function todayText() {
  var d = new Date();
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

// Pretend to send a form to the server: show a spinner on the button, then run "done"
function fakeSend(button, busyText, done) {
  var original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>' + busyText + "</span>";
  setTimeout(function () {
    button.disabled = false;
    button.innerHTML = original;
    done();
  }, 800);
}

/* ---------- 2. Phone menu ---------- */
var menuButton = document.querySelector(".menu-button");
var siteNav = document.getElementById("site-nav");

if (menuButton && siteNav) {
  menuButton.addEventListener("click", function () {
    var isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
  });

  // Escape closes the menu and puts focus back on the button
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      menuButton.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
      menuButton.focus();
    }
  });
}

/* ---------- 3. Dates on the page ---------- */
// Any <time data-date="2026-11-25"> gets a readable date
var dateEls = document.querySelectorAll("time[data-date]");
for (var i = 0; i < dateEls.length; i++) {
  dateEls[i].setAttribute("datetime", dateEls[i].dataset.date);
  dateEls[i].textContent = formatDate(dateEls[i].dataset.date);
}

/* ---------- 4. Form validation (used by every form) ---------- */
// Messages live in the HTML: data-required-msg (empty field) and data-error (wrong format).

// Returns the error message for one field, or "" if it is fine
function getFieldError(input) {
  if (input.type === "radio") {
    var group = input.form.querySelectorAll('input[name="' + input.name + '"]');
    for (var r = 0; r < group.length; r++) {
      if (group[r].checked) return "";
    }
    return input.dataset.requiredMsg;
  }
  if (input.validity.valueMissing) return input.dataset.requiredMsg;
  if (input.validity.typeMismatch || input.validity.patternMismatch) return input.dataset.error;
  if (input.validity.customError) return input.validationMessage;
  if (input.validity.rangeUnderflow || input.validity.rangeOverflow || input.validity.badInput) {
    return input.dataset.rangeMsg || input.dataset.requiredMsg;
  }
  return "";
}

// Shows or clears the message under a field
function showFieldError(input, message) {
  var field = input.closest(".field");
  if (!field) return;
  var errorBox = field.querySelector(".field-error span");
  field.classList.toggle("has-error", message !== "");
  if (errorBox) errorBox.textContent = message;
  if (input.type === "radio") {
    var group = input.form.querySelectorAll('input[name="' + input.name + '"]');
    for (var r = 0; r < group.length; r++) {
      group[r].setAttribute("aria-invalid", message ? "true" : "false");
    }
  } else {
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }
}

// Checks every field; focuses the first problem. Returns true when the form is OK.
function validateForm(form, statusEl) {
  var fields = form.querySelectorAll("input, select, textarea");
  var firstBad = null;
  var count = 0;
  var seenRadio = {};
  for (var f = 0; f < fields.length; f++) {
    var input = fields[f];
    if (input.disabled || input.closest("[hidden]")) continue;
    if (input.type === "radio") {
      if (seenRadio[input.name]) continue;
      seenRadio[input.name] = true;
    }
    var message = getFieldError(input);
    showFieldError(input, message);
    if (message) {
      count++;
      if (!firstBad) firstBad = input;
    }
  }
  if (firstBad) {
    firstBad.focus();
    if (statusEl) {
      statusEl.textContent = count === 1 ? "1 field needs a fix." : count + " fields need a fix.";
    }
    return false;
  }
  return true;
}

// Live feedback: once a field has shown an error, re-check it as the visitor types
function watchFields(form) {
  form.addEventListener("input", function (event) {
    var field = event.target.closest(".field");
    if (field && field.classList.contains("has-error")) {
      showFieldError(event.target, getFieldError(event.target));
    }
  });
  form.addEventListener("change", function (event) {
    var field = event.target.closest(".field");
    if (field && field.classList.contains("has-error")) {
      showFieldError(event.target, getFieldError(event.target));
    }
  });
  // Check a field when the visitor leaves it, but only if they typed something
  form.addEventListener("focusout", function (event) {
    var input = event.target;
    if (input.value && input.type !== "radio" && input.matches("input, textarea")) {
      showFieldError(input, getFieldError(input));
    }
  });
}

/* ---------- 5. Warn before leaving a half-filled form ---------- */
var formIsDirty = false;

var warnForm = document.querySelector("form[data-warn-unsaved]");
if (warnForm) {
  warnForm.addEventListener("input", function () {
    formIsDirty = true;
  });
  window.addEventListener("beforeunload", function (event) {
    if (formIsDirty) {
      event.preventDefault();
      event.returnValue = ""; // older browsers need this to show the prompt
    }
  });
}

/* ---------- 6. Tools page: search and filters ---------- */
var filterForm = document.getElementById("filters");

if (filterForm) {
  var searchInput = document.getElementById("q");
  var categorySelect = document.getElementById("cat");
  var items = document.querySelectorAll("#item-list .item");
  var countEl = document.getElementById("result-count");
  var emptyState = document.getElementById("empty-state");
  var clearButtons = [document.getElementById("clear-filters"), document.getElementById("clear-filters-2")];

  // Start from the URL, e.g. tools.html?q=drill&type=tool (the Home search box links here)
  searchInput.value = getParam("q");
  categorySelect.value = getParam("cat");
  var startType = getParam("type");
  var typeRadio = filterForm.querySelector('input[name="type"][value="' + startType + '"]');
  if (typeRadio) typeRadio.checked = true;

  function applyFilters() {
    var text = searchInput.value.trim().toLowerCase();
    var category = categorySelect.value;
    var type = filterForm.querySelector('input[name="type"]:checked').value;
    var shown = 0;

    for (var n = 0; n < items.length; n++) {
      var item = items[n];
      var matches =
        (text === "" || item.dataset.name.indexOf(text) !== -1) &&
        (category === "" || item.dataset.category === category) &&
        (type === "" || item.dataset.type === type);
      item.hidden = !matches;
      if (matches) shown++;
    }

    countEl.textContent = "Showing " + shown + " of " + items.length + " items";
    emptyState.hidden = shown !== 0;
    clearButtons[0].hidden = text === "" && category === "" && type === "";
    setParams({ q: text, cat: category, type: type });
  }

  function clearFilters() {
    filterForm.reset();
    applyFilters();
    searchInput.focus();
  }

  filterForm.addEventListener("input", applyFilters);
  filterForm.addEventListener("change", applyFilters);
  // Enter in the search box filters instead of reloading the page
  filterForm.addEventListener("submit", function (event) {
    event.preventDefault();
    applyFilters();
  });
  clearButtons[0].addEventListener("click", clearFilters);
  clearButtons[1].addEventListener("click", clearFilters);

  applyFilters();
}

/* ---------- 7. Reserve page ---------- */
var reserveForm = document.getElementById("reserve-form");

if (reserveForm) {
  var itemSelect = document.getElementById("item");
  var quantityInput = document.getElementById("quantity");
  var quantityHint = document.getElementById("quantity-hint");
  var pickupInput = document.getElementById("pickup");
  var returnInput = document.getElementById("return");
  var returnField = document.getElementById("return-field");
  var consumableNote = document.getElementById("consumable-note");

  watchFields(reserveForm);

  // No dates in the past
  pickupInput.min = todayText();
  returnInput.min = todayText();

  // Update the quantity limit and the return date when the item changes
  function updateItem() {
    var option = itemSelect.options[itemSelect.selectedIndex];
    var available = Number(option.dataset.available || 0);
    var isConsumable = option.dataset.type === "consumable";

    if (itemSelect.value) {
      quantityInput.max = available;
      quantityHint.textContent = "Up to " + available + " available now.";
      quantityInput.dataset.rangeMsg = "Enter a number from 1 to " + available + ".";
    } else {
      quantityInput.removeAttribute("max");
      quantityHint.textContent = "Choose an item first.";
    }

    // Consumables are used up, so they have no return date
    returnField.hidden = isConsumable;
    returnInput.required = !isConsumable;
    consumableNote.hidden = !isConsumable;
  }

  // Return date can't be before pickup
  function checkDates() {
    pickupInput.setCustomValidity("");
    returnInput.setCustomValidity("");
    if (pickupInput.value && pickupInput.value < todayText()) {
      pickupInput.setCustomValidity("Pick a date from today onward.");
    }
    if (pickupInput.value) returnInput.min = pickupInput.value;
    if (returnInput.value && pickupInput.value && returnInput.value < pickupInput.value) {
      returnInput.setCustomValidity("Return date must be on or after the pickup date.");
    }
  }

  // Coming from Tools: tools.html links to reserve.html?item=soldering-station
  var startItem = getParam("item");
  if (startItem) {
    itemSelect.value = startItem;
  }
  updateItem();

  itemSelect.addEventListener("change", updateItem);
  pickupInput.addEventListener("change", checkDates);
  returnInput.addEventListener("change", checkDates);

  reserveForm.addEventListener("submit", function (event) {
    event.preventDefault();
    checkDates();
    if (!validateForm(reserveForm, document.getElementById("reserve-status"))) return;

    fakeSend(document.getElementById("reserve-submit"), "Sending…", function () {
      // Fill in the summary with what the student entered (textContent keeps it safe)
      var option = itemSelect.options[itemSelect.selectedIndex];
      var rows = [
        ["Item", option.textContent.replace(/\s*\(.*\)$/, "")],
        ["Quantity", quantityInput.value],
        ["Pickup", formatDate(pickupInput.value)]
      ];
      if (!returnField.hidden) rows.push(["Return", formatDate(returnInput.value)]);
      rows.push(["Name", document.getElementById("name").value]);
      rows.push(["Email", document.getElementById("email").value]);

      var summary = document.getElementById("success-summary");
      summary.innerHTML = "";
      for (var s = 0; s < rows.length; s++) {
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        dt.textContent = rows[s][0];
        dd.textContent = rows[s][1];
        summary.appendChild(dt);
        summary.appendChild(dd);
      }

      formIsDirty = false;
      reserveForm.hidden = true;
      var success = document.getElementById("reserve-success");
      success.hidden = false;
      success.focus();
    });
  });

  // Copy the reference number
  var copyButton = document.getElementById("copy-ref");
  copyButton.addEventListener("click", function () {
    var ref = document.getElementById("success-ref").textContent;
    var status = document.getElementById("copy-status");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ref).then(function () {
        status.textContent = "Copied.";
      }, function () {
        status.textContent = "Couldn’t copy. Write it down instead.";
      });
    } else {
      status.textContent = "Couldn’t copy. Write it down instead.";
    }
  });
}

/* ---------- 8. Join page ---------- */
var joinForm = document.getElementById("join-form");

if (joinForm) {
  watchFields(joinForm);

  // Character counter for the reason box
  var reason = document.getElementById("j-reason");
  var counter = document.getElementById("j-reason-count");
  reason.addEventListener("input", function () {
    counter.textContent = reason.value.length + " / " + reason.maxLength;
  });

  joinForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateForm(joinForm, document.getElementById("join-status"))) return;

    fakeSend(document.getElementById("join-submit"), "Sending…", function () {
      document.getElementById("join-name").textContent = document.getElementById("j-name").value.trim().split(" ")[0];
      document.getElementById("join-email").textContent = document.getElementById("j-email").value;
      formIsDirty = false;
      joinForm.hidden = true;
      var success = document.getElementById("join-success");
      success.hidden = false;
      success.focus();
    });
  });
}

/* ---------- 9. Track page ---------- */
var trackForm = document.getElementById("track-form");

if (trackForm) {
  var refInput = document.getElementById("ref");
  var resultBox = document.getElementById("track-result");
  watchFields(trackForm);

  // Sample requests. The real site looks the number up in MySQL.
  var REQUESTS = {
    "HYG-2026-0142": { status: "Pending", item: "Soldering Station", qty: 1, pickup: "2026-11-25", ret: "2026-11-27",
      note: "An officer will review it soon." },
    "HYG-2026-0139": { status: "Approved", item: "Digital Multimeter", qty: 1, pickup: "2026-11-24", ret: "2026-11-26",
      note: "Pick it up on your pickup date. Bring your PUP ID." },
    "HYG-2026-0127": { status: "Declined", item: "Torque Wrench", qty: 1, pickup: "2026-11-22", ret: "2026-11-23",
      note: "Reason from the officer: all units are out on those dates. Try other dates or another item." }
  };

  // Accepts "hyg-2026-0142", "HYG20260142" or " HYG-2026-0142 " and returns "HYG-2026-0142"
  function normalizeRef(text) {
    var clean = text.toUpperCase().replace(/[\s-]/g, "");
    var match = clean.match(/^HYG(\d{4})(\d{4})$/);
    return match ? "HYG-" + match[1] + "-" + match[2] : "";
  }

  // Builds the four-step timeline for a request
  function timelineHtml(status, isConsumable) {
    var review = status === "Pending" ? "is-current" : status === "Approved" ? "is-done" : "is-declined";
    var steps = [
      ["Submitted", "Received by the portal", "is-done"],
      ["Officer Review", status, review],
      ["Pick Up", "Bring your PUP ID", status === "Approved" ? "is-current" : ""],
      ["Return", isConsumable ? "No return for consumables" : "By your return date", ""]
    ];
    if (status === "Declined") steps = steps.slice(0, 2);
    var html = '<ol class="timeline">';
    for (var t = 0; t < steps.length; t++) {
      var mark = steps[t][2] === "is-done" ? ICONS.check : steps[t][2] === "is-declined" ? ICONS.x : "";
      html += '<li class="' + steps[t][2] + '"><span class="dot">' + mark + "</span><span><strong>" +
        steps[t][0] + '</strong><span class="step-note">' + steps[t][1] + "</span></span></li>";
    }
    return html + "</ol>";
  }

  function showRequest(ref) {
    var req = REQUESTS[ref];
    if (!req) {
      resultBox.innerHTML =
        '<section class="result" tabindex="-1"><div class="result-head"><h2 style="margin:0">No Request Found</h2>' +
        '<span class="status status-bad">' + ICONS.x + "Not found</span></div>" +
        '<p>Nothing matches <span class="ref" translate="no">' + ref + "</span>. Check the number in your confirmation, " +
        'or email <a href="mailto:puphygears@gmail.com">puphygears@gmail.com</a>.</p></section>';
      return;
    }
    var badge = req.status === "Pending" ? '<span class="status status-wait">' + ICONS.clock + "Pending</span>"
      : req.status === "Approved" ? '<span class="status status-ok">' + ICONS.check + "Approved</span>"
      : '<span class="status status-bad">' + ICONS.x + "Declined</span>";
    resultBox.innerHTML =
      '<section class="result" tabindex="-1" aria-label="Request ' + ref + '">' +
      '<div class="result-head"><h2 class="ref" style="margin:0" translate="no">' + ref + "</h2>" + badge + "</div>" +
      "<p>" + req.note + "</p>" +
      '<dl class="summary"><dt>Item</dt><dd>' + req.item + "</dd><dt>Quantity</dt><dd>" + req.qty + "</dd>" +
      "<dt>Pickup</dt><dd>" + formatDate(req.pickup) + "</dd><dt>Return</dt><dd>" + formatDate(req.ret) + "</dd></dl>" +
      timelineHtml(req.status, false) +
      '<p class="small muted" style="margin:0">Sample request for the prototype.</p></section>';
  }

  trackForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateForm(trackForm)) return;
    var ref = normalizeRef(refInput.value);
    if (!ref) {
      showFieldError(refInput, refInput.dataset.error);
      refInput.focus();
      return;
    }
    showFieldError(refInput, "");
    refInput.value = ref;
    setParams({ ref: ref });
    showRequest(ref);
  });

  // Opened from a link like track.html?ref=HYG-2026-0142: look it up right away
  var startRef = normalizeRef(getParam("ref"));
  if (startRef) {
    refInput.value = startRef;
    showRequest(startRef);
  }
}

/* ---------- 10. Officer page ---------- */
var loginForm = document.getElementById("login-form");

if (loginForm) {
  var loginView = document.getElementById("login-view");
  var dashView = document.getElementById("dash-view");
  var dashStatus = document.getElementById("dash-status");
  var pendingCount = document.getElementById("pending-count");
  watchFields(loginForm);

  function showDashboard(moveFocus) {
    loginView.hidden = true;
    dashView.hidden = false;
    setParams({ view: "dashboard" });
    if (moveFocus) document.getElementById("dash-title").focus();
  }

  // Prototype only: any email and password signs in. The real site uses PHP sessions.
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateForm(loginForm)) return;
    fakeSend(document.getElementById("login-submit"), "Signing in…", function () {
      showDashboard(true);
    });
  });

  document.getElementById("sign-out").addEventListener("click", function () {
    dashView.hidden = true;
    loginView.hidden = false;
    setParams({});
    document.getElementById("o-email").focus();
  });

  // officer.html?view=dashboard opens the dashboard directly (handy for demos)
  if (getParam("view") === "dashboard") showDashboard(false);

  // Approve right away; Decline asks for a reason first. Both can be undone.
  // One listener on the whole dashboard handles every row's buttons ("event delegation").
  dashView.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-action]");
    if (!button) return;
    var box = button.closest(".row-actions");
    var row = box.closest("tr");
    var ref = box.dataset.ref;
    var action = button.dataset.action;

    // Shows the final status with an Undo button
    function finish(label, message) {
      box.innerHTML = '<span class="row-result">' + label +
        '<button type="button" class="link-button" data-action="undo">Undo<span class="visually-hidden"> ' + ref + "</span></button></span>";
      row.classList.add("row-done");
      pendingCount.textContent = Number(pendingCount.textContent) - 1;
      dashStatus.textContent = message + " Undo is available.";
      box.querySelector("button").focus();
    }

    if (action === "approve") {
      box.dataset.original = box.innerHTML; // saved so Undo can put the buttons back
      finish('<span class="status status-ok">' + ICONS.check + "Approved</span>", ref + " approved.");
    }

    if (action === "decline") {
      box.dataset.original = box.innerHTML;
      box.innerHTML =
        '<label for="reason-' + ref + '">Reason sent to the student</label>' +
        '<select id="reason-' + ref + '" name="reason" autocomplete="off">' +
        "<option>All units are out on those dates</option>" +
        "<option>Details are missing or unclear</option>" +
        "<option>Other: an officer will email you</option></select>" +
        '<button type="button" class="button button-small" data-action="confirm-decline">Decline Request</button>' +
        '<button type="button" class="link-button" data-action="cancel">Cancel</button>';
      box.querySelector("select").focus();
    }

    if (action === "confirm-decline") {
      var reason = box.querySelector("select").value;
      finish('<span class="status status-bad">' + ICONS.x + "Declined</span>", ref + " declined: " + reason + ".");
    }

    if (action === "cancel") {
      box.innerHTML = box.dataset.original;
      box.querySelector("button").focus();
    }

    if (action === "undo") {
      box.innerHTML = box.dataset.original;
      row.classList.remove("row-done");
      pendingCount.textContent = Number(pendingCount.textContent) + 1;
      dashStatus.textContent = ref + " is back to pending.";
      box.querySelector("button").focus();
    }
  });
}
