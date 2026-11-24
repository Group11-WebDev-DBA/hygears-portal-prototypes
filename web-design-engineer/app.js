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


/* ---------- 8. News posts (news, article, Home strip, officer Posts) ----------
   The prototype keeps posts in the browser's localStorage, so a post an
   officer publishes on officer.html shows on news.html in the same browser.
   In the real site they come from the MySQL posts table:
   SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC */

// Every prototype opened from file:// shares one localStorage, so this
// direction uses its own key.
var POSTS_KEY = 'hygears-routeline-posts';

// Sample posts, written only from facts on the org's Facebook page.
// The field names match the planned posts table columns.
// "photos" are the inline photos inside an article (samples only).
var SAMPLE_POSTS = [
  {
    post_id: 5, title: 'Luna team progress report', category: 'Progress report',
    published_at: '2026-11-20', status: 'published', sample: true,
    summary: 'A sample of how the Luna team\'s progress reports will look on the portal. The real update comes from the officers.',
    cover_image: '../assets/luna-night.png', cover_alt: 'The Luna electric car parked at night beside the PUP Lagoon sign',
    caption_by: 'Creative Media and Design (sample)',
    body: 'This is a sample post. It shows how a progress report from the Luna team will look on the portal, so the officers can see the layout before they write the real one. No real details from the team are shown here.\n\n' +
      'Luna is the series of energy-efficient electric vehicles that PUP Hygears builds for the Shell Eco-marathon. The Eco-marathon is an energy-efficiency competition, not a race: the goal is to go as far as possible on as little energy as possible.\n\n' +
      'A real progress report would say what each part of the team worked on during the period, what was built or tested, and what comes next. Members come from Mechanical, Electronics and Communications, Industrial, Electrical and Computer Engineering, and Marketing, so a report can cover the car, its electronics and the work around it.\n\n' +
      'Photos from the workshop and the test days would go between the paragraphs, each with a short caption, the way the two photos in this post do.\n\n' +
      'When the officers send the real update, this sample will be replaced. Until then, follow PUP Hygears on Facebook for the latest from the team.',
    photos: [
      { src: '../assets/team-luna-1.png', alt: 'Hygears members standing around the Luna electric car outdoors', caption: 'The team with the Luna.' },
      { src: '../assets/team-2.png', alt: 'Hygears members standing in a line for a team photo', caption: 'Hygears members. Stand-in photo until the officers send ones from this period.' }
    ]
  },
  {
    post_id: 4, title: 'A PUP student is a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge 2026',
    category: 'Competition', published_at: '2026-11-12', status: 'published', sample: true,
    summary: 'A PUP student made it to the finals of the first national SOLIDWORKS Mechanical Design Challenge.',
    cover_image: '', cover_alt: '', caption_by: 'Creative Media and Design (sample)',
    body: 'A PUP student is a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge 2026.\n\n' +
      'SOLIDWORKS is 3D design software that engineering students use to model parts and machines before they are built. A national design challenge puts that skill up against students from other schools.\n\n' +
      'The results of the final round will be posted here once the officers share them.'
  },
  {
    post_id: 3, title: 'ASCEND 2026: meet the five committees', category: 'Recruitment',
    published_at: '2026-10-28', status: 'published', sample: true,
    summary: 'Recruitment for new members is open. Pick the committee you want to start in and apply.',
    cover_image: '../assets/team-2.png', cover_alt: 'Hygears members standing in a line for a team photo',
    caption_by: 'Creative Media and Design (sample)',
    body: 'ASCEND 2026 is the PUP Hygears recruitment for new members. Every member joins one of five committees.\n\n' +
      'The five committees are Finance and Operations, Internal Affairs, Innovation and Research, External Affairs, and Creative Media and Design.\n\n' +
      'You don\'t need to be an engineering student to help. Members come from Mechanical, Electronics and Communications, Industrial, Electrical and Computer Engineering, and Marketing.\n\n' +
      'As the organization puts it: "We don\'t just build vehicles, we build people to help us build the future!" Apply on the Join page and choose your preferred committee. Officers read every application.'
  },
  {
    post_id: 2, title: 'General Assembly: The Force Awakens, Refining Our Legacy', category: 'Announcement',
    published_at: '2026-10-10', status: 'published', sample: true,
    summary: 'The organization\'s General Assembly brought the Merakis together under one theme.',
    cover_image: '../assets/team-luna-1.png', cover_alt: 'Hygears members standing around the Luna electric car outdoors',
    caption_by: 'Creative Media and Design (sample)',
    body: 'PUP Hygears held its General Assembly with the theme "The Force Awakens: Refining Our Legacy." In Hygears, members are called Merakis.\n\n' +
      'A general assembly brings the whole organization together, from the officers to the newest members of all five committees.\n\n' +
      'The program and photos from the day will be added once the officers send them.'
  },
  {
    post_id: 1, title: 'PHYNIX 2026: PUP Hygears Research Workshop', category: 'Workshop',
    published_at: '2026-09-26', status: 'published', sample: true,
    summary: 'Our research workshop for PUP students: "Nex-thinkers, N-explorers, Nex-creators."',
    cover_image: '', cover_alt: '', caption_by: 'Creative Media and Design (sample)',
    body: 'PHYNIX 2026 is the research workshop that PUP Hygears runs for PUP students. Its tagline: "Nex-thinkers, N-explorers, Nex-creators."\n\n' +
      'The workshop follows the organization\'s aim: to raise PUP students\' awareness of research and to train competent students through real work on innovation and on building a highly efficient vehicle.\n\n' +
      'The date, venue and topics will be added here once the officers send them.'
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

// Newest first (like ORDER BY published_at DESC); same date: newer id first
function sortNewestFirst(list) {
  list.sort(function (a, b) {
    if (a.published_at === b.published_at) return b.post_id - a.post_id;
    return a.published_at < b.published_at ? 1 : -1;
  });
  return list;
}

// Only the published posts, newest first
function getPublishedPosts() {
  var all = loadPosts();
  var list = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].status === 'published') list.push(all[i]);
  }
  return sortNewestFirst(list);
}

