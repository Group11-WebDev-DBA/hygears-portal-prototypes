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


/* ---------- 8. News: the posts ----------
   On the real site each post is a row in the posts table, and news.html runs
   SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC.
   Here the five samples below are the starting rows. When an officer saves a post,
   the whole list is saved in this browser (localStorage), so News shows it too.
   Dates are sample dates; the text is sample text written from the events on the
   Hygears Facebook page (no invented results, numbers or quotes). */
const POSTS_KEY = "hyg-posts-pitboard";   // own key, so other prototypes opened from file:// don't mix in
const SAMPLE_POSTS = [
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
    cover: "../assets/luna-night.png", coverAlt: "The Luna electric vehicle parked at night by the PUP Lagoon sign, under string lights.", captionBy: "",
    body: "This is a sample post. No real details of the current Luna build are known yet, so this text only shows where a progress report goes and how it reads.\n\n" +
      "A real report would start with where the build stands: which parts of the car the team is working on, such as the chassis, the motor and controller, the battery or the body.\n\n" +
      "Next it would say what changed since the last report, what was tested and what the team learned. Photos from the workshop fit here, each with a caption.\n\n" +
      "It would end with what comes next and how members and supporters can help.\n\n" +
      "Officers can replace this sample from the Posts section of the officer desk." },
  { id: 3, category: "Recruitment", date: "2026-11-12", status: "published", sample: true,
    title: "ASCEND 2026: meet the five committees",
    summary: "Hygears is recruiting for ASCEND 2026. Here are the five committees you can pick from when you apply.",
    cover: "../assets/team-2.png", coverAlt: "Hygears members standing in a line for a team photo on the PUP campus.", captionBy: "",
    photos: [{ after: 3, src: "../assets/team-luna-1.png", alt: "Hygears members gathered around the Luna electric vehicle on a sunny day.", caption: "The team with a Luna car on campus." }],
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
    cover: "../assets/team-luna-1.png", coverAlt: "Hygears members gathered around the Luna electric vehicle on a sunny day.", captionBy: "",
    photos: [{ after: 1, src: "../assets/luna-night.png", alt: "The Luna electric vehicle parked at night at PUP.", caption: "A Luna car at PUP." }],
    body: "PHYNIX 2026 is the PUP Hygears Research Workshop. Its tagline says who it is for: “Nex-thinkers, N-explorers, Nex-creators”.\n\n" +
      "Research is part of why Hygears exists. In the organization's own words, it aims to further enhance the awareness of PUP students in the field of research.\n\n" +
      "This sample article will be replaced with the real program: the topics, the speakers, the schedule and photos from the day.\n\n" +
      "Watch this page and the Hygears Facebook page for updates." }
];

