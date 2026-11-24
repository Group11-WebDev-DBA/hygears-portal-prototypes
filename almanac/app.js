// ==========================================================
// PUP Hygears portal prototype, "Almanac" direction
// Page states only (filters, form checks, sample results).
// Nothing here talks to a server. In the PHP + MySQL build, every
// "preview" part below becomes a real form submit or query.
// Each section only runs if its form is on the page.
// ==========================================================

// ---------- Small helpers used by several pages ----------

// Reads ?item=... and ?ref=... values from the address bar
var params = new URLSearchParams(window.location.search);

// Key used to remember the last request made in this browser
var LAST_REF = 'hyg-last-request';

// Status icons (same SVGs as in the HTML), always shown with a word
var ICONS = {
  pending: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  approved: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  declined: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
};
var LABELS = { pending: 'Pending', approved: 'Approved', declined: 'Declined' };

function statusHtml(state) {
  return '<span class="status status--' + state + '">' + ICONS[state] + LABELS[state] + '</span>';
}

// Today's date as "YYYY-MM-DD" in local time
function today() {
  var d = new Date();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + month + '-' + day;
}

// ---------- Form errors ----------

// Shows (or clears) the message under one field
function setError(field, message) {
  var box = document.getElementById(field.id + '-error');
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (box) box.textContent = message;
}

// Checks every field that has a data-error message.
// extraCheck (optional) handles rules the browser can't check alone.
function validateForm(form, extraCheck) {
  var fields = form.querySelectorAll('[data-error]');
  var firstBad = null;
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var message = field.checkValidity() ? '' : field.dataset.error;
    if (!message && extraCheck) message = extraCheck(field);
    setError(field, message);
    if (message && !firstBad) firstBad = field;
  }
  if (firstBad) firstBad.focus();
  return firstBad === null;
}

// Clear a field's error as soon as the user fixes it
var checkedFields = document.querySelectorAll('[data-error]');
for (var c = 0; c < checkedFields.length; c++) {
  checkedFields[c].addEventListener('input', function () {
    if (this.getAttribute('aria-invalid') === 'true' && this.checkValidity()) setError(this, '');
  });
}

// Remembers the last request in this browser. try/catch because
// some browsers block storage on file:// pages.
function saveLastRequest(data) {
  try { localStorage.setItem(LAST_REF, JSON.stringify(data)); } catch (err) { /* not saved */ }
}
function loadLastRequest() {
  try { return JSON.parse(localStorage.getItem(LAST_REF) || 'null'); } catch (err) { return null; }
}

// ---------- Tools catalog: search, category and type filters ----------
var catalog = document.getElementById('catalog');
if (catalog) {
  var searchBox = document.getElementById('f-q');
  var categorySelect = document.getElementById('f-cat');
  var itemRows = catalog.querySelectorAll('tbody tr[data-name]');
  var emptyRow = document.getElementById('catalog-empty');
  var countText = document.getElementById('catalog-count');

  // The header search box sends ?q=... here
  if (params.get('q')) searchBox.value = params.get('q');

  // Hide every row that doesn't match all three filters
  function applyFilters() {
    var term = searchBox.value.trim().toLowerCase();
    var type = document.querySelector('input[name="type"]:checked').value;
    var shown = 0;
    for (var i = 0; i < itemRows.length; i++) {
      var row = itemRows[i];
      var matches = row.dataset.name.indexOf(term) !== -1 &&
                    (categorySelect.value === '' || row.dataset.cat === categorySelect.value) &&
                    (type === 'all' || row.dataset.type === type);
      row.hidden = !matches;
      if (matches) shown++;
    }
    emptyRow.hidden = shown > 0;
    countText.textContent = 'Showing ' + shown + ' of ' + itemRows.length + ' items';
  }

  document.getElementById('f-form').addEventListener('input', applyFilters);
  document.getElementById('f-form').addEventListener('change', applyFilters);
  document.getElementById('f-form').addEventListener('submit', function (e) { e.preventDefault(); applyFilters(); });
  document.getElementById('catalog-clear').addEventListener('click', function () {
    searchBox.value = '';
    categorySelect.value = '';
    document.getElementById('t-all').checked = true;
    applyFilters();
    searchBox.focus();
  });
  applyFilters();
}

