---
name: Aster Journal
description: "A quiet writing desk with editorial type and native Android controls."
colors:
  light-primary: "#2856C5"
  light-primary-container: "#E5EDFF"
  light-on-primary-container: "#183D91"
  light-secondary: "#56637B"
  light-secondary-container: "#EDF1FA"
  light-on-secondary-container: "#253B66"
  light-background: "#FAFBFE"
  light-on-background: "#172239"
  light-on-surface: "#172239"
  light-surface-variant: "#F0F3FA"
  light-on-surface-variant: "#56637B"
  light-surface-container: "#F0F3FA"
  light-surface-container-low: "#F5F7FC"
  light-surface-container-high: "#E8EDF7"
  light-outline: "#75839A"
  light-outline-variant: "#DFE5F0"
  light-error: "#B3261E"
  light-error-container: "#FCE9E7"
  light-on-error-container: "#681710"
  light-on-primary: "#FFFFFF"
  light-surface: "#FFFFFF"
  dark-primary: "#ADC6FF"
  dark-on-primary: "#082B71"
  dark-primary-container: "#263E70"
  dark-on-primary-container: "#DBE6FF"
  dark-secondary: "#B8C3D7"
  dark-secondary-container: "#25324A"
  dark-on-secondary-container: "#DCE5F7"
  dark-background: "#10141E"
  dark-on-background: "#E3E8F5"
  dark-surface: "#171D2A"
  dark-on-surface: "#E3E8F5"
  dark-surface-variant: "#202838"
  dark-on-surface-variant: "#B8C3D7"
  dark-surface-container: "#202838"
  dark-surface-container-low: "#171D2A"
  dark-surface-container-high: "#283247"
  dark-outline: "#8B99AF"
  dark-outline-variant: "#364257"
  dark-error: "#FFB4AB"
  dark-error-container: "#63302D"
  dark-on-error-container: "#FFDAD6"
typography:
  headlineLarge:
    fontFamily: "DM Serif Display"
    fontSize: "32sp"
    fontWeight: 400
    lineHeight: "40sp"
  headlineMedium:
    fontFamily: "DM Serif Display"
    fontSize: "28sp"
    fontWeight: 400
    lineHeight: "36sp"
  headlineSmall:
    fontFamily: "DM Serif Display"
    fontSize: "24sp"
    fontWeight: 400
    lineHeight: "32sp"
  titleLarge:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "20sp"
    fontWeight: 600
    lineHeight: "28sp"
  titleMedium:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "16sp"
    fontWeight: 600
    lineHeight: "24sp"
  titleSmall:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "14sp"
    fontWeight: 600
    lineHeight: "22sp"
  bodyLarge:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "16sp"
    fontWeight: 400
    lineHeight: "26sp"
  bodyMedium:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "14sp"
    fontWeight: 400
    lineHeight: "22sp"
  bodySmall:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "12sp"
    fontWeight: 400
    lineHeight: "18sp"
  labelLarge:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "14sp"
    fontWeight: 600
    lineHeight: "20sp"
  labelMedium:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "12sp"
    fontWeight: 600
    lineHeight: "18sp"
  labelSmall:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "12sp"
    fontWeight: 400
    lineHeight: "16sp"
rounded:
  notice: "12dp"
  card: "16dp"
spacing:
  compact: "4dp"
  gap: "8dp"
  detail: "10dp"
  small: "12dp"
  medium: "16dp"
  card: "20dp"
  page: "24dp"
  section: "32dp"
components:
  note-card:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-on-surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  note-card-dark:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-on-surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  error-notice:
    backgroundColor: "{colors.light-error-container}"
    textColor: "{colors.light-on-error-container}"
    rounded: "{rounded.notice}"
    padding: "{spacing.medium}"
  error-notice-dark:
    backgroundColor: "{colors.dark-error-container}"
    textColor: "{colors.dark-on-error-container}"
    rounded: "{rounded.notice}"
    padding: "{spacing.medium}"
  empty-state-icon:
    backgroundColor: "{colors.light-primary-container}"
    textColor: "{colors.light-on-primary-container}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
    size: "32dp"
  empty-state-icon-dark:
    backgroundColor: "{colors.dark-primary-container}"
    textColor: "{colors.dark-on-primary-container}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
    size: "32dp"
  brand-header:
    typography: "{typography.headlineSmall}"
    padding: "12dp 24dp"
  mood-chip:
    height: "48dp"
  aster-mark:
    textColor: "{colors.light-primary}"
    size: "32dp"
  aster-mark-dark:
    textColor: "{colors.dark-primary}"
    size: "32dp"
