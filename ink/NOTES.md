# Ink: the lending desk

**The idea that makes it memorable:** the reservation slip. A ruled well with an amber top edge and the reference number in mono (`HYG-2026-0142`) shows up on every page that does something. It's the reservation counter in the home hero, the reserve success on Tools, the result on Track request, the application on Join and the sign-in on the Officer desk. Everything else is a plain notice printed in dark ink on Hygears cream, with hairline rules and one red that means "act here".

Open `index.html` by double-clicking. No build step, no server.

## Palette (Hygears 2026 brand, from BRIEF.md)

| Role | Value | Where |
|---|---|---|
| Paper (background) | cream `#FFF4E2` | every page |
| Paper 2 / 3 | `oklch(95% 0.03 78)` / `oklch(91.5% 0.035 74)` | bands, slips, current nav item, tags |
| Ink (text) | brown-black `#2A140C`, body `oklch(30% 0.035 45)` | headings and body |
| Muted | `oklch(44% 0.03 50)` | hints, captions, field edges (4.5:1 or better on cream) |
| Rules | `oklch(85% 0.035 70)` | hairlines between rows |
| **Accent (the one signal)** | red `#D7261E`, hover `oklch(45% 0.16 29)` | filled buttons, focus ring, current-page underline. White text on it is about 5:1 |
| Highlight | amber `#F5A623` | the slip's top edge and text selection only |

Orange `#F26A1B` isn't used. White text on orange is about 3:1 and orange text on cream fails 4.5:1, so red took the signal role. Status never relies on colour alone: every tag has a word and an icon (Available, None left, Pending, Approved, Declined).

## Fonts

- **Epilogue** 700 for headings, 400/600 for everything you read (Google Fonts link, falls back to the system sans offline).
- **IBM Plex Mono** only for reference numbers, student numbers and stock counts.
- One scale on every page: h1 60px, h2 40px, h3 25px at desktop. Body 16px at 1.55.

## Pages

`index.html` (home), `tools.html` (catalogue with search, category and type filters, plus the inline Reserve form), `track.html`, `join.html`, `about.html`, `officer.html`. One `style.css` (imports `tokens.css` and `base.css`), one `app.js`. The header and footer are identical on every page, and the current page is marked in the nav.

States built in `app.js`:
- **Tools:** live filter with a "no match" state. Reserve on a row picks the item and jumps to the form. Validation messages on every field. Consumables switch off the return date. On success you get a slip with a reference number, saved in this browser so Track request can find it.
- **Track:** Pending, Approved and Declined samples (`HYG-2026-0142`, `0137`, `0129`), a wrong-format error and a not-found state.
- **Join:** validation, plus the preferred committee select (Finance and Operations, Internal Affairs, Innovation and Research, External Affairs, Creative Media and Design).
- **Officer:** a sign-in card (any email and password, marked as prototype). The dashboard has live counts. Approve, decline, accept and mark returned all have Undo, and each table shows an empty state when nothing is left. Days late are counted from today's date.

Every success state says plainly that the prototype sent nothing.

## Picks

**Hallmark · v2.0.0** (fast mode, prototype)

- **Shape** · Conversational FAQ for the home page, from draw 10d125 · genre editorial · job: book (reserve a tool). Swap: the draw said join in the hero, but reserving is the portal's main job, so join became the close
- **Theme** · Ink, dealt 1/3 (cream paper turned from Ink's white, brown-black ink, Epilogue 700 over 400, hairline rules, state pills). The brand red replaces Ink's teal as the one signal
- **Chrome** · nav: a floating pill (logo, five pages, Officer set apart), which collapses to a Menu button under 60rem · footer: a colophon block (one paragraph with the org, address, socials and photo credit)
- **Hero** · Counter: headline, one line and two quiet actions on the left, the reservation slip on the right as the visual
- **Signature** · the reservation slip and its HYG reference number
- **Sections (home)** · Hero (the counter) · photo and the org's own words · Before you borrow (5 disclosures) · Notices as dated rows (sample) · the tagline as the close, with Apply
- **Screen (officer)** · stat row, then tables for pending reservations, overdue items, new applications and item stock · states: full, empty, undo. No loading or error state, since there's no backend yet
- **Material** · real: the org's description, tagline, programs, committees, hashtag, contacts, logo and 3 photos · sample (labelled): items, stock counts, notices, requests, applications · absent: member counts, awards, quotes from people, real announcements
- **Sweep** · sloplint static: Floor 0 FAIL · 0 WARN · Reflex 1 waived (68: twelve photo slots the brief asks for). Officer page in app scope: clean. The render tier didn't run because puppeteer isn't installed, and the browser pane was busy, so there was no visual pass. The finish review was done by hand

## Still needs real material

1. **Current logo.** `../assets/hygears-logo.png` is the older red mark. The 2026 orange-red flame version should replace it (header 40px, footer 48px, favicon).
2. **Item photos.** There are 12 dashed "Photo to come" slots on Tools (72px squares, `data-slot="item-<slug>"`). Square photos of each real item drop in with `hallmarkSlots({...})` or a plain `<img>`.
3. **The real inventory.** Item names, categories and counts are sample.
4. **Pickup room.** Track request has a dashed slot reading "pickup room to be confirmed".
5. **Borrowing rules.** About shows draft rules, including bringing a PUP ID, for the officers to confirm.
6. **Announcements.** The three notices on Home are sample.
7. **Fonts offline.** Epilogue and Plex Mono load from Google Fonts. Self-host the woff2 files if the class demo might be offline.

The one thing that would improve it most: a current photo of the Hygears tool shelf or workshop for the Tools page header. Right now only the team photos carry the site.