// ---------- Reserve: validation and the reference number ----------
var reserveForm = document.getElementById('reserve-form');
if (reserveForm) {
  var itemSelect = document.getElementById('r-item');
  var qtyInput = document.getElementById('r-qty');
  var pickupInput = document.getElementById('r-pickup');
  var returnInput = document.getElementById('r-return');
  var reserveDone = document.getElementById('reserve-done');

  pickupInput.min = today();
  returnInput.min = today();
  if (params.get('item')) itemSelect.value = params.get('item');

  function selectedOption() {
    return itemSelect.options[itemSelect.selectedIndex];
  }

  // When the item changes: set the max quantity, and switch off the
  // return date for consumables (they are used up, not returned)
  function syncItem() {
    var option = selectedOption();
    var isConsumable = option.dataset.type === 'consumable';
    qtyInput.max = option.dataset.available || 1;
    document.getElementById('r-qty-hint').textContent = itemSelect.value
      ? option.dataset.available + ' available now.'
      : 'Choose an item to see how many are available.';
    returnInput.disabled = isConsumable;
    returnInput.required = !isConsumable;
    if (isConsumable) { returnInput.value = ''; setError(returnInput, ''); }
    document.getElementById('r-return-hint').textContent = isConsumable
      ? 'Consumables are used up, so there is no return date.'
      : 'Tools come back by this date.';
  }
  itemSelect.addEventListener('change', syncItem);
  pickupInput.addEventListener('change', function () { returnInput.min = pickupInput.value || today(); });
  syncItem();

  reserveForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = validateForm(reserveForm, function (field) {
      if (field === qtyInput && Number(qtyInput.value) > Number(qtyInput.max)) return 'Only ' + qtyInput.max + ' available now. Lower the quantity.';
      if (field === pickupInput && pickupInput.value < today()) return 'Choose a pickup date from today on.';
      if (field === returnInput && returnInput.value && returnInput.value < pickupInput.value) return 'The return date must be on or after the pickup date.';
      return '';
    });
    if (!ok) return;

    // Preview only: a random number in the HYG-YYYY-NNNN format (the database assigns the real one)
    var ref = 'HYG-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    var itemName = selectedOption().textContent.trim();
    saveLastRequest({ ref: ref, item: itemName + ', quantity ' + qtyInput.value });

    document.getElementById('done-ref').textContent = ref;
    document.getElementById('done-item').textContent = itemName + ', quantity ' + qtyInput.value;
    document.getElementById('done-track').href = 'track.html?ref=' + encodeURIComponent(ref);
    reserveForm.hidden = true;
    reserveDone.hidden = false;
    reserveDone.focus();
  });

  document.getElementById('reserve-again').addEventListener('click', function () {
    reserveForm.reset();
    syncItem();
    reserveDone.hidden = true;
    reserveForm.hidden = false;
    document.getElementById('r-name').focus();
  });
}

// ---------- Track: three example states, plus the request made in this browser ----------
var trackForm = document.getElementById('track-form');
if (trackForm) {
  var refInput = document.getElementById('t-ref');
  var trackResult = document.getElementById('track-result');
  var EXAMPLES = {
    'HYG-2026-0142': { state: 'pending', item: 'Digital multimeter, quantity 1', next: 'Waiting for an officer. Check again before your pickup date.' },
    'HYG-2026-0139': { state: 'approved', item: 'Soldering station, quantity 1', next: 'Approved. Collect it from the officers on your pickup date.' },
    'HYG-2026-0131': { state: 'declined', item: 'Cordless drill, quantity 1', next: 'Declined: none left on that pickup date. Try another date or item.' }
  };

  function lookUp() {
    refInput.value = refInput.value.trim().toUpperCase();
    if (!validateForm(trackForm)) { trackResult.hidden = true; return; }

    var found = EXAMPLES[refInput.value];
    var last = loadLastRequest();
    if (!found && last && last.ref === refInput.value) {
      found = { state: 'pending', item: last.item, next: 'Waiting for an officer. This preview never sends it, so it stays pending.' };
    }

    trackResult.hidden = false;
    document.getElementById('tr-ref').textContent = refInput.value;
    if (found) {
      document.getElementById('tr-status').innerHTML = statusHtml(found.state);
      document.getElementById('tr-item').textContent = found.item;
      document.getElementById('tr-next').textContent = found.next;
    } else {
      document.getElementById('tr-status').innerHTML = '';
      document.getElementById('tr-item').textContent = '';
      document.getElementById('tr-next').textContent = 'No request has that number in this preview. Check the number on your confirmation, or try one of the examples.';
    }
  }

  trackForm.addEventListener('submit', function (e) { e.preventDefault(); lookUp(); });
  if (params.get('ref')) { refInput.value = params.get('ref'); lookUp(); }
}

// ---------- Join ----------
var joinForm = document.getElementById('join-form');
if (joinForm) {
  joinForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = document.getElementById('join-status');
    if (!validateForm(joinForm)) { status.textContent = ''; return; }
    status.textContent = 'Every field checks out. This is a preview, so nothing was sent; on the live site the application goes to the officers.';
  });
}

