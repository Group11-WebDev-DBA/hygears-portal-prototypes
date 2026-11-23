/* =========================================================
   PUP Hygears Web Portal - page behaviour (plain JavaScript)
   Every page loads this one file. Each section first checks
   that its element exists, so it only runs on its own page.
   There is no server yet: the PHP version must check every
   form again on the server.
   ========================================================= */

// JavaScript is on, so remove the "no-js" fallback class
document.documentElement.classList.remove("no-js");

// Today's date as "YYYY-MM-DD" (the format date inputs use)
function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

// Read the ?name=value part of the page address
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Say something to screen-reader users (the #live element is on every page)
function announce(message) {
  const live = document.getElementById("live");
  live.textContent = "";
  setTimeout(function () { live.textContent = message; }, 50);
}

// localStorage remembers reference numbers made on this phone.
// try/catch: some browsers block storage for files opened by double-click.
function loadSaved(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* not saved, page still works */ }
}


/* ---------- 1. Mobile menu button ---------- */
const menuBtn = document.querySelector(".menu-btn");
const nav = document.getElementById("site-nav");

if (menuBtn) {
  menuBtn.addEventListener("click", function () {
    const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
  });

  // Escape closes the menu
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
      menuBtn.click();
      menuBtn.focus();
    }
  });
}


/* ---------- 2. Form checking (used by every form) ----------
   Each input says what it needs with normal HTML attributes
   (required, pattern, minlength, type="email") and its error
   messages in data- attributes, for example
   data-required="Enter your full name."                       */

// Returns the error message for one field, or "" if it's fine
function checkField(field) {
  const value = field.value.trim();
  if (field.disabled) return "";

  if (field.required && value === "") {
    return field.dataset.required || "This field is required.";
  }
  if (value === "") return "";

  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return field.dataset.type || "Enter a valid email.";
  }
  const pattern = field.getAttribute("pattern");
  if (pattern && !new RegExp("^(" + pattern + ")$").test(value)) {
    return field.dataset.pattern || "Check the format.";
  }
  const minLength = field.getAttribute("minlength");
  if (minLength && value.length < Number(minLength)) {
    return field.dataset.short || "Write a little more.";
  }
  if (field.type === "number") {
    const n = Number(value);
    if (n < Number(field.min || 1) || (field.max && n > Number(field.max))) {
      return field.dataset.range || "Check the number.";
    }
  }
  // Extra rules a page adds itself (like date order) go in data-extra-error
  return field.dataset.extraError || "";
}

// Shows or clears the message under a field. Returns the message.
function showError(field) {
  const message = checkField(field);
  const errorBox = document.getElementById(field.id + "-err");
  if (errorBox) errorBox.textContent = message;
  if (message) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }
  return message;
}

// Connects a form: checks fields, lists problems, then calls onSuccess.
// extraChecks is an optional function for rules that compare two fields.
function setupForm(form, summaryBox, extraChecks, onSuccess) {
  const fields = form.querySelectorAll("input[id], select[id], textarea[id]");

  fields.forEach(function (field) {
    // Check a field when the user leaves it (only if they typed something)
    field.addEventListener("blur", function () {
      if (field.value !== "" || form.dataset.tried) {
        if (extraChecks) extraChecks();
        showError(field);
      }
    });
    // Once a field shows an error, re-check it while they fix it
    field.addEventListener("input", function () {
      if (field.getAttribute("aria-invalid")) {
        if (extraChecks) extraChecks();
        showError(field);
      }
    });
  });

  // Clicking a problem in the summary jumps into that field
  if (summaryBox) {
    summaryBox.addEventListener("click", function (e) {
      const link = e.target.closest("a");
      if (link) {
        e.preventDefault();
        document.getElementById(link.getAttribute("href").slice(1)).focus();
      }
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();               // no server yet, so stay on the page
    form.dataset.tried = "yes";
    if (extraChecks) extraChecks();

    const problems = [];
    fields.forEach(function (field) {
      if (showError(field)) problems.push(field);
    });

    if (problems.length > 0) {
      if (summaryBox) {
        // List every problem at the top, each one a link to its field
        let html = "<h2>Fix " + problems.length + (problems.length === 1 ? " thing" : " things") + " to continue</h2><ul>";
        problems.forEach(function (field) {
          html += '<li><a href="#' + field.id + '">' + checkField(field) + "</a></li>";
        });
        summaryBox.innerHTML = html + "</ul>";
        summaryBox.hidden = false;
        summaryBox.focus();
      } else {
        problems[0].focus();
      }
      return;
    }

    if (summaryBox) summaryBox.hidden = true;

    // Show a short "sending" state, like waiting for the server
    const button = form.querySelector('button[type="submit"]');
    const oldLabel = button.innerHTML;
    button.disabled = true;
    button.textContent = button.dataset.busy || "Sending...";
    setTimeout(function () {
      button.disabled = false;
      button.innerHTML = oldLabel;
      onSuccess();
    }, 600);
  });
}


/* ---------- 3. Tools page: search and filters ---------- */
const catalog = document.getElementById("catalog");

if (catalog) {
  const items = catalog.querySelectorAll(".item");
  const search = document.getElementById("f-search");
  const availableOnly = document.getElementById("f-avail");
  const chips = document.querySelectorAll(".chip");
  let category = "";

  // Hide the cards that don't match, then update the count
  function filterItems() {
    const words = search.value.trim().toLowerCase();
    const type = document.querySelector('input[name="type"]:checked').value;
    let shown = 0;

    items.forEach(function (card) {
      const matches =
        (words === "" || card.dataset.name.includes(words)) &&
        (category === "" || card.dataset.category === category) &&
        (type === "" || card.dataset.type === type) &&
        (!availableOnly.checked || card.dataset.available !== "0");
      card.hidden = !matches;
      if (matches) shown++;
    });

    document.getElementById("count").textContent = "Showing " + shown + " of " + items.length + " items";
    document.getElementById("empty").hidden = shown > 0;
  }

  search.addEventListener("input", filterItems);
  availableOnly.addEventListener("change", filterItems);
  document.querySelectorAll('input[name="type"]').forEach(function (radio) {
    radio.addEventListener("change", filterItems);
  });

  // Only one category chip is pressed at a time
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      chip.setAttribute("aria-pressed", "true");
      category = chip.dataset.cat;
      filterItems();
    });
  });

  document.getElementById("clear").addEventListener("click", function () {
    search.value = "";
    availableOnly.checked = false;
    document.querySelector('input[name="type"][value=""]').checked = true;
    chips[0].click();
    search.focus();
  });

  filterItems();
}


