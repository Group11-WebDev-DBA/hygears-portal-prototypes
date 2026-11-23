/* =========================================================
   PUP Hygears Web Portal - "Charge" prototype
   Plain JavaScript for every page. Each section checks that its
   elements exist first, so one file works on all 7 pages.
   In the real site, PHP and MySQL replace the sample data here.
   ========================================================= */

/* ---------- 1. Mobile menu ---------- */
var menuBtn = document.querySelector(".menu-btn");
var siteNav = document.getElementById("site-nav");

if (menuBtn && siteNav) {
  // JavaScript is on, so hide the nav behind the Menu button on phones
  document.body.classList.add("js-nav");
  menuBtn.hidden = false;

  menuBtn.addEventListener("click", function () {
    var isOpen = siteNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menuBtn.textContent = isOpen ? "Close" : "Menu";
  });
}

/* ---------- 2. Form helpers (used by every form) ---------- */

// Show an error under a field, or clear it when message is ""
function setError(input, message) {
  var errorBox = document.getElementById(input.id + "-error");
  if (errorBox) {
    errorBox.textContent = message;
  }
  if (message) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }
  return message === "";
}

// Check a required text field
function checkRequired(input, label) {
  if (input.value.trim() === "") {
    return setError(input, "Enter your " + label + ".");
  }
  return setError(input, "");
}

// PUP student numbers look like 2024-00123-MN-0
function checkStudentNumber(input) {
  var pattern = /^\d{4}-\d{5}-[A-Z]{2}-\d$/;
  var value = input.value.trim().toUpperCase();
  input.value = value;
  if (value === "") {
    return setError(input, "Enter your student number.");
  }
  if (!pattern.test(value)) {
    return setError(input, "Use the format on your ID, like 2024-00123-MN-0.");
  }
  return setError(input, "");
}

function checkEmail(input) {
  var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (input.value.trim() === "") {
    return setError(input, "Enter your email.");
  }
  if (!pattern.test(input.value.trim())) {
    return setError(input, "Check your email, it should look like name@example.com.");
  }
  return setError(input, "");
}

// Put the cursor on the first field with an error
function focusFirstError(form) {
  var bad = form.querySelector('[aria-invalid="true"]');
  if (bad) {
    bad.focus();
  }
}

// Today's date as YYYY-MM-DD, the format date inputs use
function todayString() {
  var d = new Date();
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

// Build battery cells: one <i> per unit, filled ones get class "on"
function cellsHtml(available, total) {
  var html = '<span class="cells" aria-hidden="true">';
  for (var i = 0; i < total; i++) {
    html += i < available ? '<i class="on"></i>' : "<i></i>";
  }
  return html + "</span>";
}

/* ---------- 3. Tools page: search and filters ---------- */
var filterForm = document.getElementById("filters");

if (filterForm) {
  var searchBox = document.getElementById("search");
  var categorySelect = document.getElementById("category");
  var availableOnly = document.getElementById("available-only");
  var items = document.querySelectorAll("#item-grid .item");
  var countText = document.getElementById("result-count");
  var noResults = document.getElementById("no-results");

  function applyFilters() {
    var word = searchBox.value.trim().toLowerCase();
    var category = categorySelect.value;
    var type = filterForm.querySelector('input[name="type"]:checked').value;
    var shown = 0;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var matches =
        item.dataset.name.indexOf(word) !== -1 &&
        (category === "all" || item.dataset.category === category) &&
        (type === "all" || item.dataset.type === type) &&
        (!availableOnly.checked || Number(item.dataset.available) > 0);

      item.hidden = !matches;
      if (matches) {
        shown++;
      }
    }

    countText.textContent = "Showing " + shown + " of " + items.length + " items";
    noResults.hidden = shown !== 0;
  }

  // Search as you type; the other controls update on change
  searchBox.addEventListener("input", applyFilters);
  filterForm.addEventListener("change", applyFilters);
  filterForm.addEventListener("submit", function (event) {
    event.preventDefault();
    applyFilters();
  });

  document.getElementById("clear-filters").addEventListener("click", function () {
    filterForm.reset();
    applyFilters();
    searchBox.focus();
  });

  // A search sent from the Home page arrives as tools.html?q=word
  var params = new URLSearchParams(window.location.search);
  if (params.get("q")) {
    searchBox.value = params.get("q");
  }
  applyFilters();
}

/* ---------- 4. Reserve page ---------- */
var reserveForm = document.getElementById("reserve-form");

