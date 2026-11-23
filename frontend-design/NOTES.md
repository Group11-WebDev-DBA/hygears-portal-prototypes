# Shadow Board (frontend-design)

Built with Anthropic's frontend-design skill. The professor's rules win wherever the skill and the brief disagree.

## The one idea

**The shadow board.** In a real workshop, every tool hangs on a pegboard over its own painted outline, so you can see at a glance what's missing. This portal is that wall. Each item hangs from a hook on a cream pegboard. When stock is available, the tool is a solid dark silhouette with a small drop shadow. When every unit is out, only the pale painted outline is left, marked "None left" with a cross icon. Stock reads at a glance, with no legend needed. On Home the tools swing onto their hooks once on load (turned off for reduced motion). After you reserve, your reference number comes back as a hang tag with an eyelet (`HYG-2026-0142`). The Track page and its three example statuses use the same tag.

Everything else stays quiet: white pages, brown-black text, heavy condensed headings, and red only on buttons.

## Pages
`index.html`, `tools.html`, `reserve.html`, `track.html`, `join.html`, `about.html`, `officer.html`. One `style.css`, one `app.js`, the same header and footer everywhere. The current page gets an amber bar and `aria-current`, and Reserve lights up Tools. Double-click any file to open it. To review the officer desk without signing in, open `officer.html#signed-in`.

On phones the main nav is a thumb bar fixed to the bottom of the screen (Home, Tools, Track, Join, About), with "Officer sign in" at the top right. From 896px up, the same markup sits in the header.

## Palette
| Role | Value | Use |
|---|---|---|
| Action (accent) | red `#D7261E`, pressed `#AE1D16` | Buttons only. White text on it is 5.0:1 |
| Text / structure | brown-black `#2A140C` | Text, board frame, hooks, tool silhouettes, tab bar, footer. 16:1 on cream |
| Muted text | `#5A3F33` | Hints and meta. 8.9:1 on cream |
| Field edge | `#8A6F60` | Input borders, dashed "out" outlines. 4.6:1 on white |
| Board | cream `#FFF4E2` with peg holes `#E8D3AE` | The pegboard, plus bands on Track, About and Join |
| Paint | `#EED8B3` | The painted outline of a tool that's out |
| Highlight | amber `#F5A623` | Current-page bar and the tag eyelet only, never behind text |
| Page | white `#FFFFFF` | Page background, label plates, forms |

Orange `#F26A1B` isn't used outside the logo. Orange text on cream is about 2.8:1, so red took the action role.

## Fonts
One family: **Archivo** (Google Fonts, variable width and weight).
- Headings: weight 800 at 68% width, a condensed workshop-label look. h1 is 40 to 72px, h2 28 to 40px, h3 20px. The same tokens are used on every page.
- Body: weight 400 at normal width, 16px, line-height 1.55, about 38rem line length.

## Why it differs from the other three
- Ink: pill nav and a reservation slip on cream. Almanac: serif record with ruled tables. Taste: photo-led, ticket cards.
- Shadow Board leads with the tool wall itself as the visual. It uses a single condensed sans, white pages with the cream reserved for the pegboard, a bottom tab bar on phones, and hang tags for reference numbers.

## Needs real material
- The real item list, categories and counts (all marked "Sample"). Real item photos can replace the silhouettes in each slot, keeping the painted outline for the "out" state.
- Pubmats and dates for the four announcements (they show "Pubmat slot" and "Date: to be added").
- The current orange-red flame version of the HG logo (this uses the older red `hygears-logo.png`).
- Borrowing rules: written as a draft, marked "officers to confirm".
- The ASCEND 2026 Google Form link on Join.
- Photos are the org's originals at 1.6 to 2 MB each. Resize to about 1440px JPG (~200 KB) before the real site goes up.