/* ---------- 4. Reserve page ---------- */
const reserveForm = document.getElementById("reserve-form");

if (reserveForm) {
  const itemSelect = document.getElementById("r-item");
  const qty = document.getElementById("r-qty");
  const pickup = document.getElementById("r-pickup");
  const returnDate = document.getElementById("r-return");
  const returnField = document.getElementById("return-field");

  pickup.min = todayString();

  // When the item changes: update the quantity limit, and hide the
  // return date for consumables (they are used up, not returned)
  function updateItem() {
    const option = itemSelect.options[itemSelect.selectedIndex];
    const available = Number(option.dataset.available || 0);
    const isConsumable = option.dataset.type === "consumable";

    qty.max = available || 1;
    qty.dataset.range = available ? "You can reserve 1 to " + available + " right now." : "Choose an item first.";
    document.getElementById("r-qty-hint").textContent =
      available ? available + " " + option.dataset.unit + " available now" : "Choose an item first";

    returnField.hidden = isConsumable;
    returnDate.disabled = isConsumable;
    if (isConsumable) { returnDate.value = ""; showError(returnDate); }
  }

  // Date rules that compare fields
  function checkDates() {
    pickup.dataset.extraError = pickup.value && pickup.value < todayString() ? "Pickup can't be in the past." : "";
    returnDate.min = pickup.value || todayString();
    returnDate.dataset.extraError = returnDate.value && pickup.value && returnDate.value < pickup.value
      ? "Return date must be on or after the pickup date." : "";
  }

  itemSelect.addEventListener("change", function () {
    updateItem();
    if (qty.value) showError(qty);
  });

  // Coming from a Reserve button on the Tools page: ?item=soldering
  const chosen = getParam("item");
  if (chosen && itemSelect.querySelector('option[value="' + chosen + '"]:not([disabled])')) {
    itemSelect.value = chosen;
  }
  updateItem();

  setupForm(reserveForm, document.getElementById("r-summary"), checkDates, function () {
    // Make the next reference number, like HYG-2026-0143
    const next = loadSaved("hyg-seq", 142) + 1;
    save("hyg-seq", next);
    const ref = "HYG-" + new Date().getFullYear() + "-" + String(next).padStart(4, "0");

    const itemName = itemSelect.options[itemSelect.selectedIndex].text.replace(/ \(.*\)$/, "");
    const summary = itemName + " × " + qty.value;
    const saved = loadSaved("hyg-refs", {});
    saved[ref] = summary;
    save("hyg-refs", saved);

    document.getElementById("ref-out").textContent = ref;
    document.getElementById("ref-summary").textContent =
      summary + ", pickup " + pickup.value + (returnDate.disabled ? "" : ", return " + returnDate.value) + ".";
    document.getElementById("ref-track").href = "track.html?ref=" + ref;

    reserveForm.hidden = true;
    const done = document.getElementById("reserve-done");
    done.hidden = false;
    done.focus();
    announce("Request sent. Your reference number is " + ref + ".");
  });
}


/* ---------- 5. Track page ---------- */
const trackForm = document.getElementById("track-form");