// All posts: the copy saved in this browser, or the samples the first time
function getPosts() {
  return loadSaved(POSTS_KEY, SAMPLE_POSTS.slice());
}
// Saves the whole list. Returns false when the browser refuses (blocked or full),
// so the form can say so instead of losing the post quietly.
function savePosts(posts) {
  try { localStorage.setItem(POSTS_KEY, JSON.stringify(posts)); return true; } catch (e) { return false; }
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
  for (let i = 0; i < posts.length; i++) if (posts[i].id === id) return posts[i];
  return null;
}
// Officer text goes into innerHTML, so turn & < > " into safe entities first
function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
// The summary, or the start of the body when the officer left it empty
function summaryOf(post) {
  if (post.summary) return post.summary;
  const text = post.body.replace(/\s+/g, " ").trim();
  return text.length > 160 ? text.slice(0, 157) + "..." : text;
}
// "2026-11-21" -> "Nov 21, 2026"
function niceDate(iso) {
  return new Date(iso + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
// The date as a small pit-board plate: big day number, month and year under it
function datePlate(iso) {
  const d = new Date(iso + "T00:00");
  return '<time class="plate post-date" datetime="' + iso + '"><span class="plate-num">' + d.getDate() + '</span>' +
    '<span class="plate-label">' + d.toLocaleDateString("en-US", { month: "short", year: "numeric" }) + "</span></time>";
}

// One post card for news.html, the home strip and "More posts".
// The cover's alt is empty because the title right under it names the post.
function postCard(post) {
  const link = "article.html?id=" + post.id;
  const cover = post.cover
    ? '<img class="post-cover" src="' + esc(post.cover) + '" alt="" loading="lazy">'
    : '<div class="post-cover post-cover--empty">Photo to come</div>';
  return '<li class="card post">' + cover + '<div class="post-body">' +
    '<div class="post-meta">' + datePlate(post.date) + '<span class="tag">' + esc(post.category) + "</span></div>" +
    '<h3><a href="' + link + '">' + esc(post.title) + "</a></h3>" +
    "<p>" + esc(summaryOf(post)) + "</p>" +
    '<a class="text-link" href="' + link + '">Read more<span class="sr-only">: ' + esc(post.title) + "</span></a>" +
    "</div></li>";
}

/* Home: "Latest from Hygears" (the 3 newest) */
const latestList = document.getElementById("latest-posts");
if (latestList) latestList.innerHTML = publishedPosts().slice(0, 3).map(postCard).join("");

/* News page: list with category chips */
const newsList = document.getElementById("news-list");
if (newsList) {
  const newsChips = document.getElementById("news-chips");
  let newsCat = "";

  function showNews() {
    const list = publishedPosts().filter(function (p) { return newsCat === "" || p.category === newsCat; });
    newsList.innerHTML = list.map(postCard).join("");
    document.getElementById("news-empty").hidden = list.length > 0;
    document.getElementById("news-count").textContent =
      (list.length === 1 ? "1 post" : list.length + " posts") + (newsCat ? " in " + newsCat : ", newest first");
  }
  newsChips.addEventListener("click", function (e) {
    const chip = e.target.closest("button");
    if (!chip) return;
    newsChips.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === chip)); });
    newsCat = chip.dataset.cat;
    showNews();
  });
  showNews();
}

/* Article page: article.html?id=N (no id = the newest post) */
const articleBox = document.getElementById("article");
if (articleBox) {
  const published = publishedPosts();
  const post = getParam("id") ? findPost(Number(getParam("id")), published) : published[0];

  if (!post) {
    // a wrong id, or a post that was unpublished
    articleBox.innerHTML = '<h1 id="article-title">This post is not available</h1>' +
      '<p class="lead">It may have been unpublished, or the link is wrong.</p><p><a class="text-link" href="news.html">See all news</a></p>';
  } else {
    document.title = post.title + " | PUP Hygears";
    let html = '<div class="post-meta">' + datePlate(post.date) + '<span class="tag">' + esc(post.category) + "</span>" +
      (post.sample ? '<span class="sticker">Sample article</span>' : "") + "</div>" +
      '<h1 id="article-title">' + esc(post.title) + "</h1>" +
      '<p class="lead">' + esc(summaryOf(post)) + "</p>";
    if (post.cover) html += '<figure class="frame"><img src="' + esc(post.cover) + '" alt="' + esc(post.coverAlt || "") + '"></figure>';

    // paragraphs split on blank lines; an inline photo goes after paragraph number "after"
    const photos = post.photos || [];
    html += '<div class="article-body">';
    post.body.split(/\n\s*\n/).forEach(function (text, i) {
      if (text.trim()) html += "<p>" + esc(text.trim()) + "</p>";
      photos.forEach(function (ph) {
        if (ph.after === i + 1) {
          html += '<figure class="frame"><img src="' + esc(ph.src) + '" alt="' + esc(ph.alt) + '" loading="lazy"><figcaption>' + esc(ph.caption) + "</figcaption></figure>";
        }
      });
    });
    html += '</div><p class="byline">Caption by ' + (post.captionBy ? "<strong>" + esc(post.captionBy) + "</strong>" : "the writer (name to be added)") + " for PUP Hygears.</p>";
    articleBox.innerHTML = html;
  }
  // "More posts": up to 3 other published posts
  document.getElementById("more-posts").innerHTML =
    published.filter(function (p) { return p !== post; }).slice(0, 3).map(postCard).join("");
}

