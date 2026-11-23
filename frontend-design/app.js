/* Hygears Web Portal prototype: page states in plain JavaScript.
   The item list below stands in for the MySQL table the PHP site will read. */
(function () {
  "use strict";

  // ---------- Sample data (labelled as sample on every page) ----------
  var ITEMS = [
    { id: "multimeter", name: "Digital multimeter", cat: "Electrical", type: "tool", avail: 3, total: 4, use: "Check voltage, current and continuity on a circuit." },
    { id: "soldering", name: "Soldering station", cat: "Electrical", type: "tool", avail: 2, total: 3, use: "Join wires and components on boards and harnesses." },
    { id: "drill", name: "Cordless drill", cat: "Power tools", type: "tool", avail: 0, total: 2, use: "Drill holes and drive screws in metal, wood and plastic." },
    { id: "torque", name: "Torque wrench", cat: "Hand tools", type: "tool", avail: 1, total: 2, use: "Tighten bolts to an exact torque setting." },
    { id: "crimper", name: "Wire crimper", cat: "Hand tools", type: "tool", avail: 4, total: 4, use: "Fix connectors and terminals onto wire ends." },
    { id: "heatgun", name: "Heat gun", cat: "Power tools", type: "tool", avail: 1, total: 1, use: "Shrink tubing and soften plastic for shaping." },
    { id: "goggles", name: "Safety goggles", cat: "Safety", type: "tool", avail: 10, total: 12, use: "Protect your eyes while cutting, drilling or soldering." },
    { id: "filament", name: "PLA filament 1kg", cat: "Materials", type: "consumable", avail: 3, use: "Print parts and prototypes on a 3D printer." },
    { id: "shrink", name: "Heat-shrink tubing pack", cat: "Electrical", type: "consumable", avail: 6, use: "Insulate and protect soldered joints." },
    { id: "zipties", name: "Zip ties pack", cat: "Materials", type: "consumable", avail: 0, use: "Bundle and secure cables and hoses." },
    { id: "tape", name: "Electrical tape", cat: "Electrical", type: "consumable", avail: 9, use: "Insulate and mark wires." },
    { id: "epoxy", name: "Epoxy resin kit", cat: "Materials", type: "consumable", avail: 2, use: "Bond and fill parts that need a strong, hard joint." }
  ];

  var REQUESTS = {
    "HYG-2026-0142": { status: "pending", item: "Soldering station", qty: 1, pickup: "Nov 24, 2026", ret: "Nov 26, 2026" },
    "HYG-2026-0137": { status: "approved", item: "Digital multimeter", qty: 1, pickup: "Nov 23, 2026", ret: "Nov 25, 2026" },
    "HYG-2026-0129": { status: "declined", item: "Cordless drill", qty: 2, pickup: "Nov 21, 2026", ret: "Nov 28, 2026", note: "Both drills are out that week. Try another date." }
  };

  // ---------- Tool silhouettes (64 x 64), injected once so every page can <use> them ----------
  var SHAPES = {
    multimeter: '<path fill-rule="evenodd" d="M22 5h20a6 6 0 0 1 6 6v42a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V11a6 6 0 0 1 6-6zM22 11v14h20V11zM32 33a8 8 0 1 0 0 16a8 8 0 1 0 0-16z"/><rect x="14" y="57" width="4" height="6" rx="2"/><rect x="46" y="57" width="4" height="6" rx="2"/>',
    soldering: '<rect x="6" y="46" width="30" height="13" rx="3"/><rect x="26" y="6" width="9" height="34" rx="4.5" transform="rotate(38 30 23)"/><path d="M47 2l7 2-11 14-3-2z"/><path d="M20 46c0-8 4-12 10-16" fill="none" stroke-width="3"/>',
    drill: '<rect x="10" y="12" width="38" height="17" rx="5"/><rect x="48" y="16" width="7" height="9"/><rect x="55" y="19" width="8" height="3"/><path d="M20 29h13l3 21H23z"/><rect x="15" y="49" width="26" height="10" rx="2"/>',
    torque: '<rect x="6" y="28.5" width="44" height="7" rx="3.5"/><rect x="4" y="26" width="18" height="12" rx="5"/><path fill-rule="evenodd" d="M54 22a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM54 28a4 4 0 1 1 0 8a4 4 0 1 1 0-8z"/>',
    crimper: '<path fill-rule="evenodd" d="M16 6a11 11 0 1 0 0 22a11 11 0 1 0 0-22zM16 13a4 4 0 1 1 0 8a4 4 0 1 1 0-8z"/><path d="M22 24l36 26-4 6-37-28z"/><path d="M25 16l37 18-2 7-38-19z"/>',
    heatgun: '<rect x="8" y="12" width="40" height="18" rx="9"/><rect x="46" y="15" width="13" height="12" rx="2"/><path d="M20 28h13l5 29H26z"/><circle cx="14" cy="21" r="3" fill="none"/>',
    goggles: '<rect x="1" y="29" width="62" height="5" rx="2"/><ellipse cx="20" cy="32" rx="14" ry="11"/><ellipse cx="44" cy="32" rx="14" ry="11"/>',
    filament: '<path fill-rule="evenodd" d="M32 5a27 27 0 1 0 0 54a27 27 0 1 0 0-54zM32 25a7 7 0 1 1 0 14a7 7 0 1 1 0-14z"/>',
    shrink: '<rect x="10" y="6" width="8" height="52" rx="4"/><rect x="22" y="10" width="7" height="48" rx="3.5"/><rect x="33" y="14" width="6" height="44" rx="3"/><rect x="43" y="18" width="5" height="40" rx="2.5"/><rect x="52" y="22" width="4" height="36" rx="2"/>',
    zipties: '<rect x="12" y="13" width="48" height="4" rx="2"/><rect x="4" y="11" width="9" height="8" rx="1"/><rect x="12" y="30" width="48" height="4" rx="2"/><rect x="4" y="28" width="9" height="8" rx="1"/><rect x="12" y="47" width="48" height="4" rx="2"/><rect x="4" y="45" width="9" height="8" rx="1"/>',
    tape: '<path fill-rule="evenodd" d="M30 8a23 23 0 1 0 0 46a23 23 0 1 0 0-46zM30 20a11 11 0 1 1 0 22a11 11 0 1 1 0-22z"/><path d="M50 40l12 14-6 4-10-12z"/>',
    epoxy: '<rect x="12" y="16" width="16" height="42" rx="3"/><rect x="16" y="7" width="8" height="10" rx="1"/><rect x="34" y="22" width="16" height="36" rx="3"/><rect x="38" y="13" width="8" height="10" rx="1"/>'
  };

  var ICON = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    cross: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>'
  };

  function injectSprite() {
    var syms = Object.keys(SHAPES).map(function (k) {
      return '<symbol id="t-' + k + '" viewBox="0 0 64 64">' + SHAPES[k] + "</symbol>";
    }).join("");
    var holder = document.createElement("div");
    holder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' + syms + "</svg>";
    document.body.insertBefore(holder.firstChild, document.body.firstChild);
  }

  function find(id) {
    for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i];
    return null;
  }

  function countText(it, short) {
    if (short && it.avail > 0) return it.avail + " left";
    if (it.avail === 0) return "None left";
    return it.type === "tool" ? it.avail + " of " + it.total + " on the wall" : it.avail + " left";
  }

  function toolSvg(it) {
    return '<svg class="tool" viewBox="0 0 64 64" aria-hidden="true"><use href="#t-' + it.id + '"/></svg>';
  }

  // ---------- Board rendering ----------
  function slotHtml(it, i, mini) {
    var out = it.avail === 0;
    var count = '<p class="slot__count">' + (out ? ICON.cross : ICON.check) + countText(it, mini) + "</p>";
    var typeText = it.type === "tool" ? "Tool, return after use" : "Consumable, used up";
    if (mini) {
      return '<li class="slot' + (out ? " is-out" : "") + '">' +
        '<a class="slot__link" href="' + (out ? "tools.html" : "reserve.html?item=" + it.id) + '">' +
        '<div class="slot__wall">' + toolSvg(it) + "</div>" +
        '<div class="slot__plate"><h3 class="slot__name">' + it.name + "</h3>" + count + "</div></a></li>";
    }
    var action = out
      ? '<span class="btn btn--off btn--block" aria-disabled="true">None left</span>'
      : '<a class="btn btn--primary btn--block" href="reserve.html?item=' + it.id + '" aria-label="Reserve ' + it.name + '">Reserve</a>';
    return '<li class="slot' + (out ? " is-out" : "") + '">' +
      '<div class="slot__wall">' + toolSvg(it) + "</div>" +
      '<div class="slot__plate"><h3 class="slot__name">' + it.name + "</h3>" +
      '<p class="slot__use">' + it.use + "</p>" +
      '<p class="slot__meta">' + it.cat + "<br>" + typeText + "</p>" + count + action + "</div></li>";
  }

  function renderBoard(el, list, mini) {
    if (!list.length) {
      el.innerHTML = '<li class="empty"><strong>No items match.</strong> Clear the search or pick "All" to see the whole wall.</li>';
      return;
    }
    el.innerHTML = list.map(function (it, i) { return slotHtml(it, i, mini); }).join("");
  }

  // ---------- Home ----------
  function initHome() {
    var el = document.getElementById("mini-board");
    if (!el) return;
    renderBoard(el, ITEMS.slice(0, 6), true);
    el.classList.add("is-hanging");
  }

  // ---------- Tools: search + category + type filters ----------
  function initTools() {
    var el = document.getElementById("board");
    if (!el) return;
    var q = document.getElementById("search");
    var note = document.getElementById("results-note");
    var state = { cat: "All", type: "all" };

    function apply() {
      var term = q.value.trim().toLowerCase();
      var list = ITEMS.filter(function (it) {
        return (state.cat === "All" || it.cat === state.cat) &&
          (state.type === "all" || it.type === state.type) &&
          (!term || (it.name + " " + it.cat + " " + it.use).toLowerCase().indexOf(term) > -1);
      });
      renderBoard(el, list, false);
      note.textContent = list.length === 1 ? "1 item shown" : list.length + " items shown";
    }

    function wireChips(groupId, key) {
      var group = document.getElementById(groupId);
      group.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        group.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        state[key] = btn.dataset.value;
        apply();
      });
    }
    wireChips("cat-chips", "cat");
    wireChips("type-chips", "type");
    q.addEventListener("input", apply);
    document.getElementById("filter-form").addEventListener("submit", function (e) { e.preventDefault(); apply(); });
    apply();
  }

  // ---------- Shared form validation ----------
  // Each rule returns an error message or "" when the value is fine.
  function validate(form, rules) {
    var firstBad = null, bad = 0;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      var node = input.length && !input.tagName ? input[0] : input;
      var field = node.closest(".field");
      if (field.hidden) return;
      var msg = rules[name](input.value !== undefined ? input.value.trim() : "", input);
      var err = field.querySelector(".error");
      field.classList.toggle("has-error", !!msg);
      if (err) err.lastChild.textContent = msg;
      if (node.setAttribute) node.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) { bad++; if (!firstBad) firstBad = node; }
    });
    return { bad: bad, first: firstBad };
  }

  function showSummary(form, result) {
    var box = form.querySelector(".form-summary");
    if (result.bad) {
      box.textContent = result.bad === 1 ? "1 field needs fixing before you can send this." : result.bad + " fields need fixing before you can send this.";
      box.classList.add("is-shown");
      result.first.focus();
    } else {
      box.classList.remove("is-shown");
    }
  }

  var req = function (label) { return function (v) { return v ? "" : "Enter your " + label + "."; }; };
  var studentNo = function (v) {
    if (!v) return "Enter your student number.";
    return /^\d{4}-\d{5}-[A-Za-z]{2}-\d$/.test(v) ? "" : "Use the format on your PUP ID, like 2024-00123-MN-0.";
  };
  var email = function (v) {
    if (!v) return "Enter your email so we can send updates.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "That email is missing something. Check for the @ and the domain.";
  };
  function todayIso() {
    var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  function niceDate(iso) {
    var p = iso.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  // ---------- Reserve ----------
  function initReserve() {
    var form = document.getElementById("reserve-form");
    if (!form) return;
    var select = form.elements.itemId;
    var params = new URLSearchParams(location.search);
    select.innerHTML = '<option value="">Choose an item</option>' + ITEMS.map(function (it) {
      return '<option value="' + it.id + '"' + (it.avail === 0 ? " disabled" : "") + ">" + it.name + (it.avail === 0 ? " (none left)" : " (" + it.avail + " available)") + "</option>";
    }).join("");
    var pre = find(params.get("item"));
    if (pre && pre.avail > 0) select.value = pre.id;

    var today = todayIso();
    form.elements.pickup.min = today;
    form.elements.returnDate.min = today;

    var summary = document.getElementById("item-summary");
    var returnField = document.getElementById("return-field");
    var qtyHint = document.getElementById("qty-hint");

    function sync() {
      var it = find(select.value);
      if (!it) { summary.hidden = true; returnField.hidden = false; qtyHint.textContent = "How many you need."; return; }
      summary.hidden = false;
      summary.querySelector(".slot__wall").innerHTML = toolSvg(it);
      summary.querySelector("h2").textContent = it.name;
      summary.querySelector(".item-use").textContent = it.use;
      summary.querySelector(".item-count").textContent = countText(it) + ". " + (it.type === "tool" ? "Return it by your return date." : "Consumable, you keep it.");
      form.elements.qty.max = it.avail;
      qtyHint.textContent = "Up to " + it.avail + ".";
      // consumables are used up, so there is no return date
      returnField.hidden = it.type !== "tool";
    }
    select.addEventListener("change", sync);
    form.elements.pickup.addEventListener("change", function () { form.elements.returnDate.min = form.elements.pickup.value || today; });
    sync();

    var KEEP = ["fullName", "studentNo", "email", "course"];
    try {
      var saved = JSON.parse(localStorage.getItem("hyg-student") || "{}");
      KEEP.forEach(function (k) { if (saved[k]) form.elements[k].value = saved[k]; });
    } catch (err) { /* storage blocked: the form still works, just not prefilled */ }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var it = find(select.value);
      var result = validate(form, {
        fullName: req("full name"),
        studentNo: studentNo,
        email: email,
        course: req("course and section"),
        itemId: function (v) { return v ? "" : "Choose the item you want to borrow."; },
        qty: function (v) {
          var n = parseInt(v, 10);
          if (!v || isNaN(n) || n < 1) return "Enter how many you need (at least 1).";
          return it && n > it.avail ? "Only " + it.avail + " available right now." : "";
        },
        purpose: function (v) { return v.length >= 10 ? "" : "Tell us what it's for in a sentence, like \"motor wiring for the Luna build\"."; },
        pickup: function (v) {
          if (!v) return "Pick the day you'll collect it.";
          return v < today ? "Pickup can't be in the past." : "";
        },
        returnDate: function (v) {
          if (!v) return "Pick the day you'll bring it back.";
          return v < form.elements.pickup.value ? "Return date must be on or after the pickup date." : "";
        }
      });
      showSummary(form, result);
      if (result.bad) return;

      try {
        var keep = {};
        KEEP.forEach(function (k) { keep[k] = form.elements[k].value.trim(); });
        localStorage.setItem("hyg-student", JSON.stringify(keep));
      } catch (err) { /* ignore */ }
      var done = document.getElementById("reserve-done");
      done.querySelector("[data-item]").textContent = form.elements.qty.value + " x " + it.name;
      done.querySelector("[data-pickup]").textContent = niceDate(form.elements.pickup.value);
      done.querySelector("[data-return]").textContent = it.type === "tool" ? niceDate(form.elements.returnDate.value) : "Not needed, consumable";
      done.querySelector("[data-email]").textContent = form.elements.email.value.trim();
      form.hidden = true;
      summary.hidden = true;
      done.hidden = false;
      done.querySelector(".tag").classList.add("is-new");
      done.querySelector("h2").focus();
    });
  }

  // ---------- Track ----------
  function tagHtml(ref, r, isNew) {
    var labels = { pending: [ICON.clock, "Pending"], approved: [ICON.check, "Approved"], declined: [ICON.cross, "Declined"] };
    var steps = { pending: [1, 0, 0], approved: [1, 1, 0], declined: [1, 1, -1] };
    var s = steps[r.status];
    var stepNames = ["Request sent", r.status === "declined" ? "Declined by an officer" : "Approved by an officer", "Picked up at the workshop"];
    var lis = stepNames.map(function (n, i) {
      return '<li class="' + (s[i] === 1 ? "is-done" : s[i] === -1 ? "is-stop" : "") + '">' + n + "</li>";
    }).join("");
    var nextLine = {
      pending: "An officer will review it. Check back here or watch your email.",
      approved: "Bring your PUP ID on your pickup date.",
      declined: r.note || "See the note from the officer."
    }[r.status];
    return '<article class="tag tag--' + r.status + (isNew ? " is-new" : "") + '">' +
      '<span class="status">' + labels[r.status][0] + labels[r.status][1] + "</span>" +
      '<span class="tag__ref">' + ref + "</span>" +
      "<dl><dt>Item</dt><dd>" + r.qty + " x " + r.item + "</dd><dt>Pickup</dt><dd>" + r.pickup + "</dd><dt>Return</dt><dd>" + r.ret + "</dd></dl>" +
      '<ol class="steps">' + lis + "</ol>" +
      '<p class="mt-4 m-b0">' + nextLine + "</p></article>";
  }

  function initTrack() {
    var form = document.getElementById("track-form");
    if (!form) return;
    var out = document.getElementById("track-result");
    document.getElementById("examples").innerHTML = Object.keys(REQUESTS).map(function (ref) { return tagHtml(ref, REQUESTS[ref], false); }).join("");

    function lookup(ref) {
      var r = REQUESTS[ref];
      if (r) {
        out.innerHTML = "<h2 class=\"visually-hidden\">Result</h2>" + tagHtml(ref, r, true);
      } else {
        out.innerHTML = '<div class="empty"><strong>No request found for ' + ref + ".</strong> Check the number in your confirmation email. It looks like HYG-2026-0142.</div>";
      }
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.elements.ref;
      input.value = input.value.trim().toUpperCase();
      var result = validate(form, {
        ref: function (v) {
          if (!v) return "Enter the reference number from your confirmation.";
          return /^HYG-\d{4}-\d{4}$/.test(v) ? "" : "Reference numbers look like HYG-2026-0142.";
        }
      });
      if (result.bad) { result.first.focus(); out.innerHTML = ""; return; }
      lookup(input.value);
    });
    document.querySelectorAll("[data-try]").forEach(function (b) {
      b.addEventListener("click", function () { form.elements.ref.value = b.dataset.try; form.requestSubmit(); });
    });
  }

  // ---------- Join ----------
  function initJoin() {
    var form = document.getElementById("join-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var result = validate(form, {
        fullName: req("full name"),
        studentNo: studentNo,
        email: email,
        course: req("course"),
        yearSection: function (v) { return v ? "" : "Enter your year and section, like 1-2."; },
        committee: function (v, input) {
          return form.querySelector('input[name="committee"]:checked') ? "" : "Pick the committee you'd most like to join. You can change later.";
        },
        reason: function (v) { return v.length >= 20 ? "" : "Write at least a sentence or two (20 characters or more)."; }
      });
      showSummary(form, result);
      if (result.bad) return;
      var done = document.getElementById("join-done");
      done.querySelector("[data-name]").textContent = form.elements.fullName.value.trim().split(" ")[0];
      done.querySelector("[data-committee]").textContent = form.querySelector('input[name="committee"]:checked').value;
      done.querySelector("[data-email]").textContent = form.elements.email.value.trim();
      form.hidden = true;
      done.hidden = false;
      done.querySelector("h2").focus();
    });
  }

  // ---------- Officer ----------
  function initOfficer() {
    var login = document.getElementById("login-form");
    if (!login) return;
    var dash = document.getElementById("dashboard");
    var loginWrap = document.getElementById("login");
    var live = document.getElementById("desk-live");

    function open() {
      loginWrap.hidden = true;
      dash.hidden = false;
      dash.querySelector("h1").focus();
    }
    login.addEventListener("submit", function (e) {
      e.preventDefault();
      var result = validate(login, {
        officerEmail: email,
        password: function (v) { return v ? "" : "Enter your password."; }
      });
      if (result.bad) { result.first.focus(); return; }
      open();
    });
    // prototype shortcut so the dashboard can be opened directly for review
    if (location.hash === "#signed-in") open();

    dash.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-decide]");
      if (!btn) return;
      var card = btn.closest(".req");
      var verdict = btn.dataset.decide;
      var who = card.querySelector("h3").textContent;
      card.classList.add("is-done");
      card.querySelector(".btn-row").outerHTML = '<p class="req__result" tabindex="-1">' + (verdict === "Approved" || verdict === "Accepted" || verdict === "Marked returned" ? ICON.check : ICON.cross) + verdict + "</p>";
      card.querySelector(".req__result").focus();
      live.textContent = who + ": " + verdict.toLowerCase() + ".";
      var list = card.closest("[data-count]");
      var left = list.querySelectorAll(".req:not(.is-done)").length;
      var tally = document.querySelector('[data-tally="' + list.dataset.count + '"]');
      if (tally) tally.textContent = left;
    });

    var stock = document.getElementById("stock-body");
    stock.innerHTML = ITEMS.map(function (it) {
      var low = it.type === "tool" ? it.avail === 0 : it.avail <= 2;
      var label = it.avail === 0 ? "Out" : low ? "Low" : "OK";
      return "<tr><td>" + it.name + '</td><td data-label="Type">' + (it.type === "tool" ? "Tool" : "Consumable") +
        '</td><td class="num" data-label="On hand">' + (it.type === "tool" ? it.avail + " / " + it.total : it.avail) +
        '</td><td data-label="Status">' + (low ? '<span class="low">' + ICON.alert + label + "</span>" : label) + "</td></tr>";
    }).join("");
  }

  injectSprite();
  initHome();
  initTools();
  initReserve();
  initTrack();
  initJoin();
  initOfficer();
})();