// Makes officer-typed text safe inside HTML (like PHP's htmlspecialchars)
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// "2026-11-20" -> "Nov 20, 2026" (written by hand, so the time zone can't shift it)
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDate(text) {
  var parts = text.split('-');
  return MONTHS[Number(parts[1]) - 1] + ' ' + Number(parts[2]) + ', ' + parts[0];
}

// Cover photo, or a dashed slot when the post has none yet
function coverHtml(post) {
  if (post.cover_image) {
    return '<img src="' + escapeHtml(post.cover_image) + '" alt="' + escapeHtml(post.cover_alt || '') +
      '" width="1440" height="810" loading="lazy">';
  }
  return '<div class="news-pic">Cover photo<br>from officers</div>';
}

// One post row: used on News, the Home strip and "More posts".
// The title is the row's link; "Read more" repeats it for touch, so
// it is hidden from the keyboard and screen readers (no double reading).
function postRowHtml(post) {
  var link = 'article.html?id=' + post.post_id;
  return '<li class="post-row">' +
    '<a class="post-thumb" href="' + link + '" tabindex="-1" aria-hidden="true">' + coverHtml(post) + '</a>' +
    '<div>' +
      '<p class="post-meta"><span class="post-cat">' + escapeHtml(post.category) + '</span> ' +
      '<time datetime="' + post.published_at + '">' + formatDate(post.published_at) + '</time>' +
      (post.sample ? ' <span class="sample-tag">Sample</span>' : '') + '</p>' +
      '<h3><a href="' + link + '">' + escapeHtml(post.title) + '</a></h3>' +
      '<p>' + escapeHtml(post.summary) + '</p>' +
      '<a class="read-more" href="' + link + '" tabindex="-1" aria-hidden="true">Read more</a>' +
    '</div></li>';
}

// Draws rows into a list
function renderPostRows(listEl, posts) {
  var html = '';
  for (var i = 0; i < posts.length; i++) html += postRowHtml(posts[i]);
  listEl.innerHTML = html;
}

/* Home: "Latest from Hygears", the 3 newest posts */
var latestList = document.getElementById('latest-posts');
if (latestList) {
  renderPostRows(latestList, getPublishedPosts().slice(0, 3));
}

