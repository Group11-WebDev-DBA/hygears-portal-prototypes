# QA protocol: role-played visits

Every prototype goes through this after it's built. The goal is to find real problems the way real visitors would, then fix them. Most students will open the site on a phone, so mobile comes first.

## How to look
- Take screenshots with the helper: `bash "<scratchpad>/skill-lib/shoot.sh" <page.html> <out.png> <width> <height>`.
  - Phone: 390 x 844 (main), plus 360 x 800 for small Android phones.
  - Laptop: 1280 x 800.
- Pages to check at minimum: index, tools (and reserve), track, join, officer. About can be a quick look.
- Read the HTML/CSS/JS to check behaviour that screenshots can't show: form validation, filters, button states, focus styles, tap target sizes, overflow.
- Old 8GB laptop: one Chrome at a time, no dev servers, delete screenshot files when done.

## The visitors (write each one's notes in their own voice)
1. **Mika, 2nd-year ME student, on a budget Android phone, mobile data, between classes.** Needs a soldering station for a project tomorrow. Can she find it, see if it's available, reserve it and get a reference number in under a minute with one thumb? Is anything tiny, cramped, cut off or hard to tap?
2. **Paolo, Hygears officer, checking requests on his phone after class, then on a laptop at the office.** Can he see pending requests, approve or decline fast, spot overdue items and new applications? Is the dashboard usable on a phone at all?
3. **Bea, 1st-year who saw the ASCEND recruitment post on Facebook and tapped through.** Does the site feel like the same org as their posts (red/orange energy, the HG mark, "Engineering Innovation • Research • Technology • Leadership")? Is joining obvious and is the form easy?
4. **A senior UI/UX designer doing a critique.** Hierarchy, spacing, type scale, consistency across pages, contrast, does it look designed or AI-generated, what's the weakest screen.
5. **Sir Cadaoas, the Web Development professor grading the defense.** Check against `../../ui-requirements-nov21.md`: limited palette, accent only for actions, 4.5:1 contrast, two fonts, 16px body, CSS variables, one shared stylesheet, same header/footer, nav highlights current page, real content, labels/hints/errors on forms, alt text, focus states, mobile first. Would this pass as a dynamic website at the defense?
6. **Hans, a groupmate who will rebuild this in PHP.** Is every part something we were taught (plain HTML/CSS/JS)? Any CSS or JS he couldn't explain at the defense? Is the code commented and readable?
7. **An accessibility tester using keyboard only and a screen reader.** Tab order, visible focus, labels, landmarks, status messages announced, nothing conveyed by colour alone.

## Output
Write `QA.md` in the prototype's folder:
- One short section per visitor: what worked, what failed (with page and element), severity (blocker / major / minor).
- A combined, de-duplicated **fix list** ordered by severity.
- Then **fix every blocker and major issue** (and cheap minor ones), re-screenshot phone and laptop for the changed pages, and add an **After fixes** section saying what changed and what's still open.

Keep each prototype's identity. Fix problems, don't redesign it into a different direction.
