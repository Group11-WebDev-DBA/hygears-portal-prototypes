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

/* ---------- 8. News posts (news, article, Home strip, officer Posts) ----------
   The prototype keeps posts in the browser's localStorage, so a post an
   officer publishes on officer.html shows on news.html in the same browser.
   In the real site they come from the MySQL posts table:
   SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC */

// Every prototype opened from file:// shares one localStorage,
// so this direction uses its own key.
var POSTS_KEY = "hygears-charge-posts";

// Sample posts, written only from facts on the org's Facebook page.
// The field names match the planned posts table columns.
// "photos" are the inline photos inside an article (samples only).
var SAMPLE_POSTS = [
  {
    post_id: 5, title: "Luna team progress report", category: "Progress report",
    published_at: "2026-11-20", status: "published", sample: true,
    summary: "A sample of how the Luna team's progress reports will look on the portal. The real update comes from the officers.",
    cover_image: "../assets/luna-night.png", cover_alt: "A Hygears Luna electric car parked at night by the PUP Lagoon sign",
    caption_by: "Creative Media and Design (sample)",
    body: "This is a sample post. It shows how a progress report from the Luna team will look on the portal, so the officers can see the layout before they write the real one. No real details from the team are shown here.\n\n" +
      "Luna is the series of energy-efficient electric vehicles that PUP Hygears builds for the Shell Eco-marathon. The Eco-marathon is an energy-efficiency competition, not a race: the goal is to go as far as possible on as little energy as possible.\n\n" +
      "A real progress report would say what each part of the team worked on during the period, what was built or tested, and what comes next. Members come from Mechanical, Electronics and Communications, Industrial, Electrical and Computer Engineering, and Marketing, so a report can cover the car, its electronics and the work around it.\n\n" +
      "Photos from the workshop and the test days would go between the paragraphs, each with a short caption, the way the two photos in this post do.\n\n" +
      "When the officers send the real update, this sample will be replaced. Until then, follow PUP Hygears on Facebook for the latest from the team.",
    photos: [
      { src: "../assets/team-luna-1.png", alt: "Hygears members gathered around the Luna car during the day", caption: "The team with the Luna car." },
      { src: "../assets/team-2.png", alt: "Hygears members standing in a line for a team photo", caption: "Hygears members. Stand-in photo until the officers send ones from this period." }
    ]
  },
  {
    post_id: 4, title: "A PUP student is a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge 2026",
    category: "Competition", published_at: "2026-11-12", status: "published", sample: true,
    summary: "A PUP student made it to the finals of the first national SOLIDWORKS Mechanical Design Challenge.",
    cover_image: "", cover_alt: "", caption_by: "Creative Media and Design (sample)",
    body: "A PUP student is a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge 2026.\n\n" +
      "SOLIDWORKS is 3D design software that engineering students use to model parts and machines before they are built. A national design challenge puts that skill up against students from other schools.\n\n" +
      "The results of the final round will be posted here once the officers share them."
  },
  {
    post_id: 3, title: "ASCEND 2026: meet the five committees", category: "Recruitment",
    published_at: "2026-10-28", status: "published", sample: true,
    summary: "Find your missing piece. Recruitment is open for all five committees.",
    cover_image: "../assets/team-2.png", cover_alt: "Hygears members standing in a line for a team photo",
    caption_by: "Creative Media and Design (sample)",
    body: "ASCEND 2026 is the PUP Hygears recruitment for new members. Every member joins one of five committees.\n\n" +
      "The five committees are Finance and Operations, Internal Affairs, Innovation and Research, External Affairs, and Creative Media and Design.\n\n" +
      "You don't need to be an engineering student to help. Members come from Mechanical, Electronics and Communications, Industrial, Electrical and Computer Engineering, and Marketing.\n\n" +
      "As the organization puts it: \"We don't just build vehicles, we build people to help us build the future!\" Apply on the Join page and pick the committee you want to grow in."
  },
  {
    post_id: 2, title: "General Assembly: The Force Awakens", category: "Announcement",
    published_at: "2026-10-10", status: "published", sample: true,
    summary: "\"Refining Our Legacy\": the General Assembly brought the Merakis together.",
    cover_image: "../assets/team-luna-1.png", cover_alt: "Hygears members gathered around the Luna car during the day",
    caption_by: "Creative Media and Design (sample)",
    body: "PUP Hygears held its General Assembly with the theme \"The Force Awakens: Refining Our Legacy.\" In Hygears, members are called Merakis.\n\n" +
      "A general assembly brings the whole organization together, from the officers to the newest members of all five committees.\n\n" +
      "The program and photos from the day will be added once the officers send them."
  },
  {
    post_id: 1, title: "PHYNIX 2026 Research Workshop", category: "Workshop",
    published_at: "2026-09-26", status: "published", sample: true,
    summary: "The org's research workshop for PUP students: \"Nex-thinkers, N-explorers, Nex-creators.\"",
    cover_image: "", cover_alt: "", caption_by: "Creative Media and Design (sample)",
    body: "PHYNIX 2026 is the research workshop that PUP Hygears runs for PUP students. Its tagline: \"Nex-thinkers, N-explorers, Nex-creators.\"\n\n" +
      "The workshop follows the organization's aim: to raise PUP students' awareness of research and to train competent students through real work on innovation and on building a highly efficient vehicle.\n\n" +
      "The date, venue and topics will be added here once the officers send them."
  }
];

