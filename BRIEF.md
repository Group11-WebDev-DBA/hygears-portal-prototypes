# Hygears Web Portal: prototype brief

Shared brief for three design directions of the same site. Each direction lives in its own folder here (`ink/`, `almanac/`, `taste/`) and covers the same pages with the same content, so the choice is between looks, not features. These are prototypes to pick a direction. The real site will be PHP + MySQL later, so build plain static HTML + CSS (+ a little vanilla JS for states). No frameworks, no build step, no CDN for core styles. Everything must open by double-clicking the .html file.


## UPDATE 2026-11-23 (overrides the brand colours above)
**Palette: no cream, no orange-on-cream.** Cream backgrounds with orange/terracotta read as "Claude" (and the group's GitHub org is also orange). Use the org's classic identity instead:
- Backgrounds: plain white `#FFFFFF` and a cool light gray `#F4F5F7` for sections/cards. No cream, no beige, no warm paper tints.
- Text: near-black `#14161A`; secondary text cool gray `#5B6270` (check 4.5:1).
- Primary: Hygears red `#D7261E` (buttons, current-page marker, key actions only). Hover `#B51E17`.
- Optional dark band (footer or hero): charcoal `#1B1D22` with white text and the white HG mark.
- No amber/orange anywhere except inside the logo image.

**Copyable by students.** The group must be able to rebuild this themselves using only what the class taught (HTML, CSS, a little JavaScript, PHP, MySQL). So:
- Plain semantic HTML, one style.css with CSS variables, Flexbox and simple Grid, media queries. Avoid advanced CSS (oklch/color-mix, container queries, :has(), complex clamp() math, scroll-driven animation, view transitions). Plain hex colours, rem/px/%.
- Plain vanilla JS with simple functions and event listeners. No modules, no frameworks, no build step.
- Short comments in the CSS and JS explaining each section, so a student can follow it.
- Clean, calm, professional: lots of white space, clear hierarchy. Not a template look, but nothing a student couldn't explain at the defense.

## Read also
- `BRAND.md` (researched from their Facebook page): what stays constant (the HG mark, red/white, the sign-off "Engineering Innovation • Research • Technology • Leadership", #GEARINGUpTowardExcellence) and their tone.
- `QA-PROTOCOL.md`: every direction gets role-played visits after building.
- **Mobile first.** Most students will open this on a phone. Design and check at 390 x 844 first, then 1280 x 800. Tap targets at least 44px, no horizontal scroll at 360px, forms comfortable with one thumb, tables must reflow into cards or rows on phones (the officer dashboard too).

## The client (real facts only)
- **PUP Hygears**: a student research organization at the Polytechnic University of the Philippines (PUP), Sta. Mesa, Manila.
- Builds energy-efficient electric vehicles (the **Luna** series) and competes in the **Shell Eco-marathon** (an energy-efficiency competition, not a race).
- Their own words: "The PUP Hygears is an organization that aims to further enhance the awareness of the PUP Students in the field of research and help produce well-trained and competent students through real-life training in innovation and production of a highly efficient vehicle..."
- Tagline: "We don't just build vehicles, we build people to help us build the future!"
- Members come from Mechanical, Electronics and Communications, Industrial, Electrical and Computer Engineering (and Marketing).
- Contact: Instagram `puphygears`, Facebook `PUPHygears`, email `puphygears@gmail.com`, X `@pup_hygears`.
- **Brand (current, from their 2026 Facebook page; this replaces the old site's maroon):** fiery orange to red with amber/gold highlights, on warm cream. Approximate values: orange `#F26A1B`, red `#D7261E`, amber `#F5A623`, cream `#FFF4E2`, deep warm brown-black for text `#2A140C`. The logo is the "HG" gear mark (`../assets/hygears-logo.png` is the older red version; the current one is the same mark in an orange-red flame gradient). Hashtag they use: `#GEARINGUpTowardExcellence`. Their posts are bold and warm (heavy display type, orange/red on cream), so the site should feel energetic but stay readable and professional. Pick ONE of orange/red as the primary and use the other warm tones sparingly; check contrast (orange on cream often fails 4.5:1 for small text, so use the dark brown for text).
- **Committees (from their 2026 recruitment posts, use in the Join form as a "preferred committee" choice):** Finance and Operations, Internal Affairs, Innovation and Research, External Affairs, Creative Media and Design.
- Real photos you may use: `../assets/team-luna-1.png` (team around the Luna car, daytime), `../assets/team-2.png` (team lineup), `../assets/luna-night.png` (the car at night at PUP). These are the org's own photos.
- Never invent numbers, awards, testimonials, member counts or quotes beyond the above. Where a fact is missing, leave a clearly marked slot.

## What the site does (from our submitted proposal)
Public pages for students and visitors, plus an officer side.

| Page | Content |
|---|---|
| Home (`index.html`) | Intro to Hygears, latest announcements, a "Join Hygears" action, a way into the tools catalog |
| Tools and Consumables (`tools.html`) | Item list with photo slot, category, type (tool or consumable) and how many are available now; search and category filter; Reserve on each available item |
| Reserve (inside `tools.html` or `reserve.html`) | Form: full name, student number, email, course and section, item, quantity, purpose, pickup date, return date. On submit, show a success state with a reference number like `HYG-2026-0142` |
| Track Request (`track.html`) | Enter a reference number, see Pending, Approved or Declined (show all three states as examples) |
| Join (`join.html`) | Membership application: full name, student number, email, course, year and section, reason for joining |
| About and Contact (`about.html`) | What the org is, the programs members come from, borrowing rules, contact links |
| Officer Dashboard (`officer.html`) | Login card, then a dashboard: pending reservations to approve or decline, overdue items, new applications, and item stock. Sample data is fine but label it as sample |

Sample items (label them sample, the real list comes from the org): digital multimeter, soldering station, cordless drill, torque wrench, wire crimper, heat gun, safety goggles (tools); PLA filament 1kg, heat-shrink tubing pack, zip ties pack, electrical tape, epoxy resin kit (consumables). Tools are returned; consumables are used up.

## Rules from our professor's lecture (must follow)
- One primary, one accent, neutrals. Accent only for buttons and key actions. Text contrast 4.5:1 or better. Never color alone for status: pair with text or an icon.
- Two fonts at most. Body 16px or larger, line-height about 1.5. Same h1/h2/h3 sizes on every page. Lines about 60 to 80 characters.
- CSS variables in `:root`, ONE shared `style.css` linked by every page, the same header and footer on every page (the real site will use PHP includes), the current page highlighted in the nav.
- Real content (no lorem ipsum), action words on buttons (Reserve, Track Request, Apply), helpful labels, hints and error messages on forms.
- Mobile first and responsive (rem, %, max-width), alt text on every image, visible keyboard focus, labels on every input.
- Same look for buttons, cards and forms everywhere.

## Output for each direction
- Folder with the 7 pages and one `style.css` (plus `tokens.css`/`base.css` if the skill scaffolds them) and an optional `app.js`.
- A short `NOTES.md`: the direction's name, palette, fonts, the one idea that makes it memorable, and what still needs real material.
- Keep total size small (no large images besides the provided ones).
