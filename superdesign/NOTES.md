# Charge (superdesign)

Built from the superdesign skill's written guidance only: its Brand New Project SOP (write a design system first, then design strictly inside it), the logo invariant (the real HG mark goes in every logo spot) and the shared header/footer component rule. Its CLI and the superdesign.dev service were not used. The system it produced is `design-system.md`. Where the skill and the professor's rules disagree, the professor wins.

Open `index.html` by double-clicking. No build step, no server.

## Pages
`index.html`, `news.html`, `article.html`, `tools.html`, `reserve.html`, `track.html`, `join.html`, `about.html`, `officer.html`. All of them share one `style.css` and one `app.js`, and they have the same header and footer. `aria-current` plus a red bar marks the current page, and Reserve lights up Tools.

## The one idea
**Stock shown as battery charge.** Hygears builds electric cars, so every "how many are in" is a small battery: one cell per unit, filled cells are on the shelf, empty cells are borrowed. The count is always written next to it ("2 of 3 available"), so shape and colour never carry the meaning alone. The same cells appear on Home, the catalog, the Reserve summary, the officer stock list, the "How borrowing works" steps and the Track progress bar.

## Palette (brief update 2026-11-23)
White #FFFFFF, cool gray #F4F5F7, lines #D5D8DE, near-black text #14161A, muted text #5B6270 (6.1:1). Hygears red #D7261E is used for buttons and the current-page bar only (hover #B51E17). Charcoal #1B1D22 is used for the hero and footer bands. No cream, orange or amber.

## Fonts
Barlow Semi Condensed 700 for headings, Barlow 400/600 for body. They load from Google Fonts with an Arial fallback, so the pages still work offline.

## For the PHP rebuild
- The header and footer blocks are commented as `header.php` / `footer.php`.
- Item cards are one repeated `<li class="item">` with `data-name/category/type/available`, ready for a PHP loop. The battery is one `<i>` per unit, with `class="on"` when it's in.
- The sample data in `app.js`: the reference number (use the MySQL insert ID), the three Track samples, and the officer login (use `password_verify`).

## News (added 2026-11-24, see `../FEATURE-NEWS.md`)
- `news.html`: posts newest first, filtered with the same type switch as Tools (`news.html?cat=Workshop` opens filtered). `article.html?id=N`: one post in an 18px reading column, inline photos with captions, "Caption by", Back to News and More posts. Home has "Latest from Hygears" (the 3 newest). Join shows Applications open / closed (`APPLICATIONS_OPEN` in app.js; `join.html?applications=closed` previews closed).
- Officer desk: a Posts table (Edit / Unpublish) and the New post form (cover photo preview through FileReader, JPG/PNG/WebP up to 2 MB, Publish / Save draft).
- Try it: sign in on `officer.html`, write a post, Publish, then open `news.html` in the same browser. Posts are kept in localStorage under `hygears-charge-posts` (clear it to get the samples back). The five sample posts are written only from facts on the Facebook page and are marked Sample.

### Posts table for the PHP rebuild
- `posts`: `post_id` (INT AUTO_INCREMENT, primary key), `title`, `category` (Competition / Progress report / Workshop / Announcement / Recruitment), `summary`, `body` (TEXT; blank lines become paragraphs), `cover_image` (file name), `cover_alt`, `caption_by`, `status` ('draft' / 'published'), `published_at` (DATE), `created_by` (the officer's id).
- The form's input names already match those columns. The real form uses `method="post" enctype="multipart/form-data"`; PHP checks the type and size again, moves the file into `uploads/` and stores only the file name. INSERT for a new post, `UPDATE ... WHERE post_id = ?` for Edit, `UPDATE posts SET status = ?` for Unpublish, all with prepared statements.
- `news.html` = `SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC` (add `AND category = ?` for a filter, `LIMIT 3` for Home). `article.html` = `... WHERE post_id = ? AND status = 'published'`.
- The article's inline photos are sample-only here. The real build can keep them in a `post_photos` table (`photo_id`, `post_id`, `file_name`, `alt`, `caption`) or leave them out.

## Still needs real material
- Real text, dates and photos for the five sample posts, and the real recruitment season for the Join switch.
- Item photos (the "Photo slot" boxes) and the real inventory and counts. Everything shown is labelled sample data.
- Announcement dates and venues, and the pubmat images (marked as slots).
- Final borrowing rules (marked Draft on About), the workshop room and pickup hours, and whether a PUP ID is needed at pickup.

See `QA.md` for the visitor run-through and the fixes made.
