// ==========================================================
// PUP Hygears portal prototype, "Ink" direction
// Page states only (menus, filters, form checks, sample results).
// Nothing here sends data anywhere. On the real site PHP does that.
// Each section only runs if its form or element is on the page.
// ==========================================================

// ---------- Small helpers used by several pages ----------

// Reads ?item=dmm style values from the address bar
var params = new URLSearchParams(window.location.search);

// Icons for the status tags (the same SVGs as in the HTML)
var ICONS = {
  check: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>',
  clock: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>',
  x: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>'
};

// Builds a status tag: a word plus an icon, never colour alone
function makeTag(state) {
  var tags = {
    pending: ['tag--wait', 'clock', 'Pending'],
    approved: ['tag--on', 'check', 'Approved'],
    declined: ['tag--out', 'x', 'Declined'],
    accepted: ['tag--on', 'check', 'Accepted'],
    returned: ['tag--on', 'check', 'Returned']
  };
  var t = tags[state];
  return '<span class="tag ' + t[0] + '">' + ICONS[t[1]] + t[2] + '</span>';
}

// Stops typed text from being read as HTML (same job as PHP's htmlspecialchars)
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// "2026-11-24" becomes "24 Nov 2026"
function formatDate(iso) {
  if (!iso) return 'None, consumable';
  return new Date(iso + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Today's date as "YYYY-MM-DD" in local time
function todayISO() {
  var d = new Date();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + month + '-' + day;
}

// Builds the label/value rows inside a slip
function slipRows(pairs) {
  var html = '<dl class="slip__rows">';
  for (var i = 0; i < pairs.length; i++) {
    html += '<div><dt>' + pairs[i][0] + '</dt><dd>' + escapeHtml(pairs[i][1]) + '</dd></div>';
  }
  return html + '</dl>';
}

// Saves sent requests in this browser so Track request can find them.
// try/catch because some browsers block storage on file:// pages.
function loadRequests() {
  try { return JSON.parse(localStorage.getItem('hyg-requests') || '{}'); } catch (err) { return {}; }
}
function saveRequest(ref, data) {
  try {
    var all = loadRequests();
    all[ref] = data;
    localStorage.setItem('hyg-requests', JSON.stringify(all));
  } catch (err) { /* not saved, the prototype still works */ }
}

// ---------- Phone menu ----------
var menuButton = document.querySelector('.menu-toggle');
var navLinks = document.getElementById('nav-links');
if (menuButton) {
  menuButton.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', isOpen);
  });
}

// ---------- Form validation ----------
// Uses the browser's built-in checks (required, pattern, type="email")
// and shows our own message under each field. Messages live in
// data-req (field empty) and data-bad (wrong format) in the HTML.
function validateForm(form) {
  var firstBad = null;
  for (var i = 0; i < form.elements.length; i++) {
    var field = form.elements[i];
    if (!field.id || field.disabled || !field.willValidate || field.type === 'submit') continue;

    var message = '';
    if (field.validity.valueMissing) {
      message = field.dataset.req || 'This field is required.';
    } else if (!field.validity.valid) {
      message = field.dataset.bad || 'Check this value.';
    } else {
      message = extraCheck(field, form);
    }

    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    var errorBox = document.getElementById(field.id + '-err');
    if (errorBox) errorBox.textContent = message;
    if (message && !firstBad) firstBad = field;
  }
  if (firstBad) firstBad.focus();
  return firstBad === null;
}

// Checks the browser can't do alone
function extraCheck(field, form) {
  if (field.id === 'r-qty' && field.max && Number(field.value) > Number(field.max)) {
    return 'Only ' + field.max + ' available right now.';
  }
  if (field.id === 'r-return' && field.value && form.elements.pickup.value && field.value < form.elements.pickup.value) {
    return field.dataset.bad;
  }
  // Officer New post form: the photo check result, and a description when there is a photo
  if (field.id === 'np-cover') return coverError;
  if (field.id === 'np-alt' && coverData && field.value.trim() === '') {
    return 'Describe the photo in a few words, for screen readers.';
  }
  return '';
}

// No date field accepts a day in the past (except ones marked data-nomin, like a post date)
var dateFields = document.querySelectorAll('input[type="date"]:not([data-nomin])');
for (var d = 0; d < dateFields.length; d++) dateFields[d].min = todayISO();

