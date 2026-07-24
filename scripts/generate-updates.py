#!/usr/bin/env python3
"""Regenerate the log page and hero ticker from data/updates.json.

Single source of truth: data/updates.json. This script renders:
  1. every entry as static rows between the updates:start/end markers
     in updates.html (newest first; ongoing entries win ties), and
  2. the newest entry as a one-line ticker between the latest:start/end
     markers in index.html's hero.

Run from the repo root:

    python3 scripts/generate-updates.py
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "updates.json"
UPDATES_PAGE = ROOT / "updates.html"
HOME_PAGE = ROOT / "index.html"

VALID_TYPES = {"membership", "scholarship", "leadership", "activity", "award"}
DATE_RE = re.compile(r"^\d{4}\.\d{2}$")
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def md_links(text: str) -> str:
    """Escape HTML, then convert [text](url) markdown links to anchors."""
    parts = []
    last = 0
    for m in LINK_RE.finditer(text):
        parts.append(html.escape(text[last:m.start()]))
        parts.append(
            f'<a href="{html.escape(m.group(2), quote=True)}" target="_blank" rel="noopener">'
            f"{html.escape(m.group(1))}</a>"
        )
        last = m.end()
    parts.append(html.escape(text[last:]))
    return "".join(parts)


def validate(entry: dict) -> None:
    for field in ("start", "org", "role", "type", "summary"):
        if not entry.get(field):
            sys.exit(f"error: entry missing required field '{field}': {entry}")
    if not DATE_RE.match(entry["start"]):
        sys.exit(f"error: start date must be YYYY.MM: {entry['start']}")
    if entry.get("end") and not DATE_RE.match(entry["end"]):
        sys.exit(f"error: end date must be YYYY.MM or null: {entry['end']}")
    if entry["type"] not in VALID_TYPES:
        sys.exit(f"error: type must be one of {sorted(VALID_TYPES)}: {entry['type']}")


def render_row(entry: dict) -> str:
    period = f"{entry['start']} &mdash; {entry['end'] or 'Present'}"
    org = html.escape(entry["org"])
    if entry.get("org_url"):
        org = (
            f'<a href="{html.escape(entry["org_url"], quote=True)}" target="_blank" rel="noopener">{org}</a>'
        )
    return f"""            <div class="update-row" data-reveal>
              <span class="update-date label">{period}</span>
              <span class="update-tag label">{html.escape(entry["type"])}</span>
              <div class="update-body">
                <h3 class="update-title">{org} &middot; {html.escape(entry["role"])}</h3>
                <p class="update-desc">{md_links(entry["summary"])}</p>
              </div>
            </div>"""


def render_ticker(entry: dict) -> str:
    # Keep the ticker terse: drop any parenthetical (e.g. Korean org names)
    org_short = html.escape(entry["org"].split(" (")[0])
    return (
        f'            <span class="label">Latest</span>\n'
        f'            <span class="hero-latest-text">{entry["start"]} &mdash; '
        f'{org_short} &middot; {html.escape(entry["role"])}</span>\n'
        f'            <span class="hero-latest-arrow" aria-hidden="true">&nearr;</span>'
    )


def patch(path: Path, marker: str, block: str) -> None:
    page = path.read_text(encoding="utf-8")
    pattern = re.compile(rf"(<!-- {marker}:start -->).*?(<!-- {marker}:end -->)", re.S)
    if not pattern.search(page):
        sys.exit(f"error: {marker}:start/end markers not found in {path.name}")
    replacement = "\\g<1>\n" + block.replace("\\", "\\\\") + "\n            \\g<2>"
    path.write_text(pattern.sub(replacement, page), encoding="utf-8")


def main() -> None:
    entries = json.loads(DATA.read_text(encoding="utf-8"))
    if not entries:
        sys.exit("error: data/updates.json is empty")
    for e in entries:
        validate(e)
    # Sort: newest start first; ongoing entries win ties.
    entries.sort(key=lambda e: (e["start"], e.get("end") is None), reverse=True)

    patch(UPDATES_PAGE, "updates", "\n".join(render_row(e) for e in entries))
    patch(HOME_PAGE, "latest", render_ticker(entries[0]))
    print(f"ok: rendered {len(entries)} update(s) into updates.html and ticker into index.html")


if __name__ == "__main__":
    main()