// Reads every post (published and drafts). First visit: the samples.
function loadPosts() {
  try {
    var saved = localStorage.getItem(POSTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
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

// Newest first (like ORDER BY published_at DESC); same date: newer id first
function sortNewestFirst(list) {
  list.sort(function (a, b) {
    if (a.published_at === b.published_at) {
      return b.post_id - a.post_id;
    }
    return a.published_at < b.published_at ? 1 : -1;
  });
  return list;
}

// Only the published posts, newest first
function getPublishedPosts() {
  var all = loadPosts();
  var list = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].status === "published") {
      list.push(all[i]);
    }
  }
  return sortNewestFirst(list);
}

// Makes officer-typed text safe inside HTML (like PHP's htmlspecialchars)
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// "2026-11-20" -> "Nov 20, 2026" (built by hand so the time zone can't shift the day)
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatDate(text) {
  var parts = text.split("-");
  return MONTHS[Number(parts[1]) - 1] + " " + Number(parts[2]) + ", " + parts[0];
}

// Cover photo, or the gray photo slot when the post has none yet
function coverHtml(post) {
  if (post.cover_image) {
    return '<img class="post-cover" src="' + escapeHtml(post.cover_image) + '" alt="' +
      escapeHtml(post.cover_alt || "") + '" width="1440" height="720" loading="lazy">';
  }
  return '<div class="photo-slot">Cover photo from officers</div>';
}

// One post card: used on News, the Home strip and "More posts".
// The title is the card's link; "Read more" repeats it for touch, so it is
// hidden from the keyboard and screen readers (no double reading).
function postCardHtml(post) {
  var link = "article.html?id=" + post.post_id;
  return '<li class="post-card">' + coverHtml(post) +
    '<p class="kicker">' + escapeHtml(post.category) + " &middot; " +
    '<time datetime="' + post.published_at + '">' + formatDate(post.published_at) + "</time></p>" +
    '<h3><a href="' + link + '">' + escapeHtml(post.title) + "</a></h3>" +
    "<p>" + escapeHtml(post.summary) + "</p>" +
    (post.sample ? '<p><span class="slot">Sample post</span></p>' : "") +
    '<a class="read-more" href="' + link + '" tabindex="-1" aria-hidden="true">Read more</a>' +
    "</li>";
}

// Draws cards into a list
function renderPostCards(listEl, posts) {
  var html = "";
  for (var i = 0; i < posts.length; i++) {
    html += postCardHtml(posts[i]);
  }
  listEl.innerHTML = html;
}

/* Home: "Latest from Hygears", the 3 newest posts */
var latestList = document.getElementById("latest-posts");
if (latestList) {
  renderPostCards(latestList, getPublishedPosts().slice(0, 3));
}

