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

/* =========================================================
   11. News posts (news.html, article.html, Home strip, officer Posts)
   The prototype keeps posts in the browser's localStorage, so a
   post an officer publishes on officer.html shows on news.html in
   the same browser. In the real site these come from the MySQL
   `posts` table:  SELECT * FROM posts WHERE status = 'published'
   ORDER BY published_at DESC
   ========================================================= */

// Storage key. Every prototype folder opened from file:// shares one
// localStorage, so each direction uses its own key.
var POSTS_KEY = "hygears-spec-posts";

// Sample posts, written only from facts on the org's Facebook page.
// Field names match the planned `posts` table columns.
// "photos" are the inline photos inside the article (samples only).
var SAMPLE_POSTS = [
  {
    post_id: 5, title: "Luna Team Progress Report", category: "Progress report",
    published_at: "2026-11-20", status: "published", sample: true,
    summary: "A sample of how the Luna team's progress reports will look on the portal. The real update comes from the officers.",
    cover_image: "../assets/luna-night.png", cover_alt: "The Luna electric vehicle parked at night on the PUP campus",
    caption_by: "Creative Media and Design (sample)",
    body: "This is a sample post. It shows how a progress report from the Luna team will look on the portal, so the officers can see the layout before they write the real one. No real details from the team are shown here.\n\n" +
      "Luna is the series of energy-efficient electric vehicles that PUP Hygears builds for the Shell Eco-marathon. The Eco-marathon is an energy-efficiency competition, not a race: the goal is to go as far as possible on as little energy as possible.\n\n" +
      "A real progress report would say what each part of the team worked on during the period, what was built or tested, and what comes next. Members come from Mechanical, Electronics and Communications, Industrial, Electrical and Computer Engineering, and Marketing, so a report can cover the car, its electronics and the work around it.\n\n" +
      "Photos from the workshop and the test days would go between the paragraphs, each with a short caption, the way the two photos in this post do.\n\n" +
      "When the officers send the real update, this sample will be replaced. Until then, follow PUP Hygears on Facebook for the latest from the team.",
    photos: [
      { src: "../assets/team-luna-1.png", alt: "PUP Hygears members standing around the Luna electric vehicle outdoors", caption: "The team with the Luna car." },
      { src: "../assets/team-2.png", alt: "PUP Hygears members standing in a line for a team photo", caption: "Hygears members. Stand-in photo until the officers send ones from this period." }
    ]
  },
  {
    post_id: 4, title: "A PUP Student Is a Finalist in the 1st National SOLIDWORKS Mechanical Design Challenge 2026",
    category: "Competition", published_at: "2026-11-12", status: "published", sample: true,
    summary: "A PUP student made it to the finals of the first national SOLIDWORKS Mechanical Design Challenge.",
    cover_image: "", cover_alt: "", caption_by: "Creative Media and Design (sample)",
    body: "A PUP student is a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge 2026.\n\n" +
      "SOLIDWORKS is 3D design software that engineering students use to model parts and machines before they are built. A national design challenge puts that skill up against students from other schools.\n\n" +
      "The results of the final round will be posted here once the officers share them."
  },
  {
    post_id: 3, title: "ASCEND 2026: Meet the Five Committees", category: "Recruitment",
    published_at: "2026-10-28", status: "published", sample: true,
    summary: "Recruitment for new members is open. Pick the committee you want to grow in and apply.",
    cover_image: "../assets/team-2.png", cover_alt: "PUP Hygears members standing in a line for a team photo",
    caption_by: "Creative Media and Design (sample)",
    body: "ASCEND 2026 is the PUP Hygears recruitment for new members. Every member joins one of five committees.\n\n" +
      "The five committees are Finance and Operations, Internal Affairs, Innovation and Research, External Affairs, and Creative Media and Design.\n\n" +
      "You don't need to be an engineering student to help. Members come from Mechanical, Electronics and Communications, Industrial, Electrical and Computer Engineering, and Marketing.\n\n" +
      "As the organization puts it: “We don’t just build vehicles, we build people to help us build the future!” Apply on the Join page and choose your preferred committee. Officers review applications and reply by email."
  },
  {
    post_id: 2, title: "General Assembly: “The Force Awakens: Refining Our Legacy”", category: "Announcement",
    published_at: "2026-10-10", status: "published", sample: true,
    summary: "The organization's general assembly brought the Merakis together under one theme.",
    cover_image: "../assets/team-luna-1.png", cover_alt: "PUP Hygears members standing around the Luna electric vehicle outdoors",
    caption_by: "Creative Media and Design (sample)",
    body: "PUP Hygears held its General Assembly with the theme “The Force Awakens: Refining Our Legacy.” In Hygears, members are called Merakis.\n\n" +
      "A general assembly brings the whole organization together, from the officers to the newest members of all five committees.\n\n" +
      "The program and photos from the day will be added once the officers send them."
  },
  {
    post_id: 1, title: "PHYNIX 2026: PUP Hygears Research Workshop", category: "Workshop",
    published_at: "2026-09-26", status: "published", sample: true,
    summary: "A research workshop for PUP students: “Nex-thinkers, N-explorers, Nex-creators.”",
    cover_image: "", cover_alt: "", caption_by: "Creative Media and Design (sample)",
    body: "PHYNIX 2026 is the research workshop that PUP Hygears runs for PUP students. Its tagline: “Nex-thinkers, N-explorers, Nex-creators.”\n\n" +
      "The workshop follows the organization's aim: to raise PUP students' awareness of research and to train competent students through real work on innovation and on building a highly efficient vehicle.\n\n" +
      "The date, venue and topics will be added here once the officers send them."
  }
];