if (trackForm) {
  // Sample requests, one per status (the real ones come from MySQL)
  const samples = {
    "HYG-2026-0137": ["Pending", "Digital multimeter × 1", "An officer hasn't reviewed it yet. Check again later."],
    "HYG-2026-0142": ["Approved", "Soldering station × 1", "Pick it up on your pickup date at the Hygears area. Bring your PUP ID."],
    "HYG-2026-0129": ["Declined", "Heat gun × 1", "Not available on those dates. Try other dates or another item."]
  };
  // Icons for each status (same SVG style as the rest of the site)
  const icons = {
    Pending: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    Approved: '<path d="M20 6 9 17l-5-5"/>',
    Declined: '<path d="M18 6 6 18M6 6l12 12"/>'
  };
  const refInput = document.getElementById("t-ref");
  const output = document.getElementById("track-out");

  function showResult() {
    const ref = refInput.value.trim().toUpperCase();
    refInput.value = ref;
    const mine = loadSaved("hyg-refs", {});
    let result = samples[ref];
    if (!result && mine[ref]) result = ["Pending", mine[ref], "Sent from this phone. An officer hasn't reviewed it yet."];

    if (!result) {
      document.getElementById("t-ref-err").textContent = "We couldn't find " + ref + ". Check the number on your confirmation.";
      refInput.setAttribute("aria-invalid", "true");
      refInput.focus();
      output.innerHTML = "";
      return;
    }

    const state = result[0];
    output.innerHTML =
      '<article class="card result"><h2 class="h3">Result</h2>' +
      '<div class="plate plate--ref"><span class="plate-label">Reference number</span>' +
      '<span class="plate-num">' + ref + "</span>" +
      '<span class="status status--' + state.toLowerCase() + '"><svg class="i" viewBox="0 0 24 24" aria-hidden="true">' +
      icons[state] + "</svg>" + state + "</span></div>" +
      '<p class="result-item">' + result[1] + "</p><p>" + result[2] + "</p></article>";
  }

  setupForm(trackForm, null, null, showResult);

  // Coming from the home page box or a Track button: ?ref=HYG-2026-0142
  const startRef = getParam("ref");
  if (startRef) {
    refInput.value = startRef;
    if (!showError(refInput)) showResult();
  }
}


/* ---------- 6. Join page ---------- */
const joinForm = document.getElementById("join-form");

if (joinForm) {
  setupForm(joinForm, document.getElementById("j-summary"), null, function () {
    const firstName = document.getElementById("j-name").value.trim().split(" ")[0];
    const email = document.getElementById("j-email").value.trim();
    document.getElementById("join-summary").textContent =
      "Thanks, " + firstName + ". The officers will email you at " + email + " about the next step.";
    joinForm.hidden = true;
    const done = document.getElementById("join-done");
    done.hidden = false;
    done.focus();
    announce("Application sent.");
  });
}


/* ---------- 7. Officer page (sample data, no real login) ---------- */
const loginForm = document.getElementById("login-form");

if (loginForm) {
  const loginView = document.getElementById("login-view");
  const dashView = document.getElementById("dash-view");

  setupForm(loginForm, null, null, function () {
    loginView.hidden = true;
    dashView.hidden = false;
    document.getElementById("dash-h").focus();
  });

  document.getElementById("sign-out").addEventListener("click", function () {
    dashView.hidden = true;
    loginView.hidden = false;
    loginForm.reset();
    document.getElementById("o-email").focus();
  });

  // Count the rows in a table that still have an action button
  function countOpen(headingId) {
    const rows = document.querySelectorAll("#" + headingId + " + .table-wrap tbody tr");
    let open = 0;
    rows.forEach(function (row) {
      if (row.querySelector("button[data-act]")) open++;
    });
    return open;
  }
  function updateCounters() {
    document.getElementById("pend-count").textContent = countOpen("pend-h");
    document.getElementById("over-count").textContent = countOpen("over-h");
    document.getElementById("apps-count").textContent = countOpen("apps-h");
  }

  // One click listener for every Approve / Decline / Mark / Undo button
  dashView.addEventListener("click", function (e) {
    const actionBtn = e.target.closest("button[data-act]");
    const undoBtn = e.target.closest("button[data-undo]");

    if (actionBtn) {
      const cell = actionBtn.parentNode;                          // the div.row-actions around the buttons
      const action = actionBtn.dataset.act;                       // "Approved", "Declined", ...
      const who = actionBtn.closest("tr").querySelector("th").textContent.trim();
      const icon = actionBtn.querySelector("svg").outerHTML;      // reuse the button's icon

      cell.dataset.oldHtml = cell.innerHTML;                      // remember the buttons for Undo
      cell.innerHTML =
        '<span class="status status--' + action.toLowerCase() + '">' + icon + action + "</span>" +
        '<button class="btn btn--sm" type="button" data-undo>Undo<span class="sr-only"> ' + who + "</span></button>";
      cell.querySelector("button").focus();
      updateCounters();
      announce(who + " marked " + action.toLowerCase() + ".");
    }

    if (undoBtn) {
      const cell = undoBtn.parentNode;
      cell.innerHTML = cell.dataset.oldHtml;
      cell.querySelector("button").focus();
      updateCounters();
      announce("Undone.");
    }
  });
}
