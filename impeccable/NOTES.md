# Impeccable: "Shadow Board"

Open `index.html` by double-clicking. No server, no build step.

## The one idea
**The catalog is a workshop shadow board.** A gray pegboard panel where every tool is painted as a black silhouette with a white label plate under it. Peg dots show units in and out ("2 of 3 units available"). When every unit is borrowed, only a dashed outline is left on the board, the way a real shadow board shows a missing tool. The same board is the home page hero, the tools page, the strip at the top of the reserve form, and the stock section of the officer desk. When a reservation goes through, the silhouette lifts off the board and leaves its outline behind (the one animation, switched off for reduced-motion users).

This is a different look from the other directions: ink is a cream reservation slip, almanac is a ruled serif ledger, and taste is a photo-led site with tickets. This one is white and gray with black silhouettes, and the stock display itself is the design.

## Palette (per the 2026-11-23 brief update)
| Role | Hex | Use |
|---|---|---|
| Page | `#FFFFFF` | background, label plates, inputs |
| Board / sections | `#F4F5F7` | tool board, sample flags, hovers |
| Text | `#14161A` | all text, silhouettes, filled pegs (17:1 on white) |
| Secondary text | `#5B6270` | hints, meta (6.2:1 on white, 5.7:1 on gray) |
| Lines | `#DDE0E5` / `#8A909B` | hairlines / input borders and empty pegs |
| Action red | `#D7261E`, hover `#B51E17` | buttons, current-page bar, required stars, errors only. White on red is 5.0:1 |
| Charcoal | `#1B1D22` | footer and the join band on home |
| Status | green `#1D6B35` on `#E3F1E6`, red `#B51E17` on `#FBE6E4`, near-black on `#E6E8EC` | Approved / Declined, Overdue / Pending, always icon plus word |

No cream, beige, amber or orange anywhere outside the logo image.

## Fonts
One family: **Archivo** (Google Fonts). Headings use `font-stretch: 75%` (its narrow width), weight 800, uppercase, like workshop signage. Body is regular width, 16px at 1.55 line height. h1 is 36px on phones and 64px on laptops, h2 is 26px / 40px, h3 is 20px, the same on every page. Offline, it falls back to Segoe UI or Arial.

## Files
`index.html`, `tools.html`, `reserve.html`, `track.html`, `join.html`, `about.html`, `officer.html`, plus one `style.css`, one `app.js` and `img/`, which holds compressed copies of the org photos and the logo. The header and footer are identical on every page, so they map to `header.php` and `footer.php`.

## States in app.js
- Tools: search, category filter and a Tools/Consumables switch, with a live count. Out-of-stock items show a dashed slot and a disabled "None left" button.
- Reserve: the item is preselected from `?item=`. Errors show under each field plus a summary at the top. It checks the student number format, quantity against stock, return date not before pickup, and hides the return date for consumables. Success shows a `HYG-2026-01xx` reference saved in localStorage, so Track finds it. "Remember my details" prefills the next form.
- Track: three samples (0137 Pending, 0142 Approved, 0129 Declined), plus any request made in this browser. Unknown numbers get an error.
- Join: validation, five committee choices, success message.
- Officer: sign-in (any value in the prototype), jump links, approve/decline, mark returned, mark reviewed. Each action updates the count and is announced.

## Needs real material
- The current HG mark (flame-gradient version) and a **white HG mark** for the dark footer. Only the old red PNG exists.
- The real inventory: item names, counts and categories. Optional item photos, though the silhouettes can stay as the photo slot.
- Announcement dates and pubmat images (the slots are marked).
- The borrowing rules (marked as a draft on About and Reserve).
- Competition results and milestones for About (marked slot).
- Officer accounts. The prototype login accepts anything.

## Process note
The impeccable skill's launcher scripts were not run (safety rule). Its written guidance was followed by hand: mode, a world taken from the audience's own workshop, craft floor, and a critique pass in QA.md.