// ---------- Home: the reservation counter ----------
var counter = document.getElementById('counter');
if (counter) {
  var counterItem = document.getElementById('c-item');
  var counterHint = document.getElementById('c-item-hint');

  // Show how many are on the shelf for the picked item
  counterItem.addEventListener('change', function () {
    var option = counterItem.options[counterItem.selectedIndex];
    if (!counterItem.value) {
      counterHint.textContent = 'Pick an item to see how many are on the shelf.';
      return;
    }
    document.getElementById('c-qty').max = option.dataset.available;
    var typeText = option.dataset.type === 'tool' ? 'Tools come back by a return date.' : 'Consumables are yours to use up.';
    counterHint.textContent = option.dataset.available + ' on the shelf now. ' + typeText;
  });

  // The counter sends you to the full form on Tools; it needs an item first
  counter.addEventListener('submit', function (e) {
    if (!counterItem.value) {
      e.preventDefault();
      counterItem.setAttribute('aria-invalid', 'true');
      document.getElementById('c-item-err').textContent = 'Choose an item first.';
      counterItem.focus();
    }
  });
}

// ---------- Tools: search and filters ----------
var filters = document.getElementById('filters');
if (filters) {
  var itemsTable = document.getElementById('items');
  var noMatch = document.getElementById('no-match');
  var countText = document.getElementById('count');
  var itemRows = itemsTable.querySelectorAll('tbody tr');

  // Hide every row that doesn't match the search, category and type
  function applyFilters() {
    var search = document.getElementById('q').value.trim().toLowerCase();
    var category = document.getElementById('cat').value;
    var type = filters.elements.type.value;
    var shown = 0;

    for (var i = 0; i < itemRows.length; i++) {
      var row = itemRows[i];
      var matches = (search === '' || row.dataset.name.indexOf(search) !== -1) &&
                    (category === '' || row.dataset.category === category) &&
                    (type === '' || row.dataset.type === type);
      row.hidden = !matches;
      if (matches) shown++;
    }

    itemsTable.hidden = shown === 0;
    noMatch.hidden = shown !== 0;
    countText.textContent = shown === itemRows.length
      ? 'Showing all ' + itemRows.length + ' items.'
      : 'Showing ' + shown + ' of ' + itemRows.length + ' items.';
  }

  filters.addEventListener('input', applyFilters);
  filters.addEventListener('change', applyFilters);
  filters.addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('clear-filters').addEventListener('click', function () {
    filters.reset();
    applyFilters();
    document.getElementById('q').focus();
  });
}

// ---------- Tools: reserve form ----------
var reserveForm = document.getElementById('reserve-form');
if (reserveForm) {
  var itemSelect = document.getElementById('r-item');
  var qtyInput = document.getElementById('r-qty');
  var returnInput = document.getElementById('r-return');
  var reserveDone = document.getElementById('reserve-done');

  // When the item changes: set the max quantity, and switch off
  // the return date for consumables (they are used up)
  function syncItem() {
    var option = itemSelect.options[itemSelect.selectedIndex];
    var isConsumable = option.dataset.type === 'consumable';

    if (itemSelect.value) {
      qtyInput.max = option.dataset.available;
      document.getElementById('r-qty-hint').textContent = 'Up to ' + option.dataset.available + '.';
    } else {
      qtyInput.removeAttribute('max');
      document.getElementById('r-qty-hint').textContent = 'Pick an item first.';
    }

    returnInput.disabled = isConsumable;
    returnInput.required = !isConsumable;
    if (isConsumable) {
      returnInput.value = '';
      returnInput.setAttribute('aria-invalid', 'false');
      document.getElementById('r-return-err').textContent = '';
    }
    document.getElementById('r-return-hint').textContent = isConsumable
      ? 'Consumables are used up, so no return date.'
      : 'Tools only. On or after the pickup date.';
  }

  itemSelect.addEventListener('change', syncItem);
  document.getElementById('r-pickup').addEventListener('change', function () {
    returnInput.min = this.value || todayISO();
  });

  // Fill in what the home counter or a row's Reserve link passed along
  if (params.get('item')) { itemSelect.value = params.get('item'); syncItem(); }
  if (params.get('qty')) qtyInput.value = params.get('qty');
  if (params.get('pickup')) document.getElementById('r-pickup').value = params.get('pickup');

  // Reserve buttons in the table pick the item and jump to the form
  var reserveLinks = document.querySelectorAll('[data-reserve]');
  for (var r = 0; r < reserveLinks.length; r++) {
    reserveLinks[r].addEventListener('click', function (e) {
      e.preventDefault();
      itemSelect.value = this.dataset.reserve;
      syncItem();
      document.getElementById('reserve').scrollIntoView();
      document.getElementById('r-name').focus({ preventScroll: true });
    });
  }

  reserveForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(reserveForm)) return;

    var f = reserveForm.elements;
    // Sample reference number like HYG-2026-0142 (the database makes the real one)
    var ref = 'HYG-' + new Date().getFullYear() + '-' + String(150 + Math.floor(Math.random() * 9850)).padStart(4, '0');
    var itemName = itemSelect.options[itemSelect.selectedIndex].text.replace(/ \(.*\)$/, '');
    var data = { item: itemName, qty: f.qty.value, pickup: f.pickup.value, ret: f['return'].value };
    saveRequest(ref, data);

    reserveDone.innerHTML =
      '<div class="slip__title"><p class="slip__name">Request recorded in this preview</p>' + makeTag('pending') + '</div>' +
      '<p class="note">Your reference number</p><p class="slip__ref">' + ref + '</p>' +
      slipRows([['Item', data.item], ['Quantity', data.qty], ['Pickup', formatDate(data.pickup)], ['Return', formatDate(data.ret)], ['Name', f.name.value.trim()]]) +
      '<p class="note">Prototype: nothing was sent. On the live site this request goes to the officers, and the number works on Track request.</p>' +
      '<div class="slip__foot"><a class="btn" href="track.html?ref=' + ref + '">Track request</a>' +
      '<button class="btn btn--quiet" type="button" id="reserve-again">Reserve another</button></div>';
    reserveForm.hidden = true;
    reserveDone.hidden = false;
    reserveDone.focus();

    document.getElementById('reserve-again').addEventListener('click', function () {
      reserveForm.reset();
      syncItem();
      reserveDone.hidden = true;
      reserveForm.hidden = false;
      document.getElementById('r-name').focus();
    });
  });
}