/* News page: rows with category chips (news.html?cat=Workshop opens filtered) */
var newsList = document.getElementById('news-list');
if (newsList) {
  var newsChips = document.querySelectorAll('.news-chip');
  var newsCount = document.getElementById('news-count');
  var newsEmpty = document.getElementById('news-empty');
  var currentCat = new URLSearchParams(window.location.search).get('cat') || 'all';

  function showNews() {
    var all = getPublishedPosts();
    var shown = [];
    for (var i = 0; i < all.length; i++) {
      if (currentCat === 'all' || all[i].category === currentCat) shown.push(all[i]);
    }
    renderPostRows(newsList, shown);
    newsCount.textContent = shown.length === all.length
      ? 'Showing all ' + all.length + ' posts'
      : 'Showing ' + shown.length + ' of ' + all.length + ' posts';
    newsEmpty.classList.toggle('is-visible', shown.length === 0);
    // Chips work like radio buttons: only the current one is pressed
    for (var c = 0; c < newsChips.length; c++) {
      newsChips[c].setAttribute('aria-pressed', newsChips[c].dataset.cat === currentCat ? 'true' : 'false');
    }
  }

  for (var nc = 0; nc < newsChips.length; nc++) {
    newsChips[nc].addEventListener('click', function () {
      currentCat = this.dataset.cat;
      showNews();
    });
  }
  showNews();
}

/* Article page: one post, chosen by article.html?id=N (no id: the newest) */
var articleBox = document.getElementById('article');
if (articleBox) {
  var livePosts = getPublishedPosts();
  var wantedId = new URLSearchParams(window.location.search).get('id');
  var post = null;
  for (var a = 0; a < livePosts.length; a++) {
    if (String(livePosts[a].post_id) === wantedId) post = livePosts[a];
  }
  if (!wantedId && livePosts.length) post = livePosts[0];

  if (!post) {
    articleBox.innerHTML = '<h1>Post not found</h1><p>This post was unpublished or never existed. ' +
      '<a href="news.html">See all news</a>.</p>';
    document.getElementById('more-posts-section').hidden = true;
  } else {
    document.title = post.title + ' | PUP Hygears';

    // Blank lines in the body become paragraphs; inline photos go after the 2nd and 4th
    var paragraphs = post.body.split(/\n\s*\n/);
    var photos = post.photos || [];
    var bodyHtml = '';
    for (var b = 0; b < paragraphs.length; b++) {
      bodyHtml += '<p>' + escapeHtml(paragraphs[b].trim()) + '</p>';
      var photo = photos[(b - 1) / 2];
      if (b % 2 === 1 && photo) {
        bodyHtml += '<figure class="article-photo"><img src="' + escapeHtml(photo.src) + '" alt="' + escapeHtml(photo.alt) +
          '" width="1440" height="810" loading="lazy"><figcaption>' + escapeHtml(photo.caption) + '</figcaption></figure>';
      }
    }

    articleBox.innerHTML =
      '<p class="post-meta"><span class="post-cat">' + escapeHtml(post.category) + '</span> ' +
      '<time datetime="' + post.published_at + '">' + formatDate(post.published_at) + '</time></p>' +
      '<h1>' + escapeHtml(post.title) + '</h1>' +
      (post.sample ? '<p class="article-sample"><span class="sample-tag">Sample article</span> Written from the org\'s public posts. The officers will send the real details.</p>' : '') +
      '<figure class="article-cover">' + coverHtml(post) + '</figure>' +
      '<div class="article-body">' + bodyHtml + '</div>' +
      '<p class="article-byline">Caption by ' + escapeHtml(post.caption_by || 'PUP Hygears') + '</p>';

    // "More posts": the newest other posts
    var more = [];
    for (var m = 0; m < livePosts.length && more.length < 3; m++) {
      if (livePosts[m] !== post) more.push(livePosts[m]);
    }
    renderPostRows(document.getElementById('more-posts'), more);
  }
}


/* ---------- 9. Join: applications open or closed ----------
   Recruitment is seasonal. The officers flip this (a setting in the real
   site). join.html?applications=closed previews the closed state.       */
