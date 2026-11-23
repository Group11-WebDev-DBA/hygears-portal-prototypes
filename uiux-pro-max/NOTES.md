# Pit Board (built with the ui-ux-pro-max skill)

Open `index.html` by double-clicking. There's no build step and no server.

## The idea that makes it memorable
**Every number is a pit-board sign.** At the Shell Eco-marathon, crews hold up boards with big numbers for the driver. Here, every number a visitor cares about sits on the same dark plate in big mono type:
- stock on Home and Tools ("2 / of 3 left")
- the reference number after reserving
- the result on Track Request
- the counters on the Officer desk

Around it is neubrutalism: hard black borders, hard offset shadows, square corners, heavy uppercase headings, and buttons that look pressed when you tap them.

## Style source (ui-ux-pro-max data)
- **Style:** `neubrutalism` from `styles.csv` (hard 2-3px borders, 4px offset shadows, flat colour, bold type, low accessibility risk, low performance cost). I kept its structure and swapped its pop colours for the Hygears brand.
- **Not used:** the `--design-system` run suggested a purple "Minimalism" palette and Crimson Pro / Atkinson. That's off-brand and close to the other directions, so I dropped it.
- **Fonts:** Space Grotesk comes from the skill's "Kinetic Brutalism" pairing and Space Mono from its "Brutalist Raw" pairing.
- **Guidelines applied (UX data):** errors next to their field plus a focusable error summary, checking on blur, a loading-then-result state on submit, tables reflowing into cards on phones, 44px or larger tap targets, and visible focus.

## Palette (brief update 2026-11-23)
| Role | Hex | Where |
|---|---|---|
| Primary / action | `#D7261E` | Buttons and the current-page bar only. White text on it is 5.0:1 |
| Action hover, error text | `#B51E17` | Hover, field errors with a "!" badge |
| Text, borders, shadows | `#14161A` | Everything structural |
| Secondary text | `#5B6270` | Hints and labels: 6.1:1 on white, 5.6:1 on gray |
| Page, cards, inputs | `#FFFFFF` | |
| Sections, quiet fills | `#F4F5F7` | Page heads, alternate bands, Pending tag |
| Dividers | `#D5D8DE` | Plate top edge, light rules |
| Footer, plates | `#1B1D22` | Charcoal with white text, 16:1 |

There's no cream, amber or orange anywhere except inside the logo image. Status is never shown by colour alone: every status has an icon and a word, plus a different fill or border style (Pending gray, Approved solid black, Declined dashed).

## Fonts (two)
- **Space Grotesk** 400/500/700 for headings and body. Body is 16px at 1.55. h1 is 2.25 / 3 / 4rem and h2 is 1.625 / 2 / 2.25rem at phone / 640px / 992px. h3 is 1.25rem. All are set as variables in `:root`.
- **Space Mono** for numbers only: plates, reference numbers and small labels.
- Both load from Google Fonts. Offline they fall back to Segoe UI / Arial and Consolas.

## Files
- **Pages:** `index.html`, `tools.html`, `reserve.html`, `track.html`, `join.html`, `about.html`, `officer.html`.
- **One `style.css`:** 16 numbered, commented sections. Hex variables, Flexbox and simple Grid, media queries at 640, 768 and 992px.
- **One `app.js`:** plain functions and event listeners, one commented section per page.
- **Shared header and footer:** the same block on every page, ready to become `header.php` and `footer.php`. The current page uses `aria-current="page"` (red bar), and Reserve marks Tools.

## States in app.js
- **Tools:** search, category chips, a Tools/Consumables switch and "Available now only", with a live count and an empty state.
- **Reserve:**
  - The item comes pre-picked from `?item=`.
  - The quantity is limited to the stock.
  - Consumables hide the return date.
  - Dates are checked: pickup isn't in the past, and return is on or after pickup.
  - An error summary lists problems, then a "Sending..." state.
  - Success shows a plate with a new `HYG-<year>-0143...` number (saved in localStorage) and a Track link.
- **Track:** three sample references, one per state (0137 Pending, 0142 Approved, 0129 Declined). Numbers made on this phone show as Pending. Unknown numbers get an error under the field.
- **Join:** the same validation, then a success message with the applicant's name and email.
- **Officer:** a sample login, then the desk. Approve, Decline, Mark returned and Mark reviewed each have Undo, and the counters update. Tables turn into cards on phones.

## What still needs real material
- Item photos (dashed photo slots now) and the real item list with stock counts.
- Announcement dates and pubmats (marked "Date to confirm").
- The final borrowing rules (marked as a draft) and office hours.
- The white HG mark for the charcoal footer. Only the red version is in `../assets/`.
- Confirmation that PUP student numbers look like `2024-12345-MN-0`.
- Real officer accounts. The prototype login accepts anything.
