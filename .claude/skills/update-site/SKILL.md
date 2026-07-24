---
name: update-site
description: Add a life update (award, scholarship, membership, activity) to the portfolio's log. Use when the user shares news about themselves ("상 받았어", "장학생 됐어", "새 활동 시작했어") or invokes /update-site, optionally pointing at an Obsidian note.
---

# Update the portfolio log

The site exposes life updates in two generated places:
1. **updates.html** — the full changelog, rows between the
   `<!-- updates:start -->` / `<!-- updates:end -->` markers.
2. **index.html hero ticker** — a one-line "Latest" teaser between the
   `<!-- latest:start -->` / `<!-- latest:end -->` markers, rendered from
   the newest entry automatically.

Single source of truth: `data/updates.json`. Never edit the marker blocks
by hand — both are rewritten by the generator.

## Entry schema

```json
{
  "start": "YYYY.MM",          // required
  "end": "YYYY.MM" | null,      // null = Present (ongoing)
  "org": "Organization name",   // required; may include Korean in parens
  "org_url": "https://...",     // optional
  "role": "5th Scholar",        // required — ordinal + position reads best
  "type": "membership | scholarship | leadership | activity | award",
  "summary": "One sentence, English, may contain [markdown links](https://...)."
}
```

## Steps

1. Parse the user's input (free text, or Read the Obsidian note they point
   at). Extract: dates, organization + URL, role, category, one-line summary.
   Write the summary in the site's voice: English, single sentence, factual,
   no exclamation marks. Do NOT include scholarship amounts — the user chose
   to omit money figures from the site.
2. If anything essential is missing or ambiguous (start date, role name,
   category), ask the user rather than guessing.
3. Append the entry to `data/updates.json` (order in the file doesn't matter;
   the generator sorts newest-first).
4. Run the generator from the repo root:

   ```bash
   python3 scripts/generate-updates.py
   ```

   It validates dates/types, rewrites the rows in `updates.html`, and refreshes
   the hero ticker in `index.html`.
5. Verify: start the preview server (`.claude/launch.json`, name
   `resume-site`), then confirm (a) the new row renders on updates.html and
   (b) if the entry is the newest, the hero ticker on index.html shows it —
   in both themes.
6. Show the user the rendered result. Commit and push only if they ask
   (commit message style: `content: add <org> to updates`).

## Boundary rule (Updates vs Chapters)

Sustained jobs and enrollment belong in 03 — Chapters on index.html (edit
that section directly); selections, honors, memberships, and short
activities belong in the updates page. When unclear, ask.