// ---------- Track request ----------
var trackForm = document.getElementById('track-form');
if (trackForm) {
  // Three sample requests, one for each state
  var SAMPLES = {
    'HYG-2026-0142': { state: 'pending', item: 'Digital multimeter', qty: 1, pickup: '2026-11-24', ret: '2026-11-27', note: 'No officer has reviewed it yet. Check again before your pickup date.' },
    'HYG-2026-0137': { state: 'approved', item: 'Cordless drill', qty: 1, pickup: '2026-11-23', ret: '2026-11-25', note: 'Approved. Pick it up on your pickup date. The pickup room is still to be confirmed by the officers.' },
    'HYG-2026-0129': { state: 'declined', item: 'Heat gun', qty: 1, pickup: '2026-11-22', ret: '2026-11-24', note: 'Declined. Officer’s note (sample): both heat guns are out until 28 Nov. Try a later date.' }
  };
  var refInput = document.getElementById('ref');
  var trackResult = document.getElementById('track-result');

  function runTrack() {
    var ref = refInput.value.trim().toUpperCase();
    refInput.value = ref;
    trackResult.innerHTML = '';
    if (!validateForm(trackForm)) return;

    if (!/^HYG-\d{4}-\d{4}$/.test(ref)) {
      refInput.setAttribute('aria-invalid', 'true');
      document.getElementById('ref-err').textContent = 'Write it like HYG-2026-0142: HYG, the year, then four digits.';
      refInput.focus();
      return;
    }

    var request = SAMPLES[ref];
    var saved = loadRequests()[ref];
    if (!request && saved) {
      request = { state: 'pending', item: saved.item, qty: saved.qty, pickup: saved.pickup, ret: saved.ret, note: 'Saved in this browser by the prototype. No officer has reviewed it yet.' };
    }

    if (request) {
      trackResult.innerHTML = '<div class="slip"><div class="slip__title"><p class="slip__ref">' + ref + '</p>' + makeTag(request.state) + '</div>' +
        '<p>' + escapeHtml(request.note) + '</p>' +
        slipRows([['Item', request.item], ['Quantity', request.qty], ['Pickup', formatDate(request.pickup)], ['Return', formatDate(request.ret)]]) + '</div>';
    } else {
      trackResult.innerHTML = '<div class="slip"><p class="slip__name">No request matches ' + escapeHtml(ref) + '</p>' +
        '<p>Check the number on your reservation slip. Sample numbers to try are listed below.</p></div>';
    }
  }

  trackForm.addEventListener('submit', function (e) { e.preventDefault(); runTrack(); });
  if (params.get('ref')) { refInput.value = params.get('ref'); runTrack(); }
}

// ---------- Join ----------
var joinForm = document.getElementById('join-form');
if (joinForm) {
  var joinDone = document.getElementById('join-done');
  joinForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(joinForm)) return;

    var f = joinForm.elements;
    joinDone.innerHTML =
      '<div class="slip__title"><p class="slip__name">Application recorded in this preview</p>' + makeTag('pending') + '</div>' +
      slipRows([['Name', f.name.value.trim()], ['Student number', f.student_number.value.trim()], ['Course', f.course.value], ['Year and section', f.year_section.value.trim()], ['Committee', f.committee.value]]) +
      '<p class="note">Prototype: nothing was sent. On the live site this goes to the officers, who reply to ' + escapeHtml(f.email.value.trim()) + '.</p>' +
      '<div class="slip__foot"><button class="btn btn--quiet" type="button" id="join-edit">Edit application</button></div>';
    joinForm.hidden = true;
    joinDone.hidden = false;
    joinDone.focus();

    document.getElementById('join-edit').addEventListener('click', function () {
      joinDone.hidden = true;
      joinForm.hidden = false;
      document.getElementById('j-name').focus();
    });
  });
}

