# Almanac: the printed record

A research organization's reference book: ruled tables on a pale printed sheet, mono figures lined up in columns, two rule weights, square corners. The authority comes from the rules and the numbers, not decoration.

## The one idea

**The tool desk is the hero.** The home page opens on the thing students come for: a ruled ledger of items and how many are available now, set in Plex Mono, with Reserve beside each row. The same sheet carries the catalog, the track lookup and the officer desk, so the whole portal reads as one record.

## Palette (2026 brand, from BRIEF.md)

| Role | Token | Value |
|---|---|---|
| Paper (cream) | `--color-paper` | `#FFF4E2`, oklch(97.1% 0.026 80.3) |
| Sheet (printed page) | `--color-sheet` | oklch(99.2% 0.010 85) |
| Ink (brown-black) | `--color-ink` | `#2A140C`, oklch(22.1% 0.039 40.6) |
| Muted text | `--color-muted` | oklch(45% 0.030 45) |
| Signal (red, the one accent) | `--color-accent` | `#D7261E`, oklch(56.7% 0.212 28.8), hover oklch(48% 0.190 28.8) |
| Amber highlight | `--color-highlight` | `#F5A623`, used only for footer link underlines on the dark band and text selection |

- Red, not orange, is the signal: red on cream is 4.61:1 and passes for button text and links; orange is 2.81:1 and fails. All body text is brown-black on cream (16:1).
- Red marks only the primary buttons, the current nav item and link underlines. Statuses always pair words with an icon (clock, check, cross, warning), never colour alone.
- The footer is the one dark band: cream text on the brown-black ink.

## Fonts

- **Hanken Grotesk** 500/600 for headings and buttons.
- **Newsreader** 400/500 for body, labels and table heads.
- **IBM Plex Mono** only for numbers: counts, reference numbers, dates in tables.
- Loaded from Google Fonts. Offline they fall back to system-ui, Georgia and the system mono, so pages still open by double-click.

## Pages

`index.html`, `tools.html`, `reserve.html` (Tools stays highlighted in the nav), `track.html`, `join.html`, `about.html`, `officer.html`. They all share `style.css` (which imports the scaffolded `tokens.css` and `base.css`) and `app.js`, plus the same header and footer.

States in `app.js`:
- Catalog search, category and type filters, including an empty state.
- Reserve validation (quantity against stock, dates) and a success panel with a reference number like `HYG-2026-0142`.
- Track: Pending, Approved, Declined, plus not-found and bad-format errors. The request you just made in this browser tracks as Pending.
- Join validation, including the preferred committee.
- Officer sign-in, then Approve, Decline and Undo with live counts and an empty state.

Every form says plainly that the prototype sends nothing.

## Picks

**Hallmark · v2.0.0**

- **Shape** · Split Studio, from draw aee9d3db · genre editorial · job: join (and reserve). Reserve a tool is the hero's primary action, Apply to join sits beside it, and the page closes on joining. Inner pages use a Banner page head. Tools, reserve, track, join and officer are treated as app screens.
- **Theme** · Almanac, dealt 2/3 (seed pup-hygears-web-portal-ff39·aee9d3db·2026-11-22·r0). Swap: the brand wins on colour, so the slate paper and chart magenta became the org's cream, brown-black and red. Almanac keeps the type, rules, square corners and the sheet.
- **Chrome** · nav: search-led bar (wordmark, six links, "Search tools" field that opens the filtered catalog) · footer: mast on the ink band (large wordmark, tagline and #GEARINGUpTowardExcellence, then pages, contact and address)
- **Hero** · Counter: the headline, one sentence and two actions on 5 columns, with the tool desk ledger on 7
- **Signature** · the tool desk ledger on the printed sheet, counts in Plex Mono beside Reserve
- **Sections (home)** · Hero (tool desk) · Split (the team around Luna, photo) · Rows (sample notices) · Join (programs and Apply, then the team lineup photo full width) · Footer
- **Material** · real: name, PUP Sta. Mesa, Luna, Shell Eco-marathon, the org's own words and tagline, programs, committees, contacts, hashtag, logo, 3 photos · pictures: the org's 3 photos, muted, cropped 4:3 and 21:9 (Almanac's square crop would cut the group shots) · absent: real inventory and counts, item photos, announcements, borrowing penalties, workshop room
- **Sweep** · Floor 0 FAIL · Reflex: 39b and 49b fixed, 44c and 79 waived (inner pages open on a Banner head) · 25 dismissed (the about-page statement is one sentence at display size) · render tier run twice · JS states smoke-tested headless with no page errors · finish review done inline (subagent reviews skipped as asked)

## Still needs real material

1. **Inventory**: the real item list, categories, counts, and one photo per item (the dashed "photo" squares in `tools.html`, about 56px each). Every count on the site is sample data and labelled as sample.
2. **Current logo**: `../assets/hygears-logo.png` is the older red mark. The 2026 orange-red flame version should replace it (nav at 36px, footer at 64px).
3. **Announcements**: the three notices on the home page are samples.
4. **Late-return policy**: an open slot on `reserve.html` and `about.html`.
5. **Workshop room** for pickups: an open slot on `about.html`.
6. **Real endpoints**: the reserve, join, track and officer sign-in all need the PHP + MySQL backend. Every "preview" branch in `app.js` marks where a real request goes.

The single most useful thing to get is the real inventory list with photos: it fills the hero, the catalog and the officer stock table at once.
