# Feature: News / articles (added 2026-11-24)

Why: Ralph pointed out that membership applications and merch are seasonal (they can't recruit or sell all year), but Hygears posts all the time about competitions, progress reports and workshops. So the portal gets a News section with long articles, and officers can publish posts from the site itself without editing code. Red + white stays (the org's execs confirmed red/white for now).

## Pages to add or change (in every direction, in its own look)
1. **`news.html`, the list of posts.** Newest first, with a category filter: Competition, Progress report, Workshop, Announcement, Recruitment. Each post shows a cover photo slot, category, date, title, a 1–2 line summary and "Read more". Phones get one column.
2. **`article.html`, one post.** A news-article layout: category and date, title, cover photo, then long paragraphs with 1–2 inline photos and captions, written by whom (the caption writer, as their posts credit). Readable at 60–80 characters per line, 16–18px body, good line height. A "Back to News" link, plus 2–3 "More posts" at the end. One sample article is enough, and `article.html?id=N` can switch between the samples with JS.
3. **Home:** add a "Latest from Hygears" strip with the 3 newest posts. Join and merch become secondary: Join shows an "Applications open / closed" state (closed outside recruitment season, with a "Follow us for the next ASCEND" line), and merch stays a small section or moves under About.
4. **Officer dashboard:** add a **Posts** section with:
   - a list of posts with Edit / Unpublish
   - a **New post** form: title, category select, date, cover photo (file input with an image preview using FileReader), summary, body (textarea; blank lines become paragraphs), caption writer, Save draft / Publish
   - on Publish, the post shows at the top of the officer list and the page says it would appear on News (prototype: nothing is saved; keep it in memory or localStorage so news.html shows it after publishing in the same browser)
   - validation: title and body required, image type and size check, clear errors
5. **Nav:** add News to every page's header, highlighted on news.html and article.html.

## Sample posts (real events from their Facebook page; text marked as sample)
- PHYNIX 2026: PUP Hygears Research Workshop (Workshop). Their tagline for it: "Nex-thinkers, N-explorers, Nex-creators".
- General Assembly: "The Force Awakens: Refining Our Legacy" (Announcement), where members are called "Merakis".
- ASCEND 2026 recruitment: meet the five committees (Recruitment).
- A PUP student is a finalist in the 1st National SOLIDWORKS Mechanical Design Challenge 2026 (Competition). Don't name the student; say "a PUP student".
- Luna team progress report (Progress report): no real details are known, so write it as a clearly marked sample.
Article body text is sample text written from these facts; never invent results, numbers or quotes. Mark it "Sample article".

## How it maps to the real build (for NOTES.md)
`posts` table: post_id, title, category, summary, body, cover_image (file name), caption_by, status (draft/published), published_at, created_by (officer). Images go in an `uploads/` folder. news.html = SELECT the published posts ORDER BY published_at DESC. The officer form = INSERT/UPDATE with PHP, using prepared statements.

## Rules
The same BRIEF rules apply: one style.css, class-level code (plain HTML/CSS/vanilla JS with comments), [hidden]{display:none !important}, mobile first, tap targets of 44px or more, no sideways scroll at 360px, accessible forms, the direction's own identity.