// Reads every post (published and drafts). First visit: the samples.
function loadPosts() {
  try {
    var saved = localStorage.getItem(POSTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // storage blocked or broken: fall back to the samples
  }
  return SAMPLE_POSTS.slice();
}

// Saves every post. Returns false when the browser refuses (storage full or blocked).
function savePosts(posts) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return true;
  } catch (e) {
    return false;
  }
}

// Newest first (same as ORDER BY published_at DESC); same date: newer id first
function sortNewestFirst(list) {
  list.sort(function (a, b) {
    if (a.published_at === b.published_at) return b.post_id - a.post_id;
    return a.published_at < b.published_at ? 1 : -1;
  });
  return list;
}

// Only published posts, newest first
function getPublishedPosts() {
  var all = loadPosts();
  var list = [];
  for (var p = 0; p < all.length; p++) {
    if (all[p].status === "published") list.push(all[p]);
  }
  return sortNewestFirst(list);
}

// Makes officer-typed text safe to put inside HTML (like PHP's htmlspecialchars)
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Cover photo, or a dashed slot when the post has none yet
function coverHtml(post, className) {
  if (post.cover_image) {
    return '<img class="' + className + '" src="' + escapeHtml(post.cover_image) + '" alt="' +
      escapeHtml(post.cover_alt || "") + '" width="1440" height="810" loading="lazy">';
  }
  return '<div class="pubmat-slot">Cover photo from officers</div>';
}

// One post card: used on News, the Home strip and "More posts".
// The title link is the one the keyboard and screen readers use;
// "Read more" repeats it for mouse and touch, so it is hidden from them.
function postCardHtml(post) {
  var link = "article.html?id=" + post.post_id;
  return '<li class="card news-card post-card">' +
    coverHtml(post, "post-cover") +
    '<p class="meta"><span class="tag">' + escapeHtml(post.category) + "</span>" +
    '<time datetime="' + post.published_at + '">' + formatDate(post.published_at) + "</time>" +
    (post.sample ? "<span>Sample</span>" : "") + "</p>" +
    '<h3><a href="' + link + '">' + escapeHtml(post.title) + "</a></h3>" +
    "<p>" + escapeHtml(post.summary) + "</p>" +
    '<a class="read-more" href="' + link + '" aria-hidden="true" tabindex="-1">Read more</a>' +
    "</li>";
}

// Draws a list of cards into a <ul>
function renderPostList(listEl, posts) {
  var html = "";
  for (var c = 0; c < posts.length; c++) {
    html += postCardHtml(posts[c]);
  }
  listEl.innerHTML = html;
}