/* News page: cards with a category switch (news.html?cat=Workshop opens filtered) */
var newsFilter = document.getElementById("news-filter");
if (newsFilter) {
  var newsList = document.getElementById("news-list");
  var newsCount = document.getElementById("news-count");
  var newsEmpty = document.getElementById("news-empty");

  // Start from the link, if it names a category
  var startCat = new URLSearchParams(window.location.search).get("cat");
  var catRadios = newsFilter.querySelectorAll('input[name="cat"]');
  for (var r = 0; r < catRadios.length; r++) {
    if (catRadios[r].value === startCat) {
      catRadios[r].checked = true;
    }
  }

  function showNews() {
    var cat = newsFilter.querySelector('input[name="cat"]:checked').value;
    var all = getPublishedPosts();
    var shown = [];
    for (var i = 0; i < all.length; i++) {
      if (cat === "all" || all[i].category === cat) {
        shown.push(all[i]);
      }
    }
    renderPostCards(newsList, shown);
    // Outline the chosen option too, not only the radio dot
    for (var j = 0; j < catRadios.length; j++) {
      catRadios[j].parentNode.classList.toggle("is-on", catRadios[j].checked);
    }
    newsCount.textContent = "Showing " + shown.length + " of " + all.length + " posts";
    newsEmpty.hidden = shown.length !== 0;
  }

  newsFilter.addEventListener("change", showNews);
  showNews();
}

/* Article page: one post, chosen by article.html?id=N (no id: the newest) */
var articleBox = document.getElementById("article");
if (articleBox) {
  var livePosts = getPublishedPosts();
  var wantedId = new URLSearchParams(window.location.search).get("id");
  var post = null;
  for (var a = 0; a < livePosts.length; a++) {
    if (String(livePosts[a].post_id) === wantedId) {
      post = livePosts[a];
    }
  }
  if (!wantedId && livePosts.length) {
    post = livePosts[0];
  }

  if (!post) {
    articleBox.innerHTML = "<h1>Post not found</h1><p>This post was unpublished or never existed. " +
      '<a href="news.html">See all news</a>.</p>';
    document.getElementById("more-posts-section").hidden = true;
  } else {
    document.title = post.title + " | PUP Hygears";

    // Blank lines in the body become paragraphs; inline photos go after the 2nd and 4th
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
      '<p class="kicker">' + escapeHtml(post.category) + " &middot; " +
      '<time datetime="' + post.published_at + '">' + formatDate(post.published_at) + "</time></p>" +
      "<h1>" + escapeHtml(post.title) + "</h1>" +
      (post.sample ? '<p class="hint"><span class="slot">Sample article</span> Written from the org\'s public posts. The officers will send the real details.</p>' : "") +
      '<figure class="article-cover">' + coverHtml(post) + "</figure>" +
      '<div class="article-body">' + bodyHtml + "</div>" +
      '<p class="article-byline">Caption by ' + escapeHtml(post.caption_by || "PUP Hygears") + "</p>";

    // "More posts": the newest other posts
    var more = [];
    for (var m = 0; m < livePosts.length && more.length < 3; m++) {
      if (livePosts[m] !== post) {
        more.push(livePosts[m]);
      }
    }
    renderPostCards(document.getElementById("more-posts"), more);
  }
}

/* ---------- 9. Join: applications open or closed ----------
   Recruitment is seasonal. The officers flip this (a setting in the real
   site). join.html?applications=closed previews the closed state.       */
var APPLICATIONS_OPEN = true;
var applyOpen = document.getElementById("apply-open");
if (applyOpen) {
  var isOpen = APPLICATIONS_OPEN && new URLSearchParams(window.location.search).get("applications") !== "closed";
  applyOpen.hidden = !isOpen;
  document.getElementById("apply-closed").hidden = isOpen;
  document.getElementById("join-form").hidden = !isOpen;
}

/* ---------- 10. Officer: Posts list and the New post form ---------- */
var postForm = document.getElementById("post-form");

