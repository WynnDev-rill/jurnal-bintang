# Aster Journal — Product Research & Direction

Updated: 2026-08-07

## External patterns reviewed

### Day One
Source: https://apps.apple.com/sg/app/day-one-daily-journal-diary/id1044867788

Useful mature-journal patterns: daily prompts, templates, reminders, streak/calendar, rich search/filtering, tags/favorites, export, media attachments, Today summaries, and an “On This Day” memory surface. Aster should adopt the high-value patterns that fit a local-first personal app without copying Day One’s visual design or paid/cloud architecture.

### Day One privacy model
Source: https://dayoneapp.com/privacy-faqs/

Journal content is trust-sensitive. Aster should be explicit about what is local and should never present a cloud/sync/security claim that the implementation does not provide. Backup/export should remain easy to find.

### Positive expressive writing research
Source: https://pubmed.ncbi.nlm.nih.gov/40397857/

A 2025 systematic review found gratitude-focused and “best possible self” writing among the more consistently promising positive-writing approaches, while also noting limitations in study quality. Product implication: provide optional structured gratitude prompts, but do not make medical or guaranteed wellbeing claims.

## Aster product decisions from this pass

1. Keep Aster focused and calm rather than adding social, feed, or gamified mechanics.
2. Add more reflection prompts and quick guided starts to reduce blank-page friction.
3. Add “3 Hal Baik” as an optional structured reflection.
4. Make the daily prompt deterministic by day instead of resetting to the first prompt on every launch.
5. Add “Pada Hari Ini” when historical entries exist.
6. Make folders actually usable: notes can be assigned to folders, folder rows open their contents, and system collections are browsable.
7. Implement recoverable deletion: existing notes go to Sampah first; permanent deletion happens from Sampah.
8. Make Arsip functional and keep archived/trashed notes out of the normal Catatan feed.
9. Add JSON backup restore and readable Markdown export.
10. Allow the daily reminder time to be changed.
11. Improve Insight with seven-day words, active days, week-over-week activity, and mood timeline while avoiding moralizing language.
12. Preserve a local-first privacy message and avoid fake cloud/biometric claims.
13. Fix the reflection hero SVG transform bug by separating static SVG transforms from CSS-animated transforms and using a fill/crop behavior that does not leave large white side gutters.
14. Keep touch areas comfortably mobile-sized and preserve Android safe-area behavior.

## Installed project-local skills

- `.agents/skills/ui-ux-pro-max/SKILL.md` — concise Aster adapter based on the free MIT-licensed UI UX Pro Max project: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- `.agents/skills/mobile-ui-ux-designer/SKILL.md` — concise Aster adapter based on the free MIT-licensed mobile UI/UX Designer skill: https://github.com/mdrmuhaimin/agentic-skills/tree/main/codex/mobile-ui-ux-designer

The adapters are intentionally small and repository-specific instead of vendoring large upstream databases. They are referenced from `AGENTS.md` so future UI/UX work in this repository has a consistent quality contract.