/* ---------- 11a. Home: "Latest from Hygears" (3 newest) ---------- */
var latestList = document.getElementById("latest-posts");
if (latestList) {
  renderPostList(latestList, getPublishedPosts().slice(0, 3));
}

/* ---------- 11b. News page: list with a category filter ---------- */
var newsList = document.getElementById("news-list");
if (newsList) {
  var newsCat = document.getElementById("news-cat");
  var newsCount = document.getElementById("news-count");
  var newsEmpty = document.getElementById("news-empty");

  newsCat.value = getParam("cat");

  function showNews() {
    var all = getPublishedPosts();
    var shown = [];
    for (var n = 0; n < all.length; n++) {
      if (newsCat.value === "" || all[n].category === newsCat.value) shown.push(all[n]);
    }
    renderPostList(newsList, shown);
    newsCount.textContent = "Showing " + shown.length + " of " + all.length + " posts";
    newsEmpty.hidden = shown.length !== 0;
    setParams({ cat: newsCat.value });
  }

  newsCat.addEventListener("change", showNews);
  document.getElementById("news-clear").addEventListener("click", function () {
    newsCat.value = "";
    showNews();
    newsCat.focus();
  });
  showNews();
}

/* ---------- 11c. Article page: one post, chosen by ?id=N ---------- */
var articleBox = document.getElementById("article");
if (articleBox) {
  var livePosts = getPublishedPosts();
  var wantedId = getParam("id");
  var post = null;
  for (var a = 0; a < livePosts.length; a++) {
    if (String(livePosts[a].post_id) === wantedId) post = livePosts[a];
  }
  if (!wantedId && livePosts.length) post = livePosts[0]; // no id: show the newest post

  if (!post) {
    articleBox.innerHTML = '<h1>Post Not Found</h1><p>This post was unpublished or never existed. ' +
      '<a href="news.html">See all news</a>.</p>';
    document.getElementById("more-title").closest("section").hidden = true;
  } else {
    document.title = post.title + " | PUP Hygears";

    // Blank lines in the body become separate paragraphs.
    // Inline photos go after the 2nd and 4th paragraphs.
    var paragraphs = post.body.split(/\n\s*\n/);
    var photos = post.photos || [];
    var bodyHtml = "";
    for (var b = 0; b < paragraphs.length; b++) {
      bodyHtml += "<p>" + escapeHtml(paragraphs[b].trim()) + "</p>";
      var photo = photos[(b - 1) / 2];
      if (b % 2 === 1 && photo) {
        bodyHtml += '<figure class="article-photo"><img src="' + escapeHtml(photo.src) + '" alt="' + escapeHtml(photo.alt) +
          '" width="1440" height="810" loading="lazy"><figcaption>' + escapeHtml(photo.caption) + "</figcaption></figure>";
      }
    }

    articleBox.innerHTML =
      '<p class="meta"><span class="tag">' + escapeHtml(post.category) + "</span>" +
      '<time datetime="' + post.published_at + '">' + formatDate(post.published_at) + "</time></p>" +
      "<h1>" + escapeHtml(post.title) + "</h1>" +
      (post.sample ? '<p class="sample-flag">Sample article, written from the org’s public posts. The officers will send the real details.</p>' : "") +
      '<figure class="article-cover">' + coverHtml(post, "") + "</figure>" +
      '<div class="article-body">' + bodyHtml + "</div>" +
      '<p class="byline">Caption by ' + escapeHtml(post.caption_by || "PUP Hygears") + "</p>";

    // "More posts": the newest other posts
    var more = [];
    for (var m = 0; m < livePosts.length && more.length < 3; m++) {
      if (livePosts[m] !== post) more.push(livePosts[m]);
    }
    renderPostList(document.getElementById("more-posts"), more);
  }
}