/* Officer page: Posts list and the New post form */
const postForm = document.getElementById("post-form");
if (postForm) {
  const postRows = document.getElementById("post-rows");
  const postMsg = document.getElementById("post-msg");
  const saveErr = document.getElementById("p-save-err");
  const fileInput = document.getElementById("p-cover");
  const preview = document.getElementById("p-preview");
  const previewImg = document.getElementById("p-preview-img");
  const altField = document.getElementById("p-alt-field");
  const altInput = document.getElementById("p-alt");
  const formTitle = document.getElementById("post-form-h");
  const cancelBtn = document.getElementById("p-cancel");
  const MAX_PHOTO = 2 * 1024 * 1024;                        // 2 MB, the same limit PHP would check
  const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
  let coverData = "";     // the chosen photo as a data URL (or a sample's file path)
  let editingId = null;   // id of the post being edited, null for a new post
  let publishing = true;  // which submit button was pressed

  const ICON_CHECK = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_CLOCK = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';

  // The table: drafts included, newest first. On phones each row becomes a card.
  function renderRows() {
    const posts = sortNewest(getPosts());
    let html = "";
    posts.forEach(function (p) {
      const live = p.status === "published";
      html += '<tr><th scope="row" data-label="Title">' + esc(p.title) + "</th>" +
        '<td data-label="Category">' + esc(p.category) + "</td>" +
        '<td data-label="Date"><span class="mono">' + p.date + "</span></td>" +
        '<td data-label="Status">' + (live
          ? '<span class="status status--approved">' + ICON_CHECK + "Published</span>"
          : '<span class="status status--pending">' + ICON_CLOCK + "Draft</span>") + "</td>" +
        '<td class="action-cell"><div class="row-actions">' +
        '<button class="btn btn--sm" type="button" data-edit="' + p.id + '">Edit<span class="sr-only"> ' + esc(p.title) + "</span></button>" +
        '<button class="btn btn--sm" type="button" data-toggle="' + p.id + '">' + (live ? "Unpublish" : "Publish") + '<span class="sr-only"> ' + esc(p.title) + "</span></button>" +
        "</div></td></tr>";
    });
    postRows.innerHTML = html || '<tr><td colspan="5"><strong>No posts yet.</strong> Write the first one below.</td></tr>';
    document.getElementById("posts-count").textContent = posts.filter(function (p) { return p.status === "published"; }).length;
  }

  function showPreview(src) {
    coverData = src;
    previewImg.src = src;
    preview.hidden = !src;
    // the photo description is only asked for when there is a photo
    altField.hidden = !src;
    altInput.disabled = !src;
  }

  // Cover photo: check type and size, then show it with FileReader.
  // A wrong file sets data-extra-error, which checkField() reports like any other error.
  fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    let problem = "";
    if (file && PHOTO_TYPES.indexOf(file.type) === -1) {
      problem = "That file is not a JPG, PNG or WebP photo. Choose another file.";
    } else if (file && file.size > MAX_PHOTO) {
      problem = "That photo is " + (file.size / 1048576).toFixed(1) + " MB. Use one under 2 MB (resize it first).";
    }
    fileInput.dataset.extraError = problem;
    showError(fileInput);
    if (!file || problem) {
      fileInput.value = "";   // the error message stays until they pick another file
      showPreview("");
      return;
    }
    // FileReader turns the file into a data URL that the <img> can show right away
    const reader = new FileReader();
    reader.addEventListener("load", function () { showPreview(reader.result); });
    reader.readAsDataURL(file);
  });
  document.getElementById("p-remove").addEventListener("click", function () {
    fileInput.value = "";
    showPreview("");
    fileInput.focus();
  });

  // Back to an empty "New post" form
  function resetForm() {
    postForm.reset();
    showPreview("");
    editingId = null;
    fileInput.dataset.extraError = "";
    document.getElementById("p-date").value = todayString();
    formTitle.textContent = "New post";
    cancelBtn.hidden = true;
    saveErr.textContent = "";
    document.getElementById("p-errors").hidden = true;
    delete postForm.dataset.tried;
    postForm.querySelectorAll("input[id], select[id], textarea[id]").forEach(function (field) {
      field.removeAttribute("aria-invalid");
      const box = document.getElementById(field.id + "-err");
      if (box) box.textContent = "";
    });
  }

  // Remember which submit button was pressed (Publish or Save draft)
  postForm.querySelectorAll('button[type="submit"]').forEach(function (b) {
    b.addEventListener("click", function () { publishing = b.dataset.status === "published"; });
  });

  setupForm(postForm, document.getElementById("p-errors"), null, function () {
    saveErr.textContent = "";
    const posts = getPosts();
    let post = editingId === null ? null : findPost(editingId, posts);
    if (!post) {
      // a new post gets the next id (the database's AUTO_INCREMENT does this)
      let nextId = 1;
      posts.forEach(function (p) { nextId = Math.max(nextId, p.id + 1); });
      post = { id: nextId, sample: false };
      posts.push(post);
    }
    post.title = document.getElementById("p-title").value.trim();
    post.category = document.getElementById("p-cat").value;
    post.date = document.getElementById("p-date").value;
    post.cover = coverData;
    post.coverAlt = coverData ? altInput.value.trim() : "";
    post.summary = document.getElementById("p-summary").value.trim();
    post.body = document.getElementById("p-body").value.trim();
    post.captionBy = document.getElementById("p-by").value.trim();
    post.status = publishing ? "published" : "draft";

    if (!savePosts(posts)) {
      saveErr.textContent = "This browser would not save the post. The photo may be too big for browser storage: try a smaller one, or remove it.";
      return;
    }
    postMsg.innerHTML = publishing
      ? ICON_CHECK + " Published “" + esc(post.title) + '”. It is at the top of the list and shows on <a class="text-link" href="news.html">News</a> in this browser.'
      : ICON_CLOCK + " Saved “" + esc(post.title) + "” as a draft. It stays off News until you publish it.";
    resetForm();
    renderRows();
    postMsg.focus();
    announce(publishing ? "Post published." : "Draft saved.");
  });

  cancelBtn.addEventListener("click", function () {
    resetForm();
    formTitle.focus();
  });

  // Edit and Publish/Unpublish buttons in the table (one listener for every row)
  postRows.addEventListener("click", function (e) {
    const b = e.target.closest("button");
    if (!b) return;
    const posts = getPosts();
    if (b.dataset.edit) {
      const post = findPost(Number(b.dataset.edit), posts);
      resetForm();
      editingId = post.id;
      document.getElementById("p-title").value = post.title;
      document.getElementById("p-cat").value = post.category;
      document.getElementById("p-date").value = post.date;
      document.getElementById("p-summary").value = post.summary || "";
      document.getElementById("p-body").value = post.body;
      document.getElementById("p-by").value = post.captionBy || "";
      showPreview(post.cover || "");
      altInput.value = post.coverAlt || "";
      formTitle.textContent = "Edit post";
      cancelBtn.hidden = false;
      formTitle.scrollIntoView();
      formTitle.focus();
    }
    if (b.dataset.toggle) {
      const target = findPost(Number(b.dataset.toggle), posts);
      target.status = target.status === "published" ? "draft" : "published";
      if (!savePosts(posts)) {
        postMsg.textContent = "This browser would not save the change.";
      } else {
        postMsg.innerHTML = target.status === "published"
          ? "Published “" + esc(target.title) + '”. It shows on <a class="text-link" href="news.html">News</a> again.'
          : "Unpublished “" + esc(target.title) + "”. It no longer shows on News.";
      }
      renderRows();
      postMsg.focus();
      announce(target.status === "published" ? "Post published." : "Post unpublished.");
    }
  });

  document.getElementById("p-date").value = todayString();
  renderRows();
}

/* Join page: applications open or closed.
   Recruitment is seasonal. The real site reads this from an officer setting;
   here join.html?season=closed previews the closed state. */
const appsOpenTag = document.getElementById("apps-open");
if (appsOpenTag) {
  const isOpen = getParam("season") !== "closed";
  appsOpenTag.hidden = !isOpen;
  document.getElementById("apps-closed-line").hidden = isOpen;
  document.getElementById("apps-closed").hidden = isOpen;
  document.getElementById("join-form").hidden = !isOpen;
}