if (reserveForm) {
  var itemSelect = document.getElementById("item");
  var qty = document.getElementById("qty");
  var pickup = document.getElementById("pickup");
  var returnDate = document.getElementById("return");
  var returnField = document.getElementById("return-field");
  var consumableNote = document.getElementById("consumable-note");

  // Dates cannot be in the past
  pickup.min = todayString();
  returnDate.min = todayString();

  // Update the summary card, quantity limit and return date for the chosen item
  function showChosenItem() {
    var option = itemSelect.options[itemSelect.selectedIndex];
    var available = Number(option.dataset.available);
    var total = Number(option.dataset.total);
    var isTool = option.dataset.type === "tool";
    var name = option.textContent.split(" (")[0];
    var word = isTool ? "available" : "in stock";

    document.getElementById("chosen-title").textContent = name;
    document.getElementById("chosen-type").textContent = isTool ? "Tool (returned)" : "Consumable (used up)";
    document.getElementById("chosen-stock").innerHTML =
      cellsHtml(available, total) + "<span>" + available + " of " + total + " " + word + "</span>";

    qty.max = available;
    if (Number(qty.value) > available) {
      qty.value = available;
    }
    document.getElementById("qty-hint").textContent = "Up to " + available + " " + word + ".";

    // Consumables are used up, so they have no return date
    returnField.hidden = !isTool;
    consumableNote.hidden = isTool;
  }

  // Pre-select the item from the link, e.g. reserve.html?item=soldering-station
  var chosen = new URLSearchParams(window.location.search).get("item");
  if (chosen && itemSelect.querySelector('option[value="' + chosen + '"]')) {
    itemSelect.value = chosen;
  }
  showChosenItem();
  itemSelect.addEventListener("change", showChosenItem);

  reserveForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var ok = true;
    var max = Number(qty.max);
    var isTool = !returnField.hidden;

    // Run every check so all errors show at once
    if (!checkRequired(document.getElementById("fullname"), "full name")) ok = false;
    if (!checkStudentNumber(document.getElementById("studno"))) ok = false;
    if (!checkRequired(document.getElementById("course"), "course and section")) ok = false;
    if (!checkEmail(document.getElementById("email"))) ok = false;
    if (!checkRequired(document.getElementById("purpose"), "purpose")) ok = false;

    var amount = Number(qty.value);
    if (!(amount >= 1 && amount <= max) || Math.floor(amount) !== amount) {
      setError(qty, "Choose a whole number from 1 to " + max + ".");
      ok = false;
    } else {
      setError(qty, "");
    }

    if (pickup.value === "") {
      setError(pickup, "Choose a pickup date.");
      ok = false;
    } else if (pickup.value < todayString()) {
      setError(pickup, "Pickup can't be in the past.");
      ok = false;
    } else {
      setError(pickup, "");
    }

    // Dates are YYYY-MM-DD strings, so comparing them as text works
    if (isTool) {
      if (returnDate.value === "") {
        setError(returnDate, "Choose a return date.");
        ok = false;
      } else if (pickup.value !== "" && returnDate.value < pickup.value) {
        setError(returnDate, "Return date must be on or after pickup.");
        ok = false;
      } else {
        setError(returnDate, "");
      }
    } else {
      setError(returnDate, "");
    }

    var formError = document.getElementById("form-error");
    if (!ok) {
      formError.textContent = "Some fields need fixing. Check the messages above.";
      focusFirstError(reserveForm);
      return;
    }
    formError.textContent = "";

    // Sample reference number; the real site uses the new row's ID from MySQL
    var ref = "HYG-2026-0142";
    document.getElementById("reserve-ref").textContent = ref;
    document.getElementById("track-link").href = "track.html?ref=" + ref;

    reserveForm.hidden = true;
    var success = document.getElementById("reserve-success");
    success.hidden = false;
    success.focus();
  });
}

/* ---------- 5. Track page ---------- */
var trackForm = document.getElementById("track-form");

// Sample requests, one for each status
var sampleRequests = {
  "HYG-2026-0142": { item: "Soldering station", qty: 1, pickup: "Nov 24, 2026", ret: "Nov 26, 2026", status: "pending" },
  "HYG-2026-0137": { item: "Digital multimeter", qty: 2, pickup: "Nov 20, 2026", ret: "Nov 21, 2026", status: "approved" },
  "HYG-2026-0129": { item: "Cordless drill", qty: 1, pickup: "Nov 18, 2026", ret: "Nov 19, 2026", status: "declined" }
};