if (postForm) {
  var postRows = document.getElementById("post-rows");
  var postDone = document.getElementById("post-done");
  var coverInput = document.getElementById("p-cover");
  var coverPreview = document.getElementById("p-preview");
  var coverBox = document.getElementById("p-preview-box");
  var titleInput = document.getElementById("p-title");
  var categoryInput = document.getElementById("p-category");
  var dateInput = document.getElementById("p-date");
  var altInput = document.getElementById("p-alt");
  var bodyInput = document.getElementById("p-body");
  var editingId = null;  // post_id being edited, or null for a new post
  var coverData = "";    // the chosen photo as a data URL (the real site uploads the file instead)

  var MAX_PHOTO_MB = 2;
  var PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

  dateInput.value = todayString();

  // Finds a post by id inside an array
  function findPost(all, id) {
    for (var i = 0; i < all.length; i++) {
      if (all[i].post_id === id) {
        return all[i];
      }
    }
    return null;
  }

  // Draws the officer's table of posts (newest first, drafts included)
  function renderOfficerPosts() {
    var all = sortNewestFirst(loadPosts());
    var html = "";
    for (var i = 0; i < all.length; i++) {
      var p = all[i];
      var isLive = p.status === "published";
      var name = '<span class="sr-only"> ' + escapeHtml(p.title) + "</span>";
      html += "<tr>" +
        '<td data-label="Title"><span>' + escapeHtml(p.title) + (p.sample ? ' <span class="muted">(sample)</span>' : "") + "</span></td>" +
        '<td data-label="Category">' + escapeHtml(p.category) + "</td>" +
        '<td data-label="Date" class="nowrap">' + formatDate(p.published_at) + "</td>" +
        '<td data-label="Status">' + (isLive
          ? '<span class="status status-approved">✓ Published</span>'
          : '<span class="status">○ Draft</span>') + "</td>" +
        '<td class="actions" data-label="Action">' +
          '<button class="btn-ghost btn-sm" type="button" data-post-edit="' + p.post_id + '">Edit' + name + "</button>" +
          '<button class="btn-ghost btn-sm" type="button" data-post-toggle="' + p.post_id + '">' + (isLive ? "Unpublish" : "Publish") + name + "</button>" +
        "</td></tr>";
    }
    postRows.innerHTML = html;
    document.getElementById("posts-count").textContent = getPublishedPosts().length;
  }

  // Shows the chosen photo, or hides the preview when there is none.
  // The photo description field only shows (and counts) with a photo.
  function showPreview(src) {
    coverData = src || "";
    if (src) {
      coverPreview.src = src;
    } else {
      coverPreview.removeAttribute("src");
    }
    coverBox.hidden = !src;
    document.getElementById("p-alt-field").hidden = !src;
  }

  // Back to an empty "New post" form
  function resetPostForm() {
    postForm.reset();
    editingId = null;
    showPreview("");
    dateInput.value = todayString();
    document.getElementById("post-form-title").textContent = "New post";
    document.getElementById("p-cancel").hidden = true;
    var fields = postForm.querySelectorAll("input, select, textarea");
    for (var i = 0; i < fields.length; i++) {
      setError(fields[i], "");
    }
    document.getElementById("post-form-error").textContent = "";
  }

  // Photo check: type and size first, then FileReader shows a preview
  coverInput.addEventListener("change", function () {
    var file = coverInput.files[0];
    setError(coverInput, "");
    if (!file) {
      return;
    }
    if (PHOTO_TYPES.indexOf(file.type) === -1) {
      coverInput.value = ""; // forget the bad file; the old photo (if any) stays
      setError(coverInput, "This file isn't a photo. Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      coverInput.value = "";
      setError(coverInput, "This photo is " + (file.size / 1024 / 1024).toFixed(1) + " MB. Choose one under " + MAX_PHOTO_MB + " MB.");
      return;
    }
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

  // Save draft or Publish: both are submit buttons, and their value says which
  postForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var action = event.submitter ? event.submitter.value : "publish";
    var ok = true;
    postDone.hidden = true;

    // Run every check so all errors show at once (a draft can skip the body)
    if (titleInput.value.trim() === "") {
      ok = setError(titleInput, "Give the post a title.") && ok;
    } else {
      setError(titleInput, "");
    }
    if (categoryInput.value === "") {
      ok = setError(categoryInput, "Choose a category.") && ok;
    } else {
      setError(categoryInput, "");
    }
    if (dateInput.value === "") {
      ok = setError(dateInput, "Choose the post date.") && ok;
    } else {
      setError(dateInput, "");
    }
    if (coverData && altInput.value.trim() === "") {
      ok = setError(altInput, "Describe the photo in a few words.") && ok;
    } else {
      setError(altInput, "");
    }
    if (action === "publish" && bodyInput.value.trim() === "") {
      ok = setError(bodyInput, "Write the post body before publishing.") && ok;
    } else {
      setError(bodyInput, "");
    }
    setError(coverInput, "");

    var formError = document.getElementById("post-form-error");
    if (!ok) {
      formError.textContent = "Some fields need fixing. Check the messages above.";
      focusFirstError(postForm);
      return;
    }
    formError.textContent = "";

    var all = loadPosts();
    var post = editingId ? findPost(all, editingId) : null;
    if (!post) {
      var maxId = 0;
      for (var i = 0; i < all.length; i++) {
        maxId = Math.max(maxId, all[i].post_id);
      }
      post = { post_id: maxId + 1, created_by: "Sample officer" };
      all.push(post);
    }
    var bodyText = bodyInput.value.trim();
    var summaryText = document.getElementById("p-summary").value.trim();
    post.title = titleInput.value.trim();
    post.category = categoryInput.value;
    post.published_at = dateInput.value;
    // No summary typed: use the start of the first paragraph
    post.summary = summaryText || bodyText.split(/\n\s*\n/)[0].slice(0, 160);
    post.body = bodyText;
    post.caption_by = document.getElementById("p-caption").value.trim();
    post.cover_image = coverData;
    post.cover_alt = coverData ? altInput.value.trim() : "";
    post.status = action === "publish" ? "published" : "draft";
    post.sample = false;

    if (!savePosts(all)) {
      setError(coverInput, "This browser couldn't store the post. The photo may be too big for the prototype: try a smaller one.");
      coverInput.focus();
      return;
    }

    var link = "article.html?id=" + post.post_id;
    document.getElementById("post-done-title").textContent = post.status === "published" ? "✓ Published" : "○ Draft saved";
    document.getElementById("post-done-text").innerHTML = post.status === "published"
      ? "\"" + escapeHtml(post.title) + "\" is published on News. " +
        '<a href="' + link + '">View the post</a> or <a href="news.html">open News</a>.'
      : "\"" + escapeHtml(post.title) + "\" is saved as a draft. Students can't see it until you publish it.";
    resetPostForm();
    renderOfficerPosts();
    postDone.hidden = false;
    postDone.focus();
  });

  document.getElementById("p-cancel").addEventListener("click", function () {
    resetPostForm();
    titleInput.focus();
  });

  // Edit and Unpublish/Publish buttons in the posts table (one listener for all rows)
  postRows.addEventListener("click", function (event) {
    var btn = event.target.closest("button");
    if (!btn) {
      return;
    }
    var all = loadPosts();

    if (btn.dataset.postEdit) {
      var post = findPost(all, Number(btn.dataset.postEdit));
      resetPostForm();
      editingId = post.post_id;
      titleInput.value = post.title;
      categoryInput.value = post.category;
      dateInput.value = post.published_at;
      document.getElementById("p-summary").value = post.summary;
      bodyInput.value = post.body;
      document.getElementById("p-caption").value = post.caption_by || "";
      showPreview(post.cover_image);
      altInput.value = post.cover_alt || "";
      document.getElementById("post-form-title").textContent = "Edit post";
      document.getElementById("p-cancel").hidden = false;
      postDone.hidden = true;
      titleInput.focus();
    }

    if (btn.dataset.postToggle) {
      var target = findPost(all, Number(btn.dataset.postToggle));
      target.status = target.status === "published" ? "draft" : "published";
      savePosts(all);
      renderOfficerPosts();
      document.getElementById("desk-status").textContent = "\"" + target.title + "\" is now " +
        (target.status === "published" ? "published on News." : "a draft, hidden from News.");
      var again = postRows.querySelector('[data-post-toggle="' + target.post_id + '"]');
      if (again) {
        again.focus();
      }
    }
  });

  renderOfficerPosts();
}
