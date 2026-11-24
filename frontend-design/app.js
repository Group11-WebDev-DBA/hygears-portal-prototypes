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

  // ---------- News: the posts ----------
  // On the real site each post is a row in the posts table and news.html runs
  // SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC.
  // Here these five samples are the starting rows. When an officer saves a post,
  // the whole list is saved in this browser (localStorage), so News shows it too.
  // Dates are sample dates; the text is sample text written from the events on
  // the Hygears Facebook page (no invented results, numbers or quotes).
  var POSTS_KEY = "hyg-posts-shadowboard";   // own key, so other prototypes opened from file:// don't mix in
  var SAMPLE_POSTS = [
    { id: 1, category: "Competition", date: "2026-11-21", status: "published", sample: true,
      title: "A PUP student is a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge",
      summary: "A PUP student reached the finals of the first national SOLIDWORKS Mechanical Design Challenge. Hygears is cheering them on.",
      cover: "", coverAlt: "", captionBy: "",
      body: "PUP Hygears congratulates a PUP student who was named a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge 2026.\n\n" +
        "SOLIDWORKS is the 3D design software engineering students use to model parts and assemblies before anything is cut or printed. A design challenge built around it tests how well students can turn an idea into a working mechanical design.\n\n" +
        "Reaching the finals of the first edition of a national challenge is a big step for a student from our university, and it shows the kind of design work PUP engineering students can do.\n\n" +
        "At Hygears the same skill goes into the Luna cars: every part starts as a model on screen before the team builds it.\n\n" +
        "The results of the final round will be posted here once they are announced." },
    { id: 2, category: "Progress report", date: "2026-11-17", status: "published", sample: true,
      title: "Luna team progress report (sample)",
      summary: "A sample that shows how the Luna team's progress reports will look. The real report comes from the team.",
      cover: "../assets/luna-night.png", coverAlt: "The Luna car parked at night by the PUP Lagoon sign, under string lights.", captionBy: "",
      body: "This is a sample post. No real details of the current Luna build are known yet, so this text only shows where a progress report goes and how it reads.\n\n" +
        "A real report would start with where the build stands: which parts of the car the team is working on, such as the chassis, the motor and controller, the battery or the body.\n\n" +
        "Next it would say what changed since the last report, what was tested and what the team learned. Photos from the workshop fit here, each with a caption.\n\n" +
        "It would end with what comes next and how members and supporters can help.\n\n" +
        "Officers can replace this sample from the Posts section of the officer desk." },
    { id: 3, category: "Recruitment", date: "2026-11-12", status: "published", sample: true,
      title: "ASCEND 2026: meet the five committees",
      summary: "Hygears is recruiting for ASCEND 2026. Here are the five committees you can pick from when you apply.",
      cover: "../assets/team-2.png", coverAlt: "A lineup of Hygears members in team shirts on the PUP campus.", captionBy: "",
      photos: [{ after: 3, src: "../assets/team-luna-1.png", alt: "Hygears members gathered around the Luna car on a tree-lined road at PUP.", caption: "The team with a Luna car on campus." }],
      body: "ASCEND 2026 is the Hygears recruitment season, and applications are open to PUP students. When you apply, you pick the committee you would most like to work in.\n\n" +
        "Finance and Operations keeps the organization running: budgets, purchases and the paperwork behind every project.\n\n" +
        "Internal Affairs looks after the members, from welcoming new ones to the activities that keep everyone together.\n\n" +
        "Innovation and Research works on the technical side: the research and engineering behind the Luna cars and the team's projects.\n\n" +
        "External Affairs works with partners and other organizations outside Hygears.\n\n" +
        "Creative Media and Design makes the posts, photos and designs that tell people what Hygears is doing.\n\n" +
        "Members come from Mechanical, Electronics and Communications, Industrial, Electrical and Computer Engineering, and Marketing. Apply from the Join page." },
    { id: 4, category: "Announcement", date: "2026-11-05", status: "published", sample: true,
      title: "General Assembly: “The Force Awakens: Refining Our Legacy”",
      summary: "The Hygears General Assembly brought the Merakis together under the theme “The Force Awakens: Refining Our Legacy”.",
      cover: "", coverAlt: "", captionBy: "",
      body: "Hygears held its General Assembly under the theme “The Force Awakens: Refining Our Legacy”.\n\n" +
        "The General Assembly is where the members, whom Hygears calls Merakis, meet as one organization: to hear where Hygears is headed, meet the officers and committees, and start the year's work.\n\n" +
        "Photos from the assembly's photobooth are on the Hygears Facebook page. The Creative Media and Design committee will add highlights here." },
    { id: 5, category: "Workshop", date: "2026-10-25", status: "published", sample: true,
      title: "PHYNIX 2026: PUP Hygears Research Workshop",
      summary: "PHYNIX 2026 is the Hygears research workshop for “Nex-thinkers, N-explorers, Nex-creators”.",
      cover: "../assets/team-luna-1.png", coverAlt: "Hygears members gathered around the Luna car on a tree-lined road at PUP.", captionBy: "",
      photos: [{ after: 1, src: "../assets/luna-night.png", alt: "The Luna car parked at night by the PUP Lagoon sign.", caption: "A Luna car at PUP." }],
      body: "PHYNIX 2026 is the PUP Hygears Research Workshop. Its tagline says who it is for: “Nex-thinkers, N-explorers, Nex-creators”.\n\n" +
        "Research is part of why Hygears exists. In the organization's own words, it aims to further enhance the awareness of PUP students in the field of research.\n\n" +
        "This sample article will be replaced with the real program: the topics, the speakers, the schedule and photos from the day.\n\n" +
        "Watch this page and the Hygears Facebook page for updates." }
  ];

  // All posts: the copy saved in this browser, or the samples the first time.
  // try/catch because some browsers block storage on file:// pages.
  function getPosts() {
    try {
      var saved = localStorage.getItem(POSTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (err) { /* fall back to the samples */ }
    return SAMPLE_POSTS.slice();
  }

  // Saves the whole list. Returns false when the browser refuses (blocked or full).
  function savePosts(posts) {
    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
      return true;
    } catch (err) {
      return false;
    }
  }

  // Newest first: by date, then by id for posts on the same day
  function sortNewest(posts) {
    return posts.sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.id - a.id;
    });
  }

  function publishedPosts() {
    return sortNewest(getPosts().filter(function (p) { return p.status === "published"; }));
  }

  function findPost(id, posts) {
    for (var i = 0; i < posts.length; i++) if (posts[i].id === id) return posts[i];
    return null;
  }

  // Officer text goes into innerHTML, so turn & < > " into safe entities first
  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // The summary, or the start of the body when the officer left it empty
  function summaryOf(post) {
    if (post.summary) return post.summary;
    var text = post.body.replace(/\s+/g, " ").trim();
    return text.length > 160 ? text.slice(0, 157) + "..." : text;
  }

  // One post card for news.html, the home strip and "More posts".
  // The cover's alt is empty because the title right under it names the post.
  function postCard(post) {
    var link = "article.html?id=" + post.id;
    var cover = post.cover
      ? '<img class="post__cover" src="' + esc(post.cover) + '" alt="" loading="lazy">'
      : '<div class="post__slot">Photo to come</div>';
    return '<li class="post">' + cover + '<div class="post__plate">' +
      '<p class="post__meta"><span class="post__cat">' + esc(post.category) + '</span><time datetime="' + post.date + '">' + niceDate(post.date) + "</time></p>" +
      '<h3><a href="' + link + '">' + esc(post.title) + "</a></h3>" +
      "<p>" + esc(summaryOf(post)) + "</p>" +
      '<a class="post__more" href="' + link + '">Read more<span class="visually-hidden">: ' + esc(post.title) + "</span></a>" +
      "</div></li>";
  }

  // ---------- Home: "Latest from Hygears" (the 3 newest) ----------
  function initLatest() {
    var el = document.getElementById("latest-posts");
    if (!el) return;
    el.innerHTML = publishedPosts().slice(0, 3).map(postCard).join("");
  }

  // ---------- News page: list with category chips ----------
  function initNews() {
    var el = document.getElementById("news-list");
    if (!el) return;
    var chips = document.getElementById("news-chips");
    var note = document.getElementById("news-note");
    var cat = "All";

    function show() {
      var list = publishedPosts().filter(function (p) { return cat === "All" || p.category === cat; });
      el.innerHTML = list.map(postCard).join("");
      document.getElementById("news-empty").hidden = list.length > 0;
      note.textContent = (list.length === 1 ? "1 post" : list.length + " posts") + (cat === "All" ? ", newest first" : " in " + cat);
    }
    chips.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      chips.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      cat = btn.dataset.value;
      show();
    });
    show();
  }

  // ---------- Article page: article.html?id=N (no id = the newest post) ----------
  function initArticle() {
    var box = document.getElementById("article");
    if (!box) return;
    var published = publishedPosts();
    var id = new URLSearchParams(location.search).get("id");
    var post = id ? findPost(Number(id), published) : published[0];

    if (!post) {
      // a wrong id, or a post that was unpublished
      box.innerHTML = '<h1 id="article-title">This post is not available</h1>' +
        '<p class="lede">It may have been unpublished, or the link is wrong.</p><p><a href="news.html">See all news</a></p>';
    } else {
      document.title = post.title + " | PUP Hygears";
      var html = '<p class="post__meta"><span class="post__cat">' + esc(post.category) + "</span>" +
        '<time datetime="' + post.date + '">' + niceDate(post.date) + "</time>" +
        (post.sample ? '<span class="sample">Sample article</span>' : "") + "</p>" +
        '<h1 id="article-title">' + esc(post.title) + "</h1>" +
        '<p class="lede">' + esc(summaryOf(post)) + "</p>";
      if (post.cover) html += '<figure><img src="' + esc(post.cover) + '" alt="' + esc(post.coverAlt || "") + '"></figure>';

      // paragraphs split on blank lines; an inline photo goes after paragraph number "after"
      var paras = post.body.split(/\n\s*\n/);
      var photos = post.photos || [];
      html += '<div class="article__body">';
      paras.forEach(function (text, i) {
        if (text.trim()) html += "<p>" + esc(text.trim()) + "</p>";
        photos.forEach(function (ph) {
          if (ph.after === i + 1) {
            html += '<figure><img src="' + esc(ph.src) + '" alt="' + esc(ph.alt) + '" loading="lazy"><figcaption>' + esc(ph.caption) + "</figcaption></figure>";
          }
        });
      });
      html += "</div>";
      html += '<p class="article__by">Caption by ' + (post.captionBy ? "<strong>" + esc(post.captionBy) + "</strong>" : "the writer (name to be added)") + " for PUP Hygears.</p>";
      box.innerHTML = html;
    }

    // "More posts": up to 3 other published posts
    document.getElementById("more-posts").innerHTML = published.filter(function (p) { return p !== post; }).slice(0, 3).map(postCard).join("");
  }

  // ---------- Officer: Posts list and the New post form ----------
  function initPosts() {
    var form = document.getElementById("post-form");
    if (!form) return;
    var list = document.getElementById("post-list");
    var status = document.getElementById("post-status");
    var saveError = document.getElementById("post-save-error");
    var fileInput = form.elements.cover;
    var preview = document.getElementById("cover-preview");
    var previewImg = document.getElementById("cover-preview-img");
    var altField = document.getElementById("cover-alt-field");
    var formTitle = document.getElementById("post-form-title");
    var cancelBtn = document.getElementById("post-cancel");
    var MAX_PHOTO = 2 * 1024 * 1024;                        // 2 MB, the same limit PHP would check
    var PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
    var coverData = "";      // the chosen photo as a data URL (or a sample's file path)
    var coverError = "";     // message when the chosen file is wrong
    var editingId = null;    // id of the post being edited, null for a new post
    var publishing = true;   // which submit button was pressed

    function renderList() {
      var posts = sortNewest(getPosts());
      list.innerHTML = posts.map(function (p) {
        var live = p.status === "published";
        return '<li class="req' + (live ? "" : " is-done") + '"><h3>' + esc(p.title) + "</h3>" +
          "<p>" + esc(p.category) + ", " + niceDate(p.date) + (p.sample ? " (sample)" : "") + "</p>" +
          '<p class="req__result">' + (live ? ICON.check + "Published, on News" : ICON.clock + "Draft, not on News") + "</p>" +
          '<div class="btn-row"><button type="button" class="btn btn--outline" data-edit="' + p.id + '" aria-label="Edit ' + esc(p.title) + '">Edit</button>' +
          '<button type="button" class="btn btn--outline" data-toggle="' + p.id + '" aria-label="' + (live ? "Unpublish " : "Publish ") + esc(p.title) + '">' + (live ? "Unpublish" : "Publish") + "</button></div></li>";
      }).join("") || '<li class="empty"><strong>No posts yet.</strong> Write the first one below.</li>';
      var tally = document.querySelector('[data-tally="posts"]');
      if (tally) tally.textContent = posts.filter(function (p) { return p.status === "published"; }).length;
    }

    function showPreview(src) {
      coverData = src;
      previewImg.src = src;
      preview.hidden = !src;
      altField.hidden = !src;   // the photo description is only asked for when there is a photo
    }

    // Cover photo: check type and size, then show it with FileReader
    fileInput.addEventListener("change", function () {
      var file = fileInput.files[0];
      coverError = "";
      if (!file) { showPreview(""); return; }
      if (PHOTO_TYPES.indexOf(file.type) === -1) {
        coverError = "That file is not a JPG, PNG or WebP photo. Choose another file.";
      } else if (file.size > MAX_PHOTO) {
        coverError = "That photo is " + (file.size / 1048576).toFixed(1) + " MB. Use one under 2 MB (resize it first).";
      }
      validate(form, { cover: function () { return coverError; } });
      if (coverError) { fileInput.value = ""; showPreview(""); return; }
      // FileReader turns the file into a data URL that the <img> can show right away
      var reader = new FileReader();
      reader.addEventListener("load", function () { showPreview(reader.result); });
      reader.readAsDataURL(file);
    });

    document.getElementById("cover-remove").addEventListener("click", function () {
      fileInput.value = "";
      showPreview("");
      fileInput.focus();
    });

    // Back to an empty "New post" form
    function resetForm() {
      form.reset();
      showPreview("");
      coverError = "";
      editingId = null;
      form.elements.postDate.value = todayIso();
      formTitle.textContent = "New post";
      cancelBtn.hidden = true;
      saveError.classList.remove("is-shown");
      form.querySelector(".form-summary").classList.remove("is-shown");
      form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("has-error"); });
      form.querySelectorAll("[aria-invalid]").forEach(function (f) { f.setAttribute("aria-invalid", "false"); });
    }

    // Remember which submit button was pressed (Publish or Save draft)
    form.querySelectorAll('button[type="submit"]').forEach(function (b) {
      b.addEventListener("click", function () { publishing = b.dataset.status === "published"; });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      saveError.classList.remove("is-shown");
      var result = validate(form, {
        postTitle: function (v) { return v ? "" : "Give the post a title."; },
        category: function (v) { return v ? "" : "Pick a category so the post shows under the right filter."; },
        postDate: function (v) { return v ? "" : "Pick the date the post is for."; },
        cover: function () { return coverError; },
        coverAlt: function (v) { return v ? "" : "Describe the photo in a few words, for screen reader users."; },
        body: function (v) { return v ? "" : "Write the article. Leave a blank line between paragraphs."; }
      });
      showSummary(form, result);
      if (result.bad) return;

      var f = form.elements;
      var posts = getPosts();
      var post = editingId === null ? null : findPost(editingId, posts);
      if (!post) {
        // a new post gets the next id (the database's AUTO_INCREMENT does this)
        var nextId = 1;
        posts.forEach(function (p) { nextId = Math.max(nextId, p.id + 1); });
        post = { id: nextId, sample: false };
        posts.push(post);
      }
      post.title = f.postTitle.value.trim();
      post.category = f.category.value;
      post.date = f.postDate.value;
      post.cover = coverData;
      post.coverAlt = coverData ? f.coverAlt.value.trim() : "";
      post.summary = f.summary.value.trim();
      post.body = f.body.value.trim();
      post.captionBy = f.captionBy.value.trim();
      post.status = publishing ? "published" : "draft";

      if (!savePosts(posts)) {
        saveError.textContent = "This browser would not save the post. The photo may be too big for browser storage: try a smaller one, or remove it.";
        saveError.classList.add("is-shown");
        saveError.focus();
        return;
      }
      status.innerHTML = publishing
        ? ICON.check + "Published “" + esc(post.title) + '”. It is at the top of the list and shows on <a href="news.html">News</a> in this browser.'
        : ICON.clock + "Saved “" + esc(post.title) + "” as a draft. It stays off News until you publish it.";
      resetForm();
      renderList();
      status.focus();
    });

    cancelBtn.addEventListener("click", function () {
      resetForm();
      formTitle.focus();
    });

    // Edit and Publish/Unpublish buttons on the list (one listener for every card)
    list.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var posts = getPosts();
      if (btn.dataset.edit) {
        var post = findPost(Number(btn.dataset.edit), posts);
        resetForm();
        editingId = post.id;
        var f = form.elements;
        f.postTitle.value = post.title;
        f.category.value = post.category;
        f.postDate.value = post.date;
        f.summary.value = post.summary || "";
        f.body.value = post.body;
        f.captionBy.value = post.captionBy || "";
        showPreview(post.cover || "");
        f.coverAlt.value = post.coverAlt || "";
        formTitle.textContent = "Edit post";
        cancelBtn.hidden = false;
        formTitle.scrollIntoView();
        formTitle.focus();
      }
      if (btn.dataset.toggle) {
        var target = findPost(Number(btn.dataset.toggle), posts);
        target.status = target.status === "published" ? "draft" : "published";
        if (!savePosts(posts)) {
          status.textContent = "This browser would not save the change.";
        } else {
          status.innerHTML = target.status === "published"
            ? ICON.check + "Published “" + esc(target.title) + '”. It shows on <a href="news.html">News</a> again.'
            : ICON.cross + "Unpublished “" + esc(target.title) + "”. It no longer shows on News.";
        }
        renderList();
        status.focus();
      }
    });

    form.elements.postDate.value = todayIso();
    renderList();
  }

  // ---------- Join: applications open or closed ----------
  // Recruitment is seasonal. The real site reads this from an officer setting;
  // here join.html?season=closed previews the closed state.
  function initSeason() {
    var openLine = document.getElementById("apps-open");
    if (!openLine) return;
    var open = new URLSearchParams(location.search).get("season") !== "closed";
    openLine.hidden = !open;
    document.getElementById("apps-closed-line").hidden = open;
    document.getElementById("apps-closed").hidden = open;
    document.getElementById("join-form").hidden = !open;
  }

  injectSprite();
  initHome();
  initTools();
  initReserve();
  initTrack();
  initJoin();
  initOfficer();
  initLatest();
  initNews();
  initArticle();
  initPosts();
  initSeason();
})();