/* ---------- 11d. Join: applications open or closed ---------- */
// Recruitment is seasonal. The officers flip this (a setting in the real site).
// join.html?applications=closed previews the closed state.
var APPLICATIONS_OPEN = true;
var applyOpen = document.getElementById("apply-open");
if (applyOpen) {
  var isOpen = APPLICATIONS_OPEN && getParam("applications") !== "closed";
  applyOpen.hidden = !isOpen;
  document.getElementById("apply-closed").hidden = isOpen;
  document.getElementById("join-form").hidden = !isOpen;
}

/* ---------- 11e. Officer: Posts list and the New post form ---------- */
var postForm = document.getElementById("post-form");
if (postForm) {
  var postRows = document.getElementById("post-rows");
  var postStatus = document.getElementById("post-status");
  var postMessage = document.getElementById("post-message");
  var coverInput = document.getElementById("p-cover");
  var coverPreview = document.getElementById("p-preview");
  var coverBox = document.getElementById("p-preview-box");
  var bodyInput = document.getElementById("p-body");
  var editingId = null;   // post_id being edited, or null for a new post
  var coverData = "";     // the chosen photo as a data URL (the real site uploads the file instead)

  var MAX_PHOTO_MB = 2;
  var PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

  document.getElementById("p-date").value = todayText();

  // Draws the officer's table of posts (newest first, drafts included)
  function renderOfficerPosts() {
    var all = sortNewestFirst(loadPosts());
    var html = "";
    for (var r = 0; r < all.length; r++) {
      var p = all[r];
      var isLive = p.status === "published";
      var hiddenTitle = '<span class="visually-hidden"> ' + escapeHtml(p.title) + "</span>";
      html += "<tr>" +
        '<td data-label="Title"><span>' + escapeHtml(p.title) + (p.sample ? ' <span class="small muted">(sample)</span>' : "") + "</span></td>" +
        '<td data-label="Category">' + escapeHtml(p.category) + "</td>" +
        '<td data-label="Date"><time datetime="' + p.published_at + '">' + formatDate(p.published_at) + "</time></td>" +
        '<td data-label="Status">' + (isLive
          ? '<span class="status status-ok">' + ICONS.check + "Published</span>"
          : '<span class="status status-wait">' + ICONS.clock + "Draft</span>") + "</td>" +
        '<td class="actions"><div class="row-actions">' +
        '<button type="button" class="button button-secondary button-small" data-post-edit="' + p.post_id + '">Edit' + hiddenTitle + "</button>" +
        '<button type="button" class="button button-secondary button-small" data-post-toggle="' + p.post_id + '">' +
        (isLive ? "Unpublish" : "Publish") + hiddenTitle + "</button>" +
        "</div></td></tr>";
    }
    postRows.innerHTML = html;
    document.getElementById("posts-count").textContent = getPublishedPosts().length;
  }

  // Finds a post by id inside an array
  function findPost(all, id) {
    for (var f = 0; f < all.length; f++) {
      if (all[f].post_id === id) return all[f];
    }
    return null;
  }

  // Shows the chosen photo, or hides the preview when there is none
  function showPreview(src) {
    coverData = src || "";
    if (src) coverPreview.src = src;
    else coverPreview.removeAttribute("src");
    coverBox.hidden = !src;
  }

  // Back to an empty "New post" form
  function resetPostForm() {
    postForm.reset();
    editingId = null;
    showPreview("");
    coverInput.setCustomValidity("");
    document.getElementById("p-date").value = todayText();
    document.getElementById("post-form-title").textContent = "New Post";
    document.getElementById("p-cancel").hidden = true;
    var fields = postForm.querySelectorAll("input, select, textarea");
    for (var e = 0; e < fields.length; e++) showFieldError(fields[e], "");
    formIsDirty = false;
  }

  // Photo check: type and size first, then FileReader shows a preview
  coverInput.addEventListener("change", function () {
    var file = coverInput.files[0];
    var problem = "";
    if (!file) return;
    if (PHOTO_TYPES.indexOf(file.type) === -1) {
      problem = "This file isn’t a photo. Choose a JPG, PNG or WebP image.";
    } else if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      problem = "This photo is " + (file.size / 1024 / 1024).toFixed(1) + " MB. Choose one under " + MAX_PHOTO_MB + " MB.";
    }
    if (problem) {
      coverInput.value = ""; // forget the bad file; the old photo (if any) stays
      showFieldError(coverInput, problem);
      coverInput.focus();
      return;
    }
    showFieldError(coverInput, "");
    var reader = new FileReader();
    reader.onload = function () {
      showPreview(reader.result); // reader.result is the photo as a data URL
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("p-remove").addEventListener("click", function () {
    coverInput.value = "";
    showPreview("");
    coverInput.focus();
  });

  // Save Draft or Publish: both are submit buttons, and their value says which
  postForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var action = event.submitter ? event.submitter.value : "publish";
    bodyInput.required = action === "publish"; // a draft only needs a title
    postMessage.hidden = true;
    if (!validateForm(postForm, postStatus)) return;

    var all = loadPosts();
    var post = editingId ? findPost(all, editingId) : null;
    if (!post) {
      var maxId = 0;
      for (var i = 0; i < all.length; i++) maxId = Math.max(maxId, all[i].post_id);
      post = { post_id: maxId + 1, created_by: "Sample officer" };
      all.push(post);
    }
    var bodyText = bodyInput.value.trim();
    var summaryText = document.getElementById("p-summary").value.trim();
    post.title = document.getElementById("p-title").value.trim();
    post.category = document.getElementById("p-category").value;
    post.published_at = document.getElementById("p-date").value;
    // No summary typed: use the start of the first paragraph
    post.summary = summaryText || bodyText.split(/\n\s*\n/)[0].slice(0, 160);
    post.body = bodyText;
    post.caption_by = document.getElementById("p-caption").value.trim();
    post.cover_image = coverData;
    post.cover_alt = coverData ? "Cover photo: " + post.title : "";
    post.status = action === "publish" ? "published" : "draft";
    post.sample = false;

    if (!savePosts(all)) {
      postStatus.textContent = "The post couldn't be saved.";
      showFieldError(coverInput, "This browser couldn’t store the post. The photo may be too big for the prototype: try a smaller one.");
      coverInput.focus();
      return;
    }

    var link = "article.html?id=" + post.post_id;
    document.getElementById("post-message-text").innerHTML = post.status === "published"
      ? "Published “" + escapeHtml(post.title) + "”. It now shows on News. " +
        '<a href="' + link + '">View the post</a> or <a href="news.html">open News</a>.'
      : "Saved “" + escapeHtml(post.title) + "” as a draft. Students can’t see it until you publish it.";
    resetPostForm();
    renderOfficerPosts();
    postMessage.hidden = false;
    postMessage.focus();
  });

  document.getElementById("p-cancel").addEventListener("click", function () {
    resetPostForm();
    document.getElementById("p-title").focus();
  });

  // Edit and Unpublish/Publish buttons in the posts table (event delegation)
  postRows.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button) return;
    var all = loadPosts();

    if (button.dataset.postEdit) {
      var post = findPost(all, Number(button.dataset.postEdit));
      resetPostForm();
      editingId = post.post_id;
      document.getElementById("p-title").value = post.title;
      document.getElementById("p-category").value = post.category;
      document.getElementById("p-date").value = post.published_at;
      document.getElementById("p-summary").value = post.summary;
      bodyInput.value = post.body;
      document.getElementById("p-caption").value = post.caption_by || "";
      showPreview(post.cover_image);
      document.getElementById("post-form-title").textContent = "Edit Post";
      document.getElementById("p-cancel").hidden = false;
      postMessage.hidden = true;
      document.getElementById("p-title").focus();
    }

    if (button.dataset.postToggle) {
      var target = findPost(all, Number(button.dataset.postToggle));
      target.status = target.status === "published" ? "draft" : "published";
      savePosts(all);
      renderOfficerPosts();
      dashStatus.textContent = "“" + target.title + "” is now " +
        (target.status === "published" ? "published on News." : "a draft, hidden from News.");
      var again = postRows.querySelector('[data-post-toggle="' + target.post_id + '"]');
      if (again) again.focus();
    }
  });

  renderOfficerPosts();
}