// ---------- Officer desk ----------
var loginForm = document.getElementById('login-form');
if (loginForm) {
  var mainArea = document.getElementById('main');

  function signIn(email) {
    document.getElementById('who').textContent = email;
    mainArea.classList.add('is-signed-in');
  }

  // Stay signed in while this tab is open (PHP uses $_SESSION for this)
  try {
    if (sessionStorage.getItem('hyg-officer')) signIn(sessionStorage.getItem('hyg-officer'));
  } catch (err) { /* no session storage */ }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(loginForm)) return;
    var email = loginForm.elements.email.value.trim();
    try { sessionStorage.setItem('hyg-officer', email); } catch (err) { /* not kept */ }
    signIn(email);
    document.getElementById('dash-title').focus();
  });

  document.getElementById('sign-out').addEventListener('click', function () {
    try { sessionStorage.removeItem('hyg-officer'); } catch (err) { /* nothing to remove */ }
    mainArea.classList.remove('is-signed-in');
    loginForm.reset();
    document.getElementById('o-email').focus();
  });

  // Days late, counted from today's date
  var dueCells = document.querySelectorAll('[data-due]');
  for (var i = 0; i < dueCells.length; i++) {
    var msLate = new Date(todayISO()) - new Date(dueCells[i].dataset.due);
    dueCells[i].textContent = Math.max(0, Math.round(msLate / 86400000));
  }

  // Update the counts at the top and show "nothing left" rows when a table is done
  function recount() {
    var tables = document.querySelectorAll('[data-table]');
    for (var t = 0; t < tables.length; t++) {
      var open = tables[t].querySelectorAll('tr[data-row]:not(.row-done)').length;
      var countCell = document.querySelector('[data-count="' + tables[t].dataset.table + '"]');
      if (countCell) countCell.textContent = open;
      var emptyRow = tables[t].querySelector('.empty-row');
      if (emptyRow) emptyRow.hidden = open > 0;
    }
  }

  // One click handler for every row button (approve, decline, accept,
  // mark returned and undo). The old buttons are kept so Undo can restore them.
  var STATE_FOR = { approve: 'approved', decline: 'declined', accept: 'accepted', returned: 'returned' };
  document.querySelector('.dash').addEventListener('click', function (e) {
    var button = e.target.closest('button[data-act]');
    if (!button) return;
    var row = button.closest('tr');
    var actCell = row.querySelector('.act');
    var stateCell = row.querySelector('.state');

    if (button.dataset.act === 'undo') {
      actCell.innerHTML = row.dataset.prevAct;
      stateCell.innerHTML = row.dataset.prevState;
      row.classList.remove('row-done');
      actCell.querySelector('button').focus();
    } else {
      row.dataset.prevAct = actCell.innerHTML;
      row.dataset.prevState = stateCell.innerHTML;
      stateCell.innerHTML = makeTag(STATE_FOR[button.dataset.act]);
      row.classList.add('row-done');
      // The label tells screen reader users what Undo will reverse
      actCell.innerHTML = '<button class="btn btn--quiet btn--sm" type="button" data-act="undo" aria-label="Undo, marked ' + STATE_FOR[button.dataset.act] + '">Undo</button>';
      actCell.querySelector('button').focus();
    }
    recount();
  });
}