if (trackForm) {
  var refInput = document.getElementById("ref");

  function showRequest(ref) {
    var data = sampleRequests[ref];
    var result = document.getElementById("track-result");

    if (!data) {
      setError(refInput, "We couldn't find " + ref + ". Check the number, or try a sample below.");
      result.hidden = true;
      return;
    }
    setError(refInput, "");

    // Text for each status: an icon character plus a word, never colour alone
    var labels = {
      pending: { chip: "○ Pending", msg: "An officer hasn't reviewed this yet. Check back later." },
      approved: { chip: "✓ Approved", msg: "Approved. Pick it up at the workshop on your pickup date and bring your PUP ID." },
      declined: { chip: "✕ Declined", msg: "Declined. Email the officers to ask why, or reserve again for other dates." }
    };

    var chip = document.getElementById("r-status");
    chip.textContent = labels[data.status].chip;
    chip.className = "status status-" + data.status;

    document.getElementById("r-ref").textContent = ref;
    document.getElementById("r-title").textContent = data.item;
    document.getElementById("r-message").textContent = labels[data.status].msg;
    document.getElementById("r-qty").textContent = data.qty;
    document.getElementById("r-pickup").textContent = data.pickup;
    document.getElementById("r-return").textContent = data.ret;

    // Fill the progress steps: Sent, Reviewed, Ready for pickup.
    // Done steps get a check mark and darker bar, so it's not colour alone.
    var names = ["Sent", "Reviewed", data.status === "declined" ? "Not approved" : "Ready for pickup"];
    var steps = { pending: 1, approved: 3, declined: 2 };
    for (var i = 1; i <= 3; i++) {
      var step = document.getElementById("p" + i);
      var done = i <= steps[data.status];
      step.classList.toggle("done", done);
      step.textContent = (done ? "✓ " : "") + names[i - 1];
    }

    result.hidden = false;
  }

  // Move focus to the result card (this also scrolls it into view)
  function showResultOnScreen() {
    var result = document.getElementById("track-result");
    if (!result.hidden) {
      result.focus();
    }
  }

  trackForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var ref = refInput.value.trim().toUpperCase();
    refInput.value = ref;
    if (ref === "") {
      setError(refInput, "Enter your reference number.");
      refInput.focus();
      return;
    }
    if (!/^HYG-\d{4}-\d{4}$/.test(ref)) {
      setError(refInput, "Use the format HYG-2026-0142.");
      refInput.focus();
      return;
    }
    showRequest(ref);
    showResultOnScreen();
  });

  // Sample buttons fill the box and look it up
  var sampleButtons = document.querySelectorAll("[data-ref]");
  for (var s = 0; s < sampleButtons.length; s++) {
    sampleButtons[s].addEventListener("click", function () {
      refInput.value = this.dataset.ref;
      showRequest(this.dataset.ref);
      showResultOnScreen();
    });
  }

  // Coming from the Reserve success link: track.html?ref=HYG-2026-0142
  var fromLink = new URLSearchParams(window.location.search).get("ref");
  if (fromLink) {
    refInput.value = fromLink.toUpperCase();
    showRequest(refInput.value);
  }
}

/* ---------- 6. Join page ---------- */
var joinForm = document.getElementById("join-form");

if (joinForm) {
  joinForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var ok = true;
    var name = document.getElementById("j-name");
    var email = document.getElementById("j-email");
    var course = document.getElementById("j-course");
    var year = document.getElementById("j-year");
    var committee = document.getElementById("j-committee");
    var reason = document.getElementById("j-reason");

    if (!checkRequired(name, "full name")) ok = false;
    if (!checkStudentNumber(document.getElementById("j-studno"))) ok = false;
    if (!checkEmail(email)) ok = false;

    if (course.value === "") {
      setError(course, "Choose your course.");
      ok = false;
    } else {
      setError(course, "");
    }

    if (!/^\d-\d{1,2}$/.test(year.value.trim())) {
      setError(year, "Write it like 1-2 (year, dash, section).");
      ok = false;
    } else {
      setError(year, "");
    }

    if (committee.value === "") {
      setError(committee, "Choose a committee, or pick Not sure yet.");
      ok = false;
    } else {
      setError(committee, "");
    }

    if (reason.value.trim().length < 20) {
      setError(reason, "Tell us a bit more (at least 20 characters).");
      ok = false;
    } else {
      setError(reason, "");
    }

    var formError = document.getElementById("join-form-error");
    if (!ok) {
      formError.textContent = "Some fields need fixing. Check the messages above.";
      focusFirstError(joinForm);
      return;
    }
    formError.textContent = "";

    document.getElementById("join-first").textContent = name.value.trim().split(" ")[0];
    document.getElementById("join-email").textContent = email.value.trim();
    joinForm.hidden = true;
    var success = document.getElementById("join-success");
    success.hidden = false;
    success.focus();
  });
}

/* ---------- 7. Officer page ---------- */
var loginForm = document.getElementById("login-form");

if (loginForm) {
  var loginView = document.getElementById("login-view");
  var dashView = document.getElementById("dash-view");
  var deskStatus = document.getElementById("desk-status");

  // Prototype only: any username and password opens the sample desk
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var userOk = checkRequired(document.getElementById("o-user"), "username");
    var passOk = checkRequired(document.getElementById("o-pass"), "password");
    if (!userOk || !passOk) {
      focusFirstError(loginForm);
      return;
    }
    loginView.hidden = true;
    dashView.hidden = false;
    document.getElementById("dash-title").focus();
  });

  document.getElementById("logout").addEventListener("click", function () {
    dashView.hidden = true;
    loginView.hidden = false;
    loginForm.reset();
    document.getElementById("o-user").focus();
  });

  // Approve or Decline: replace the buttons with a status chip
  var decideButtons = document.querySelectorAll("[data-decide]");
  for (var b = 0; b < decideButtons.length; b++) {
    decideButtons[b].addEventListener("click", function () {
      var cell = this.parentElement;
      var row = cell.parentElement;
      var ref = row.cells[0].textContent;
      var approved = this.dataset.decide === "approve";

      cell.innerHTML = approved
        ? '<span class="status status-approved">✓ Approved</span>'
        : '<span class="status status-declined">✕ Declined</span>';

      // One fewer pending request
      var counter = document.getElementById("pending-count");
      counter.textContent = Number(counter.textContent) - 1;
      deskStatus.textContent = ref + (approved ? " approved." : " declined.");
    });
  }
}