---
# Design System: Aster Journal

## Overview

**Creative North Star: "A Quiet Writing Desk"**

A quiet writing desk: cool white pages, ink typography, a clear blue action, and an airy rhythm. Serif headings make reflection feel personal; native Material controls keep everyday tasks familiar. This is an original synthesis, not a reproduction of supplied artwork.

The designed dark scheme uses deep ink surfaces and a lighter blue accent. The system expresses its character through semantic Material color roles, bundled fonts, and restrained component spacing. Kotlin/Compose source is the visual authority; this document records the implemented theme and shared components.

**Key Characteristics:**
- White/blue identity with a designed dark scheme.
- Editorial headlines paired with legible sans-serif controls.
- Native Material 3 interactions and accessible touch targets.
- Honest empty and recovery states without fabricated journal history.

## Colors

The frontmatter records the explicit Material 3 overrides in `Theme.kt`, in native role pairs for light and dark. Hex values are the portable representation of the source's opaque Compose colors. Roles not overridden here retain the Material 3 library defaults; this is not a claim that every role is customized. Dynamic wallpaper colors are not enabled.

### Primary

Clear action blue marks primary actions, note-kind icons, pin/favorite indicators, and checklist progress. The lighter dark-scheme blue retains the same purpose. Primary containers give empty-state artwork a quiet tonal backing, with the paired on-container color for its icon.

### Secondary

Muted slate supports secondary content. The secondary-container pair is a restrained supporting tone rather than another brand accent.

### Neutral

Cool paper backgrounds surround white note cards in light mode. Deep ink backgrounds and blue-grey surfaces carry dark mode. The surface-container low/base/high roles provide tonal levels; on-surface-variant carries subtitles and metadata. Outline and outline-variant provide Material control and divider boundaries.

Error and error-container/on-error-container roles identify a recoverable problem without borrowing the brand blue. Every foreground must use its paired semantic role.

**The Semantic Color Rule.** Read colors from MaterialTheme.colorScheme so light and dark roles travel together; do not hardcode a light color into a component.

## Typography

**Display Font:** bundled DM Serif Display Regular for customized headline roles, with Android fallback.
**Body Font:** bundled Plus Jakarta Sans Regular and Semibold for titles, body, and labels, with Android fallback.

The serif adds a reflective editorial voice; the sans serif carries navigation, writing, and controls. All recorded sizes and line heights use Android `sp`. The frontmatter names the exact Compose roles and their implemented values; no custom display role or letter-spacing scale is asserted. Unspecified Material roles retain library defaults.

Headlines establish page and reflection hierarchy. Titles establish sections and ordinary note names. Body roles carry writing previews and metadata; label roles support note kinds, progress, and controls. The smallest customized body and label roles remain 12sp. Text follows Android font scale.

**The Editorial Hierarchy Rule.** Use DM Serif Display for headline roles and Plus Jakarta Sans for titles, body, and controls; preserve Android font scaling.

## Layout

Use the shared spacing rhythm in frontmatter. Brand headers use page-width horizontal padding and small vertical padding; their mark-to-wordmark gap uses the detail step. Note cards use card padding with detail gaps and smaller inline gaps. Empty states use section vertical padding, small horizontal padding, and small content gaps. Recovery notices use medium padding. Back headers use gap horizontal padding and compact vertical padding.

Preserve the existing screen contract: page padding 24dp, compact editor controls 16dp, section rhythm 24/32dp, and common gaps 8/12/16dp. Compact layouts use bottom navigation; expanded layouts use a navigation rail. Scaffold owns safe drawing insets; the library list and create action consume IME insets together, and the editor applies its own IME insets. Keep primary actions visible when the keyboard or large text changes available space.

