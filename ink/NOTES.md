# Ink: the lending desk

**The idea that makes it memorable:** the reservation slip. A ruled gray well with a near-black top edge and the reference number in mono (`HYG-2026-0142`) shows up on every page that does something: the reservation counter in the home hero, the reserve success on Tools, the result on Track request, the application on Join and the sign-in on the Officer desk. Everything else is a plain catalogue printed in black on white, with hairline rules and one red that means "act here".

Open `index.html` by double-clicking. No build step, no server.

## Update 2026-11-23
- **Palette** moved off cream and amber to the classic Hygears red and white (see below). The slip's amber edge is now near-black.
- **Code** flattened so the group can rebuild it from class: `tokens.css` and `base.css` are gone, everything is in one commented `style.css` with hex variables, Flexbox, simple Grid and mobile-first `min-width` media queries. No oklch, clamp(), :has(), svh or lh units. `app.js` is plain functions, `for` loops and event listeners. The Hallmark stamp comments and the `hallmarkSlots` photo script were removed.
- `[hidden] { display: none !important; }` is at the top of the stylesheet.
- QA run and fixes: see `QA.md`.

## Palette

| Role | Value | Where |
|---|---|---|
| Background | white `#FFFFFF` | every page |
| Bands and slips | cool gray `#F4F5F7`, tags `#E8EAEE`, rules `#D9DCE1` | section bands, the slip, current nav item |
| Text | near-black `#14161A` | headings and body (18:1) |
| Secondary | `#5B6270` | hints, captions (6.1:1 on white, 5.6:1 on gray) |
| **Accent** | Hygears red `#D7261E`, hover `#B51E17` | filled buttons, focus ring, current-page underline only (white text 5.0:1) |
| Footer band | charcoal `#1B1D22` | footer, white text |
| Errors | `#B51E17` | error messages, always with words |

Status never relies on colour: every tag has a word and an icon (Available, None left, Pending, Approved, Declined).

## Fonts
- **Epilogue** 700 for headings, 400/600 for body (Google Fonts, falls back to Arial offline).
- **IBM Plex Mono** only for reference numbers, student numbers and stock counts.
- One scale on every page: h1 36px phone / 48px laptop, h2 28 / 36, h3 20 / 24. Body 16px at 1.55.

## Pages
`index.html`, `tools.html` (catalogue with search, category and type filters, plus the Reserve form), `track.html`, `join.html`, `about.html`, `officer.html`. One `style.css`, one `app.js`. Header and footer are identical on every page (ready to become `header.php` and `footer.php`), and the current page is marked in the nav.

States built in `app.js`:
- **Tools:** live filter with a "no match" state. Reserve on a row picks the item and jumps to the form. Messages on every field. Consumables switch off the return date. Success shows a slip with a reference number, saved in this browser so Track request finds it.
- **Track:** Pending, Approved and Declined samples (`HYG-2026-0142`, `0137`, `0129`), a wrong-format error and a not-found state.
- **Join:** validation and the preferred committee select.
- **Officer:** a sign-in card (any email and password, marked as prototype). Counts link to their tables. Approve, decline, accept and mark returned all have Undo, and each table shows an empty state when nothing is left. Days late are counted from today.

Every success state says plainly that the prototype sent nothing.

## Still needs real material
1. **Current logo.** `../assets/hygears-logo.png` is the older red mark. A white version of the mark would suit the charcoal footer.
2. **Item photos.** 12 dashed "Photo to come" boxes on Tools (72px squares). Replace each with a plain `<img>`.
3. **The real inventory.** Item names, categories and counts are sample.
4. **Pickup room.** Track request has a dashed slot reading "pickup room to be confirmed".
5. **Borrowing rules.** About shows draft rules for the officers to confirm.
6. **Announcements.** The three notices on Home are sample.
7. **Fonts offline.** Self-host the woff2 files if the demo might be offline.
