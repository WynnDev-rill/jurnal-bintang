# Aster Journal — UI UX Pro Max

name: ui-ux-pro-max
description: Project-local Codex skill for professional UI/UX decisions in Aster Journal.
license: MIT-inspired adapter; upstream project is MIT licensed.
upstream: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

## Purpose
Use this skill whenever a task changes Aster Journal layout, visual hierarchy, navigation, interaction, motion, charts, colors, typography, or responsive behavior.

## Product direction
Aster is a calm, local-first journal. Optimize for focus, speed, trust, readability, and low cognitive load. Preserve the existing soft editorial identity: white/soft-sky surfaces, DM Serif Display for expressive headings, Plus Jakarta Sans for interface text, Lucide icons, restrained color, rounded cards, subtle depth.

Do not turn Aster into a generic dashboard, gamified habit tracker, or visually noisy wellness app. Avoid decorative gradients, excessive glass effects, persistent animation, fake AI features, fake cloud states, and dense enterprise controls.

## Required workflow
1. Read the affected route/component and the surrounding design tokens before editing.
2. Define the user's primary action on the screen.
3. Reuse existing Aster components and tokens before creating new ones.
4. Preserve a clear hierarchy: title/context -> primary action -> supporting information -> secondary controls.
5. Prefer progressive disclosure through sheets/details instead of showing every option at once.
6. Verify empty, populated, error, disabled, and destructive-action states.
7. Keep destructive actions recoverable where practical (trash before permanent deletion).
8. Keep local/private state explicit. Never imply sync, encryption, biometric lock, or AI capabilities unless implemented.

## Visual rules
- Primary blue is for key actions and active navigation, not every element.
- Keep card borders subtle and shadows shallow.
- Prefer 16-24px section spacing and consistent 12-16px internal spacing.
- Primary CTA height should be about 44-52px on compact mobile surfaces.
- Icon-only controls need an accessible hit area even when the icon itself is small.
- Use semantic icons; do not use emoji as interface icons. Emoji is acceptable only as mood content.
- Avoid horizontal clipping at 320-375px widths.
- Long Indonesian labels must wrap or truncate intentionally without hiding critical actions.

## Motion rules
Motion must explain state or add gentle continuity. Use short transitions for sheets, selection, and save feedback. Decorative motion must be subtle and must respect `prefers-reduced-motion`. Never animate an SVG group with CSS `transform` when the same node also relies on an SVG `transform` attribute; wrap it in a parent group so transforms do not override each other.

## Responsive/mobile QA
Check compact Android first, then wider web. Always account for status bar, gesture/navigation bar, virtual keyboard, safe-area insets, and bottom navigation. Fixed overlays must remain usable with the keyboard open.

## Pre-delivery checklist
- No clipped text or controls.
- No inaccessible icon-only buttons.
- No color-only state communication.
- Focus-visible behavior exists for keyboard/web.
- Reduced motion is respected.
- Empty states are useful and do not inject fake sample data.
- Interactive rows actually perform the action their visual design implies.
- Data-loss actions require confirmation and, where possible, recovery.
- Light/dark theme states persist correctly.

This is a concise project adapter based on the free MIT-licensed UI UX Pro Max project. It intentionally keeps only the rules relevant to Aster rather than vendoring its large upstream design database.