## Elevation & Depth

Depth comes from semantic surface tones and standard Material 3 component behavior. `NoteCard` explicitly chooses the surface color and supplies no custom shadow or elevation value. Do not infer a bespoke shadow scale from library defaults.

**The Tonal Depth Rule.** Use the Material surface hierarchy and standard component elevation; do not introduce arbitrary decorative shadows.

## Shapes

Shared custom surfaces use gently rounded corners: the card radius for note cards and empty-state icon containers, the notice radius for recovery messages. Other controls inherit Material 3 shapes; the theme does not install a custom global shape scale. The Aster mark is an eight-ray blue drawing with rounded ray ends and a central dot, rendered at 32dp in shared headers.

## Components

### Cards / Containers

`NoteCard` is a full-width clickable Material card with semantic surface color, card corners, and card padding. It presents a note-kind row, a two-line title, a bounded preview, and one metadata line. Reflection titles use headlineSmall; ordinary note titles use titleMedium. Checklist previews show at most two items and use a textual completion fraction. Pinned, favorite, and attached-image indicators include meaningful descriptions where applicable. Metadata uses bodySmall and onSurfaceVariant. Do not nest independent interactive controls inside the card.

### Chips

`MoodPicker` uses wrapping Material FilterChips with a 48dp minimum height, 20dp leading icons, and gap-step horizontal spacing. Selection can be toggled off; mood is optional. Preserve Material selected, disabled, focus, and ripple behavior. Do not invent browser hover styles.

### Buttons / Inputs / Navigation

Use standard Material 3 buttons, IconButtons, fields, dialogs, sheets, switches, and navigation components. Keep a single create FAB for the primary creation action. Icon-only actions need meaningful content descriptions; decorative icons use a null description. Text input retains native selection and keyboard behavior. System Back and the visible auto-mirrored Back control must agree.

The established screen composition remains: library with brand header, editorial heading, honest count, search, filters, and pinned/recent list; reflection with a prompt, optional mood, prompt library, and recent reflections; collections with real folders and favorite/archive/trash; settings with appearance, privacy, reminders, and data ownership; editor with Back, save status, title/content or checklist, follow-up prompts, and secondary actions in its menu. These are existing screen commitments, not additional component tokens.

### Empty and Recovery States

`EmptyState` centers a tonal icon container, serif title, explanatory body, and optional action. It invites writing without seeded personal history. `ErrorNotice` uses the error-container pair, notice corners, and a text retry action. Its message is a polite Compose live region. Preserve input and communicate success only after local persistence succeeds.

### Brand and Photos

`BrandHeader` pairs the existing mark with the lowercase serif wordmark and optional settings action. `PageHeading` pairs headlineLarge with a muted bodyMedium subtitle. Use bundled licensed fonts, Material icons, and the existing adaptive vector mark. User photos remain optional; the shared photo viewer fits an image within the available width and a 320dp maximum height. Photo Picker avoids broad storage permission.

Material motion respects system animation duration scale; no perpetual animation. Navigation uses 180ms fade transitions (`tween(180)` in `AsterApp.kt`) for enter, exit, pop-enter, and pop-exit. Material components keep their platform defaults. Avoid UI-wide recomposition for each keystroke.

## Do's and Don'ts

### Do:
- Do use the bundled fonts, Material icons, and existing eight-ray Aster mark.
- Do keep interactive targets at least 48dp, provide meaningful Compose semantics, and express state beyond color.
- Do preserve Indonesian copy, system Back, source collection, Android insets, text selection, and standard ripple feedback.
- Do inspect actual Android empty, populated, editor, and recovery states in both themes, compact and expanded layouts, with the IME and 1.3–2.0 font scale.

### Don't:
- Don't add reference screenshots to the APK or make decorative photos a dependency.
- Don't invent sample personal entries or imply cloud sync, encryption, biometric protection, AI processing, or clinical benefits.
- Don't treat browser mockups as native visual verification or emulator results as physical POCO F6 performance evidence.
- Don't let decoration, animation, or premature saved feedback outrank legibility and persisted writing.