var APPLICATIONS_OPEN = true;
var applyOpen = document.getElementById('apply-open');
if (applyOpen) {
  var isOpen = APPLICATIONS_OPEN && new URLSearchParams(window.location.search).get('applications') !== 'closed';
  applyOpen.hidden = !isOpen;
  document.getElementById('apply-closed').hidden = isOpen;
  document.getElementById('join-form').hidden = !isOpen;
  // The "What happens next" route only makes sense while the form is open
  document.querySelector('.layout-split > .side').hidden = !isOpen;
}


/* ---------- 10. Officer: Posts list and the New post form ---------- */
var postForm = document.getElementById('post-form');

if (postForm) {
  var postRows = document.getElementById('post-rows');
  var postDone = document.getElementById('post-done');
  var coverInput = document.getElementById('p-cover');
  var coverError = document.getElementById('p-cover-error');
  var coverPreview = document.getElementById('p-preview');
  var coverBox = document.getElementById('p-preview-box');
  var altInput = document.getElementById('p-alt');
  var bodyInput = document.getElementById('p-body');
  var editingId = null;  // post_id being edited, or null for a new post
  var coverData = '';    // the chosen photo as a data URL (the real site uploads the file instead)

  var MAX_PHOTO_MB = 2;
  var PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  document.getElementById('p-date').value = todayString();

  // Finds a post by id inside an array
  function findPost(all, id) {
    for (var i = 0; i < all.length; i++) {
      if (all[i].post_id === id) return all[i];
    }
    return null;
  }

  // Draws the officer's table of posts (newest first, drafts included)
  function renderOfficerPosts() {
    var all = sortNewestFirst(loadPosts());
    var html = '';
    for (var i = 0; i < all.length; i++) {
      var p = all[i];
      var isLive = p.status === 'published';
      var name = '<span class="visually-hidden"> ' + escapeHtml(p.title) + '</span>';
      html += '<tr>' +
        '<td data-label="Title">' + escapeHtml(p.title) + (p.sample ? ' <span class="small muted">(sample)</span>' : '') + '</td>' +
        '<td data-label="Category">' + escapeHtml(p.category) + '</td>' +
        '<td data-label="Date" class="nowrap">' + formatDate(p.published_at) + '</td>' +
        '<td data-label="Status"><span class="status">' + (isLive ? ICON_CHECK + ' Published' : ICON_CLOCK + ' Draft') + '</span></td>' +
        '<td class="actions">' +
          '<button type="button" class="btn btn-secondary btn-small" data-post-edit="' + p.post_id + '">Edit' + name + '</button>' +
          '<button type="button" class="btn btn-secondary btn-small" data-post-toggle="' + p.post_id + '">' + (isLive ? 'Unpublish' : 'Publish') + name + '</button>' +
        '</td></tr>';
    }
    postRows.innerHTML = html;
    document.getElementById('count-posts').textContent = getPublishedPosts().length;
  }

  // Shows the chosen photo, or hides the preview when there is none.
  // A photo needs a short description, so that field only counts with a photo.
  function showPreview(src) {
    coverData = src || '';
    if (src) coverPreview.src = src;
    else coverPreview.removeAttribute('src');
    coverBox.hidden = !src;
    document.getElementById('p-alt-field').hidden = !src;
    altInput.required = !!src;
  }

  // Back to an empty "New post" form
  function resetPostForm() {
    postForm.reset();
    editingId = null;
    showPreview('');
    document.getElementById('p-date').value = todayString();
    document.getElementById('post-form-title').textContent = 'New post';
    document.getElementById('p-cancel').hidden = true;
    var bad = postForm.querySelectorAll('.has-error');
    for (var i = 0; i < bad.length; i++) bad[i].classList.remove('has-error');
    postForm.querySelector('.form-alert').classList.remove('is-visible');
  }

  // Photo check: type and size first, then FileReader shows a preview
  coverInput.addEventListener('change', function () {
    var file = coverInput.files[0];
    var problem = '';
    clearError(coverInput);
    if (!file) return;
    if (PHOTO_TYPES.indexOf(file.type) === -1) {
      problem = 'This file isn\'t a photo. Choose a JPG, PNG or WebP image.';
    } else if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      problem = 'This photo is ' + (file.size / 1024 / 1024).toFixed(1) + ' MB. Choose one under ' + MAX_PHOTO_MB + ' MB.';
    }
    if (problem) {
      coverInput.value = ''; // forget the bad file; the old photo (if any) stays
      coverError.textContent = problem;
      showError(coverInput);
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      showPreview(reader.result); // reader.result is the photo as a data URL
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('p-remove').addEventListener('click', function () {
    coverInput.value = '';
    showPreview('');
    coverInput.focus();
  });

  // Save draft or Publish: both are submit buttons, and their value says which
  postForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var action = e.submitter ? e.submitter.value : 'publish';
    bodyInput.required = action === 'publish'; // a draft only needs a title
    postDone.hidden = true;
    if (!validateForm(postForm)) return;

    var all = loadPosts();
    var post = editingId ? findPost(all, editingId) : null;
    if (!post) {
      var maxId = 0;
      for (var i = 0; i < all.length; i++) maxId = Math.max(maxId, all[i].post_id);
      post = { post_id: maxId + 1, created_by: 'Sample officer' };
      all.push(post);
    }
    var bodyText = bodyInput.value.trim();
    var summaryText = document.getElementById('p-summary').value.trim();
    post.title = document.getElementById('p-title').value.trim();
    post.category = document.getElementById('p-category').value;
    post.published_at = document.getElementById('p-date').value;
    // No summary typed: use the start of the first paragraph
    post.summary = summaryText || bodyText.split(/\n\s*\n/)[0].slice(0, 160);
    post.body = bodyText;
    post.caption_by = document.getElementById('p-caption').value.trim();
    post.cover_image = coverData;
    post.cover_alt = coverData ? altInput.value.trim() : '';
    post.status = action === 'publish' ? 'published' : 'draft';
    post.sample = false;

    if (!savePosts(all)) {
      coverError.textContent = 'This browser couldn\'t store the post. The photo may be too big for the prototype: try a smaller one.';
      showError(coverInput);
      coverInput.focus();
      return;
    }

    var link = 'article.html?id=' + post.post_id;
    document.getElementById('post-done-text').innerHTML = post.status === 'published'
      ? 'Published "' + escapeHtml(post.title) + '". It is now at the top of News. ' +
        '<a href="' + link + '">View the post</a> or <a href="news.html">open News</a>.'
      : 'Saved "' + escapeHtml(post.title) + '" as a draft. Students can\'t see it until you publish it.';
    document.getElementById('post-done-status').innerHTML = post.status === 'published'
      ? ICON_CHECK + ' Published' : ICON_CLOCK + ' Draft saved';
    resetPostForm();
    renderOfficerPosts();
    postDone.hidden = false;
    postDone.focus();
  });

  document.getElementById('p-cancel').addEventListener('click', function () {
    resetPostForm();
    document.getElementById('p-title').focus();
  });

  // Edit and Unpublish/Publish buttons in the posts table (one listener for all rows)
  postRows.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var all = loadPosts();

    if (btn.dataset.postEdit) {
      var post = findPost(all, Number(btn.dataset.postEdit));
      resetPostForm();
      editingId = post.post_id;
      document.getElementById('p-title').value = post.title;
      document.getElementById('p-category').value = post.category;
      document.getElementById('p-date').value = post.published_at;
      document.getElementById('p-summary').value = post.summary;
      bodyInput.value = post.body;
      document.getElementById('p-caption').value = post.caption_by || '';
      showPreview(post.cover_image);
      altInput.value = post.cover_alt || '';
      document.getElementById('post-form-title').textContent = 'Edit post';
      document.getElementById('p-cancel').hidden = false;
      postDone.hidden = true;
      document.getElementById('p-title').focus();
    }

    if (btn.dataset.postToggle) {
      var target = findPost(all, Number(btn.dataset.postToggle));
      target.status = target.status === 'published' ? 'draft' : 'published';
      savePosts(all);
      renderOfficerPosts();
      document.getElementById('dash-announce').textContent = '"' + target.title + '" is now ' +
        (target.status === 'published' ? 'published on News.' : 'a draft, hidden from News.');
      var again = postRows.querySelector('[data-post-toggle="' + target.post_id + '"]');
      if (again) again.focus();
    }
  });

  renderOfficerPosts();
}