// ---------- Officer: sign-in, then approve or decline ----------
var loginForm = document.getElementById('login-form');
if (loginForm) {
  var dashboard = document.getElementById('dashboard');
  var liveMessage = document.getElementById('dash-live');

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm(loginForm)) return;
    document.getElementById('login').hidden = true;
    dashboard.classList.add('is-open');
    document.getElementById('dash-title').focus();
  });

  document.getElementById('sign-out').addEventListener('click', function () {
    dashboard.classList.remove('is-open');
    document.getElementById('login').hidden = false;
    loginForm.reset();
    document.getElementById('o-email').focus();
  });

  // Update the pending count and show the empty message when none are left
  function recount() {
    var pending = document.querySelectorAll('#pending-table tbody tr[data-state="pending"]').length;
    document.getElementById('fig-pending').textContent = pending;
    document.getElementById('pending-empty').hidden = pending > 0;
  }

  // One click handler for Approve, Decline and Undo on every row
  document.getElementById('pending-table').addEventListener('click', function (e) {
    var button = e.target.closest('button[data-act]');
    if (!button) return;
    var row = button.closest('tr');
    var ref = row.dataset.ref;
    var state = button.dataset.act === 'undo' ? 'pending' : button.dataset.act;

    row.dataset.state = state;
    row.querySelector('.cell-status').innerHTML = statusHtml(state);
    var actCell = row.querySelector('.cell-act');
    if (state === 'pending') {
      actCell.innerHTML = '<div class="actions"><button class="btn btn--sm btn--primary" type="button" data-act="approved">Approve</button>' +
        '<button class="btn btn--sm" type="button" data-act="declined">Decline</button></div>';
      liveMessage.textContent = ref + ' is pending again.';
    } else {
      actCell.innerHTML = '<button class="btn btn--sm" type="button" data-act="undo">Undo</button>';
      liveMessage.textContent = ref + ' ' + LABELS[state].toLowerCase() + '. Undo is next to it.';
    }
    actCell.querySelector('button').focus();
    recount();
  });
  recount();
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