// ---------- News: the posts ----------
// On the real site each post is a row in the posts table, and PHP runs
// SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC.
// Here the five sample posts below are the starting rows. When an officer
// saves a post, the whole list is saved in this browser (localStorage),
// so news.html and article.html show it too.
// Dates are sample dates; the article text is sample text written from
// the events on the Hygears Facebook page.
var SAMPLE_POSTS = [
  {
    id: 1, category: 'Competition', date: '2026-11-21', status: 'published', sample: true,
    title: 'A PUP student is a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge',
    summary: 'A PUP student reached the finals of the first national SOLIDWORKS Mechanical Design Challenge. Hygears is cheering them on.',
    cover: '', coverAlt: '', captionBy: '',
    body: 'PUP Hygears congratulates a PUP student who was named a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge 2026.\n\n' +
      'SOLIDWORKS is the 3D design software engineering students use to model parts and assemblies before anything is cut or printed. A design challenge built around it tests how well students can turn an idea into a working mechanical design.\n\n' +
      'Reaching the finals of the first edition of a national challenge is a big step for a student from our university, and it shows the kind of design work PUP engineering students can do.\n\n' +
      'At Hygears the same skill goes into the Luna cars: every part starts as a model on screen before the team builds it. We hope this news gets more students practising design and joining projects where they can use it.\n\n' +
      'The results of the final round will be posted here once they are announced.'
  },
  {
    id: 2, category: 'Progress report', date: '2026-11-17', status: 'published', sample: true,
    title: 'Luna team progress report (sample)',
    summary: 'A sample that shows how the Luna team’s progress reports will look. The real report comes from the team.',
    cover: '../assets/luna-night.png', coverAlt: 'The black Luna car parked at night beside the PUP Lagoon sign, under string lights and trees.', captionBy: '',
    body: 'This is a sample post. No real details of the current Luna build are known yet, so this text only shows where a progress report goes and how it reads.\n\n' +
      'A real report would start with where the build stands: which parts of the car the team is working on, such as the chassis, the motor and controller, the battery or the body.\n\n' +
      'Next it would say what changed since the last report, what was tested and what the team learned. Photos from the workshop fit here, each with a caption.\n\n' +
      'It would end with what comes next and how members and supporters can help.\n\n' +
      'Officers can replace this sample from the Posts section of the officer dashboard.'
  },
  {
    id: 3, category: 'Recruitment', date: '2026-11-12', status: 'published', sample: true,
    title: 'ASCEND 2026: meet the five committees',
    summary: 'Hygears is recruiting for ASCEND 2026. Here are the five committees you can pick from when you apply.',
    cover: '../assets/team-2.png', coverAlt: 'More than twenty Hygears members in matching red and black team shirts stand in a line on the PUP campus.', captionBy: '',
    photos: [{ after: 3, src: '../assets/team-luna-1.png', alt: 'Hygears members gather around their black Luna car on a tree-lined road on the PUP campus.', caption: 'The team with a Luna car on campus.' }],
    body: 'ASCEND 2026 is the Hygears recruitment season, and applications are open to PUP students. When you apply, you pick the committee you would most like to work in.\n\n' +
      'Finance and Operations keeps the organization running: budgets, purchases and the paperwork behind every project.\n\n' +
      'Internal Affairs looks after the members, from welcoming new ones to the activities that keep everyone together.\n\n' +
      'Innovation and Research works on the technical side: the research and engineering behind the Luna cars and the team’s projects.\n\n' +
      'External Affairs works with partners and other organizations outside Hygears.\n\n' +
      'Creative Media and Design makes the posts, photos and designs that tell people what Hygears is doing.\n\n' +
      'Members come from Mechanical, Electronics and Communications, Industrial, Electrical and Computer Engineering, and Marketing. Apply from the Join page.'
  },
  {
    id: 4, category: 'Announcement', date: '2026-11-05', status: 'published', sample: true,
    title: 'General Assembly: “The Force Awakens: Refining Our Legacy”',
    summary: 'The Hygears General Assembly brought the Merakis together under the theme “The Force Awakens: Refining Our Legacy”.',
    cover: '', coverAlt: '', captionBy: '',
    body: 'Hygears held its General Assembly under the theme “The Force Awakens: Refining Our Legacy”.\n\n' +
      'The General Assembly is where the members, whom Hygears calls Merakis, meet as one organization: to hear where Hygears is headed, meet the officers and committees, and start the year’s work.\n\n' +
      'Photos and highlights from the assembly will be added here by the Creative Media and Design committee.'
  },
  {
    id: 5, category: 'Workshop', date: '2026-10-25', status: 'published', sample: true,
    title: 'PHYNIX 2026: PUP Hygears Research Workshop',
    summary: 'PHYNIX 2026 is the Hygears research workshop for “Nex-thinkers, N-explorers, Nex-creators”.',
    cover: '../assets/team-luna-1.png', coverAlt: 'Hygears members gather around their black Luna car on a tree-lined road on the PUP campus, some kneeling in front.', captionBy: '',
    photos: [{ after: 1, src: '../assets/luna-night.png', alt: 'The black Luna car parked at night beside the PUP Lagoon sign, under string lights.', caption: 'A Luna car at PUP.' }],
    body: 'PHYNIX 2026 is the PUP Hygears Research Workshop. Its tagline says who it is for: “Nex-thinkers, N-explorers, Nex-creators”.\n\n' +
      'Research is part of why Hygears exists. In the organization’s own words, it aims to further enhance the awareness of PUP students in the field of research.\n\n' +
      'This sample article will be replaced with the real program: the topics, the speakers, the schedule and photos from the day.\n\n' +
      'Watch this page and the Hygears Facebook page for updates.'
  }
];

// All posts: the copy saved in this browser, or the samples the first time.
// try/catch because some browsers block storage on file:// pages.
function getPosts() {
  try {
    var saved = localStorage.getItem('hyg-posts');
    if (saved) return JSON.parse(saved);
  } catch (err) { /* fall back to the samples */ }
  return SAMPLE_POSTS.slice();
}

// Saves the list. Returns false when the browser refuses (blocked or full).
function savePosts(posts) {
  try {
    localStorage.setItem('hyg-posts', JSON.stringify(posts));
    return true;
  } catch (err) {
    return false;
  }
}

