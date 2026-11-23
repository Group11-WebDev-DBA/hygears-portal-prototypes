# Design system: "Charge" (superdesign direction)

Written first, per the superdesign skill's Brand New Project SOP. Every page follows it; nothing outside it gets added.

## Product context
- **Who:** PUP students (mostly on phones, between classes, on mobile data) and Hygears officers (phone after class, laptop at the office).
- **Jobs to be done:** 1) find a tool, see if it's in, reserve it, keep the reference number; 2) apply to join the org. Officers: approve or decline requests, spot overdue items, new applications and low stock.
- **Pages:** Home, Tools, Reserve, Track, Join, About, Officer (7). Reserve lights up Tools in the nav.

## The idea
**Stock shown as battery charge.** Hygears builds electric cars, so every "how many are in" is a small battery: one cell per unit, filled cells are units on the shelf, empty cells are units out. It always sits next to the number in words ("2 of 3 available"), so colour or shape never carries the meaning alone. The same cell strip is the 3-step "how borrowing works" row on Home and the progress row on Track (Sent, Reviewed, Ready for pickup).

## Colour (hex only)
| Token | Hex | Use |
|---|---|---|
| `--white` | #FFFFFF | page, cards, inputs |
| `--gray` | #F4F5F7 | alternate sections, photo slots, empty cells |
| `--line` | #D5D8DE | borders and dividers |
| `--ink` | #14161A | text, filled cells, battery outline |
| `--muted` | #5B6270 | hints and meta text (6.1:1 on white, 5.6:1 on gray) |
| `--red` | #D7261E | buttons, current-page bar, key actions only (white text 5.0:1) |
| `--red-dark` | #B51E17 | button hover, error text |
| `--charcoal` | #1B1D22 | hero and footer bands |
| `--on-dark` | #C3C8D1 | secondary text on charcoal |
No orange, amber, cream, green or other status colours. Status is text plus an icon character.

## Type
- Headings: **Barlow Semi Condensed** 700 (engineering, motorsport feel without being a costume). Body: **Barlow** 400/600. Fallback: Arial.
- h1 2.25rem / 3rem (laptop), h2 1.625rem / 2rem, h3 1.25rem, body 1rem, line-height 1.55, paragraphs max 65ch.

## Space and shape
- 8px spacing scale (0.5rem steps). Container max 72rem, side padding 1.25rem.
- Corners 4px on buttons, inputs and cards. 1px `--line` borders. No shadows except the focus ring.
- Tap targets 44px minimum.

## Components (same everywhere)
- `.btn` red filled (primary), `.btn-ghost` outlined ink, `.btn-on-dark` outlined white.
- `.card` white with 1px line border.
- `.cells` battery strip, `.stock` = cells + words.
- `.field` label, input, hint, error. Errors: red-dark text with "!" icon, `aria-invalid`, `aria-describedby`.
- `.status` chip: icon character + word (Pending, Approved, Declined).
- Tables reflow to labelled rows under 48rem (`data-label` + `::before`).

## Motion
None besides a 0.15s colour change on hover. Nothing a student would need to explain.

## Logo
The real HG mark (`../assets/hygears-logo.png`) in the header and footer on every page. Never initials or a drawn substitute.