// Stops typed text from being read as HTML (same job as PHP's htmlspecialchars)
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Builds one post row for a list (news.html, the home strip, "More posts").
// The list photo has empty alt because the title right after it says the same.
function postCard(post) {
  var link = 'article.html?id=' + post.id;
  var cover = post.cover
    ? '<div class="frame"><img src="' + escapeHtml(post.cover) + '" alt="" loading="lazy"></div>'
    : '<div class="post__slot">Photo to come</div>';
  return '<article class="post">' + cover +
    '<div class="stack--tight">' +
    '<p class="post__meta"><span class="kind">' + escapeHtml(post.category) + '</span><time datetime="' + post.date + '">' + longDate(post.date) + '</time></p>' +
    '<h3><a href="' + link + '">' + escapeHtml(post.title) + '</a></h3>' +
    '<p>' + escapeHtml(summaryOf(post)) + '</p>' +
    '<a class="more" href="' + link + '">Read more<span class="visually-hidden">: ' + escapeHtml(post.title) + '</span></a>' +
    '</div></article>';
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
    newsList.hidden = shown === 0;
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
    var html = '<p class="post__meta"><span class="kind">' + escapeHtml(post.category) + '</span>' +
      '<time datetime="' + post.date + '">' + longDate(post.date) + '</time>' +
      (post.sample ? '<span>Sample article</span>' : '') + '</p>' +
      '<h1 id="article-title">' + escapeHtml(post.title) + '</h1>' +
      '<p class="lead">' + escapeHtml(summaryOf(post)) + '</p>';
    if (post.cover) {
      html += '<figure class="photo"><div class="frame frame--wide"><img src="' + escapeHtml(post.cover) + '" alt="' + escapeHtml(post.coverAlt || '') + '"></div></figure>';
    }

    // Paragraphs, with any inline photo placed after paragraph number "after"
    var paras = toParagraphs(post.body);
    var photos = post.photos || [];
    html += '<div class="article__body">';
    for (var p = 0; p < paras.length; p++) {
      html += '<p>' + escapeHtml(paras[p]) + '</p>';
      for (var ph = 0; ph < photos.length; ph++) {
        if (photos[ph].after === p + 1) {
          html += '<figure class="photo"><div class="frame"><img src="' + escapeHtml(photos[ph].src) + '" alt="' + escapeHtml(photos[ph].alt) + '" loading="lazy"></div>' +
            '<figcaption class="caption">' + escapeHtml(photos[ph].caption) + '</figcaption></figure>';
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
  var moreHtml = '';
  var moreCount = 0;
  for (var m = 0; m < published.length && moreCount < 3; m++) {
    if (published[m] !== post) {
      moreHtml += postCard(published[m]);
      moreCount++;
    }
  }
  document.getElementById('more-posts').innerHTML = moreHtml;
}

// ---------- Officer: Posts list and the New post form ----------
var postForm = document.getElementById('post-form');
if (postForm) {
  var postRows = document.getElementById('post-rows');
  var postStatus = document.getElementById('post-status');
  var coverInput = document.getElementById('np-cover');
  var altInput = document.getElementById('np-alt');
  var previewBox = document.getElementById('np-preview-box');
  var previewImg = document.getElementById('np-preview');
  var MAX_PHOTO = 2 * 1024 * 1024;           // 2 MB, the same limit PHP would check
  var PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  var coverData = '';                        // the chosen photo as a data URL
  var coverError = '';                       // message when the photo is wrong
  var editingId = null;                      // id of the post being edited, or null for a new one
  var publishClicked = true;                 // which submit button was pressed

  // Status word plus icon for each post state
  function postStatusHtml(state) {
    return state === 'published'
      ? '<span class="status status--approved">' + ICONS.approved + 'Published</span>'
      : '<span class="status status--pending">' + ICONS.pending + 'Draft</span>';
  }

  // Fills the officer table, drafts included, newest first
  function renderPostRows() {
    var posts = sortNewest(getPosts());
    var html = '';
    var live = 0;
    for (var i = 0; i < posts.length; i++) {
      var p = posts[i];
      var isLive = p.status === 'published';
      if (isLive) live++;
      html += '<tr><td class="item">' + escapeHtml(p.title) + '</td>' +
        '<td data-label="Category">' + escapeHtml(p.category) + '</td>' +
        '<td class="num" data-label="Date">' + p.date + '</td>' +
        '<td data-label="Status">' + postStatusHtml(p.status) + '</td>' +
        '<td class="act"><div class="actions">' +
        '<button class="btn btn--sm" type="button" data-post-edit="' + p.id + '" aria-label="Edit ' + escapeHtml(p.title) + '">Edit</button>' +
        '<button class="btn btn--sm" type="button" data-post-toggle="' + p.id + '" aria-label="' + (isLive ? 'Unpublish ' : 'Publish ') + escapeHtml(p.title) + '">' + (isLive ? 'Unpublish' : 'Publish') + '</button>' +
        '</div></td></tr>';
    }
    if (posts.length === 0) html = '<tr class="row-empty"><td colspan="5">No posts yet. Write the first one below.</td></tr>';
    postRows.innerHTML = html;
    document.getElementById('fig-posts').textContent = live;
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
    if (!file) { showPreview(''); setError(coverInput, ''); return; }

    if (PHOTO_TYPES.indexOf(file.type) === -1) {
      coverError = 'That file is not a JPG, PNG or WebP photo.';
    } else if (file.size > MAX_PHOTO) {
      coverError = 'That photo is ' + (file.size / 1048576).toFixed(1) + ' MB. Use one under 2 MB.';
    }
    setError(coverInput, coverError);
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
    document.getElementById('np-date').value = today();
    document.getElementById('post-form-title').textContent = 'New post';
    document.getElementById('np-cancel').hidden = true;
    document.getElementById('np-form-error').textContent = '';
    var fields = postForm.querySelectorAll('[data-error]');
    for (var i = 0; i < fields.length; i++) setError(fields[i], '');
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
    document.getElementById('np-form-error').textContent = '';
    var ok = validateForm(postForm, function (field) {
      if (field === coverInput) return coverError;
      if (field === altInput && coverData && altInput.value.trim() === '') return 'Describe the photo in a few words, for screen readers.';
      return '';
    });
    if (!ok) return;

    var f = postForm.elements;
    var posts = getPosts();
    var post = editingId === null ? null : findPost(editingId, posts);
    var verb = post ? 'Saved changes to' : 'Published';
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
      document.getElementById('np-form-error').textContent = 'This browser would not save the post. The photo may be too big for browser storage: try a smaller one, or remove it.';
      return;
    }

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

  document.getElementById('np-date').value = today();
  renderPostRows();
}

// ---------- Join: applications open or closed ----------
// Recruitment is seasonal. The real site reads this from an officer setting;
// here join.html?season=closed previews the closed state.
var appsOpenLine = document.getElementById('apps-open');
if (appsOpenLine) {
  var applicationsOpen = params.get('season') !== 'closed';
  appsOpenLine.hidden = !applicationsOpen;
  document.getElementById('apps-closed').hidden = applicationsOpen;
  document.getElementById('apply').hidden = !applicationsOpen;
}
