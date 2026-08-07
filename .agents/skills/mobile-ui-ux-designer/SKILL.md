# Aster Journal — Mobile UI/UX Designer

name: mobile-ui-ux-designer
description: Project-local mobile-first UX and accessibility skill for Aster Journal.
license: MIT-inspired adapter; upstream skill is MIT licensed.
upstream: https://github.com/mdrmuhaimin/agentic-skills/tree/main/codex/mobile-ui-ux-designer

## Purpose
Use this skill for mobile flows, usability fixes, accessibility review, touch interaction, responsive layouts, empty/loading/error states, editor behavior, forms, sheets, and Android-specific ergonomics.

## Context model for Aster
Primary use is short, private writing sessions on a phone: capture a thought quickly, write a longer journal entry, answer one reflection prompt, review mood/activity, or find an older note. Assume intermittent connectivity and do not block local actions on network availability.

## Interaction contract
For every important action define:
- Trigger: what the user taps/types.
- System response: what changes immediately.
- Success feedback: visible and understandable without relying only on animation/color.
- Failure/recovery: preserve user input and explain the next action.
- Destructive path: confirm and provide recovery when feasible.

## Mobile rules
- Prefer one obvious primary action per screen.
- Keep common actions within comfortable one-handed reach where possible.
- Interactive targets should have at least a practical 44px mobile hit area; compact controls may use smaller visible icons with padded hit areas.
- Bottom navigation and floating actions must not collide with Android gesture/navigation bars.
- Full-screen editors and sheets must use safe-area padding.
- The keyboard must not hide Save/Close or critical form feedback.
- Do not nest interactive controls inside other buttons.
- Maintain scroll position/state when returning from details where practical.

## Accessibility contract
- Every icon-only control needs an `aria-label`.
- Decorative SVGs/icons must be hidden from assistive technology.
- State cannot be communicated by color alone.
- Text scaling must not hide primary actions.
- Focus order must follow visual order after opening or closing sheets/dialogs.
- Motion is optional and reducible.
- Error copy must say what failed and what can be done next.

## Journal-specific UX rules
- Autosave/local persistence must never silently discard real entries.
- New blank drafts may be removed automatically only when truly empty.
- Deleting an existing entry should go to Trash before permanent deletion.
- Folder/archive/trash rows must be browsable if they look browsable.
- Search should cover title, body, tags, and checklist text for notes.
- Reflection prompts should reduce blank-page friction; daily prompt selection should not reset to the same first prompt every app launch.
- Mood logging should be fast and optional; never force a mood before writing.
- Insights should summarize behavior without moralizing low activity.
- Backup/export and import should be easy to find because journal data is high-value personal content.

## Visual verification
When UI code changes, inspect the actual rendered result or available screenshot. Specifically check 320px, ~393px, and 520px container widths; long Indonesian strings; empty and populated states; light/dark themes; and safe-area behavior.

## Handoff gate
Before considering a mobile change complete, verify: user goal, empty state, populated state, failure/recovery, accessibility labels, touch size, safe areas, reduced motion, and persistence.

This is a concise Aster-specific adapter derived from the principles of the free MIT-licensed `mobile-ui-ux-designer` skill.