// Newest first: by date, then by id for posts on the same day
function sortNewest(posts) {
  posts.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.id - a.id;
  });
  return posts;
}

// Only the published posts, newest first (what news.html shows)
function publishedPosts() {
  var all = getPosts();
  var list = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].status === 'published') list.push(all[i]);
  }
  return sortNewest(list);
}

// Finds one post by its id, or null
function findPost(id, posts) {
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].id === id) return posts[i];
  }
  return null;
}

// Body text: a blank line starts a new paragraph
function toParagraphs(text) {
  var parts = text.split(/\n\s*\n/);
  var list = [];
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].trim() !== '') list.push(parts[i].trim());
  }
  return list;
}

// The summary, or the start of the body when the officer left it empty
function summaryOf(post) {
  if (post.summary) return post.summary;
  var text = post.body.replace(/\s+/g, ' ').trim();
  return text.length > 160 ? text.slice(0, 157) + '...' : text;
}

// "2026-11-21" becomes "21 November 2026"
function longDate(iso) {
  return new Date(iso + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Builds one post for a list (news.html, the home strip, "More posts").
// The cover image has empty alt here because the title right under it says the same.
function postCard(post) {
  var link = 'article.html?id=' + post.id;
  var cover = post.cover
    ? '<div class="post__cover"><img src="' + escapeHtml(post.cover) + '" alt="" loading="lazy"></div>'
    : '<div class="post__slot">Photo to come</div>';
  return '<article class="post">' + cover +
    '<p class="post__meta"><span class="tag">' + escapeHtml(post.category) + '</span><time datetime="' + post.date + '">' + longDate(post.date) + '</time></p>' +
    '<h3><a href="' + link + '">' + escapeHtml(post.title) + '</a></h3>' +
    '<p>' + escapeHtml(summaryOf(post)) + '</p>' +
    '<a class="more" href="' + link + '">Read more<span class="visually-hidden">: ' + escapeHtml(post.title) + '</span></a>' +
    '</article>';
}

// ---------- Home: "Latest from Hygears" (the 3 newest posts) ----------
var latestBox = document.getElementById('latest-posts');
if (latestBox) {
  var latest = publishedPosts().slice(0, 3);
  var latestHtml = '';
  for (var lp = 0; lp < latest.length; lp++) latestHtml += postCard(latest[lp]);
  latestBox.innerHTML = latestHtml;
}

// ---------- News page: list with a category filter ----------
var newsList = document.getElementById('news-list');
if (newsList) {
  var newsFilter = document.getElementById('news-filter');

  function showNews() {
    var category = newsFilter.elements.cat.value;
    var posts = publishedPosts();
    var html = '';
    var shown = 0;
    for (var i = 0; i < posts.length; i++) {
      if (category === '' || posts[i].category === category) {
        html += postCard(posts[i]);
        shown++;
      }
    }
    newsList.innerHTML = html;
    document.getElementById('news-empty').hidden = shown > 0;
    document.getElementById('news-count').textContent = category === ''
      ? 'Showing all ' + shown + ' posts, newest first.'
      : 'Showing ' + shown + ' ' + category.toLowerCase() + ' post' + (shown === 1 ? '' : 's') + '.';
  }

  newsFilter.addEventListener('change', showNews);
  newsFilter.addEventListener('submit', function (e) { e.preventDefault(); });
  showNews();
}

// ---------- Article page: article.html?id=N ----------
var articleBox = document.getElementById('article');
if (articleBox) {
  var published = publishedPosts();
  var post = params.get('id') ? findPost(Number(params.get('id')), published) : published[0];

  if (!post) {
    // A wrong id, or a post that was unpublished
    articleBox.innerHTML = '<h1 id="article-title">This post is not available</h1>' +
      '<p class="lead">It may have been unpublished, or the link is wrong.</p>' +
      '<p class="article__by"><a href="news.html">See all news</a></p>';
  } else {
    document.title = post.title + ', PUP Hygears';
    var html = '<p class="post__meta"><span class="tag">' + escapeHtml(post.category) + '</span>' +
      '<time datetime="' + post.date + '">' + longDate(post.date) + '</time>' +
      (post.sample ? '<span>Sample article</span>' : '') + '</p>' +
      '<h1 id="article-title">' + escapeHtml(post.title) + '</h1>' +
      '<p class="lead">' + escapeHtml(summaryOf(post)) + '</p>';
    if (post.cover) {
      html += '<figure class="photo"><img src="' + escapeHtml(post.cover) + '" alt="' + escapeHtml(post.coverAlt || '') + '"></figure>';
    }

    // Paragraphs, with any inline photo placed after paragraph number "after"
    var paras = toParagraphs(post.body);
    var photos = post.photos || [];
    html += '<div class="article__body">';
    for (var p = 0; p < paras.length; p++) {
      html += '<p>' + escapeHtml(paras[p]) + '</p>';
      for (var ph = 0; ph < photos.length; ph++) {
        if (photos[ph].after === p + 1) {
          html += '<figure class="photo"><img src="' + escapeHtml(photos[ph].src) + '" alt="' + escapeHtml(photos[ph].alt) + '" loading="lazy">' +
            '<figcaption>' + escapeHtml(photos[ph].caption) + '</figcaption></figure>';
        }
      }
    }
    html += '</div>';
    html += '<p class="article__by">Caption by ' +
      (post.captionBy ? '<strong>' + escapeHtml(post.captionBy) + '</strong>' : '<span class="fill">writer’s name to come</span>') +
      ' for PUP Hygears.</p>';
    articleBox.innerHTML = html;
  }

  // "More posts": up to 3 other published posts
  var moreBox = document.getElementById('more-posts');
  var moreHtml = '';
  var moreCount = 0;
  for (var m = 0; m < published.length && moreCount < 3; m++) {
    if (published[m] !== post) {
      moreHtml += postCard(published[m]);
      moreCount++;
    }
  }
  moreBox.innerHTML = moreHtml;
}

// ---------- Officer desk: Posts list and the New post form ----------
var postForm = document.getElementById('post-form');
if (postForm) {
  var postRows = document.getElementById('post-rows');
  var postStatus = document.getElementById('post-status');
  var coverInput = document.getElementById('np-cover');
  var previewBox = document.getElementById('np-preview-box');
  var previewImg = document.getElementById('np-preview');
  var MAX_PHOTO = 2 * 1024 * 1024;           // 2 MB, the same limit PHP would check
  var PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  var coverData = '';                        // the chosen photo as a data URL
  var coverError = '';                       // message when the photo is wrong
  var editingId = null;                      // id of the post being edited, or null for a new one
  var publishClicked = true;                 // which submit button was pressed

  // Fills the officer table, drafts included, newest first
  function renderPostRows() {
    var posts = sortNewest(getPosts());
    var html = '';
    for (var i = 0; i < posts.length; i++) {
      var p = posts[i];
      var isLive = p.status === 'published';
      html += '<tr><td class="name" data-label="Title">' + escapeHtml(p.title) + '</td>' +
        '<td data-label="Category">' + escapeHtml(p.category) + '</td>' +
        '<td data-label="Date"><time datetime="' + p.date + '">' + formatDate(p.date) + '</time></td>' +
        '<td data-label="State">' + (isLive
          ? '<span class="tag tag--on">' + ICONS.check + 'Published</span>'
          : '<span class="tag tag--wait">' + ICONS.clock + 'Draft</span>') + '</td>' +
        '<td class="act"><div class="actions">' +
        '<button class="btn btn--quiet btn--sm" type="button" data-post-edit="' + p.id + '" aria-label="Edit ' + escapeHtml(p.title) + '">Edit</button>' +
        '<button class="btn btn--quiet btn--sm" type="button" data-post-toggle="' + p.id + '" aria-label="' + (isLive ? 'Unpublish ' : 'Publish ') + escapeHtml(p.title) + '">' + (isLive ? 'Unpublish' : 'Publish') + '</button>' +
        '</div></td></tr>';
    }
    if (posts.length === 0) html = '<tr><td colspan="5"><p><strong>No posts yet.</strong></p><p class="note">Write the first one below.</p></td></tr>';
    postRows.innerHTML = html;
  }

  // Shows or clears the photo preview
  function showPreview(src) {
    coverData = src;
    previewImg.src = src;
    previewBox.hidden = src === '';
  }

  // Cover photo: check the type and size, then preview it with FileReader
  coverInput.addEventListener('change', function () {
    var file = coverInput.files[0];
    coverError = '';
    if (!file) { showPreview(''); return; }

    if (PHOTO_TYPES.indexOf(file.type) === -1) {
      coverError = 'That file is not a JPG, PNG or WebP photo.';
    } else if (file.size > MAX_PHOTO) {
      coverError = 'That photo is ' + (file.size / 1048576).toFixed(1) + ' MB. Use one under 2 MB.';
    }
    document.getElementById('np-cover-err').textContent = coverError;
    coverInput.setAttribute('aria-invalid', coverError ? 'true' : 'false');
    if (coverError) {
      coverInput.value = '';
      showPreview('');
      return;
    }

    // FileReader turns the file into a data URL the <img> can show right away
    var reader = new FileReader();
    reader.addEventListener('load', function () { showPreview(reader.result); });
    reader.readAsDataURL(file);
  });

  document.getElementById('np-remove').addEventListener('click', function () {
    coverInput.value = '';
    showPreview('');
    coverInput.focus();
  });

  // Puts the form back to "New post"
  function resetPostForm() {
    postForm.reset();
    showPreview('');
    coverError = '';
    editingId = null;
    document.getElementById('np-date').value = todayISO();
    document.getElementById('post-form-title').textContent = 'New post';
    document.getElementById('np-cancel').hidden = true;
    document.getElementById('np-form-err').textContent = '';
    var fields = postForm.querySelectorAll('[aria-invalid]');
    for (var i = 0; i < fields.length; i++) fields[i].setAttribute('aria-invalid', 'false');
    var errors = postForm.querySelectorAll('.error');
    for (var j = 0; j < errors.length; j++) errors[j].textContent = '';
  }

  // Remember which submit button was pressed (Publish or Save draft)
  var submitButtons = postForm.querySelectorAll('button[type="submit"]');
  for (var sb = 0; sb < submitButtons.length; sb++) {
    submitButtons[sb].addEventListener('click', function () {
      publishClicked = this.dataset.status === 'published';
    });
  }

  postForm.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('np-form-err').textContent = '';
    if (!validateForm(postForm)) return;

    var f = postForm.elements;
    var posts = getPosts();
    var post = editingId === null ? null : findPost(editingId, posts);
    if (!post) {
      // New post: the next id (the database's AUTO_INCREMENT does this)
      var nextId = 1;
      for (var i = 0; i < posts.length; i++) nextId = Math.max(nextId, posts[i].id + 1);
      post = { id: nextId, sample: false };
      posts.push(post);
    }
    post.title = f.title.value.trim();
    post.category = f.category.value;
    post.date = f.date.value;
    post.cover = coverData;
    post.coverAlt = coverData ? f.cover_alt.value.trim() : '';
    post.summary = f.summary.value.trim();
    post.body = f.body.value.trim();
    post.captionBy = f.caption_by.value.trim();
    post.status = publishClicked ? 'published' : 'draft';

    if (!savePosts(posts)) {
      document.getElementById('np-form-err').textContent = 'This browser would not save the post. The photo may be too big for browser storage: try a smaller one, or remove it.';
      return;
    }

    var verb = editingId === null ? 'Published' : 'Saved changes to';
    postStatus.innerHTML = publishClicked
      ? verb + ' “' + escapeHtml(post.title) + '”. It is in the list above and shows on <a href="news.html">News</a> in this browser.'
      : 'Saved “' + escapeHtml(post.title) + '” as a draft. It stays off News until you publish it.';
    resetPostForm();
    renderPostRows();
    postStatus.focus();
  });

  document.getElementById('np-cancel').addEventListener('click', function () {
    resetPostForm();
    postStatus.textContent = '';
    document.getElementById('post-form-title').focus();
  });

  // Edit and Publish/Unpublish buttons in the table (one listener for all rows)
  postRows.addEventListener('click', function (e) {
    var button = e.target.closest('button');
    if (!button) return;
    var posts = getPosts();

    if (button.dataset.postEdit) {
      var post = findPost(Number(button.dataset.postEdit), posts);
      resetPostForm();
      editingId = post.id;
      var f = postForm.elements;
      f.title.value = post.title;
      f.category.value = post.category;
      f.date.value = post.date;
      f.cover_alt.value = post.coverAlt || '';
      f.summary.value = post.summary || '';
      f.body.value = post.body;
      f.caption_by.value = post.captionBy || '';
      showPreview(post.cover || '');
      document.getElementById('post-form-title').textContent = 'Edit post';
      document.getElementById('np-cancel').hidden = false;
      document.getElementById('post-form-title').focus();
      postForm.scrollIntoView();
    }

    if (button.dataset.postToggle) {
      var target = findPost(Number(button.dataset.postToggle), posts);
      target.status = target.status === 'published' ? 'draft' : 'published';
      if (!savePosts(posts)) {
        postStatus.textContent = 'This browser would not save the change.';
      } else {
        postStatus.innerHTML = target.status === 'published'
          ? 'Published “' + escapeHtml(target.title) + '”. It shows on <a href="news.html">News</a> again.'
          : 'Unpublished “' + escapeHtml(target.title) + '”. It no longer shows on News.';
      }
      renderPostRows();
      postStatus.focus();
    }
  });

  document.getElementById('np-date').value = todayISO();
  renderPostRows();
}

// ---------- Join: applications open or closed ----------
// Recruitment is seasonal. The real site reads this from an officer setting;
// here join.html?season=closed previews the closed state.
var appsOpenLine = document.getElementById('apps-open');
if (appsOpenLine) {
  var applicationsOpen = params.get('season') !== 'closed';
  appsOpenLine.hidden = !applicationsOpen;
  document.getElementById('apps-closed-line').hidden = applicationsOpen;
  document.getElementById('apps-closed').hidden = applicationsOpen;
  document.getElementById('apply').hidden = !applicationsOpen;
}
