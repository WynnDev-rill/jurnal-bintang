# Native Aster Journal design

Build an installable Kotlin/Compose/Material 3 application under the existing package identity. User has explicitly delegated design/technical decisions and asked execution through APK without minor approval stops; design and plan are reviewable records, not new approval gates.

## Approaches
1. Keep Capacitor: cheaper reuse, but conflicts with 100% native requirement and remote dependence. Rejected.
2. Import a whole open-source notes app: mature behavior, but GPL/product fit, migration and journaling UX mismatch. Rejected after asset-first evaluation.
3. A compact native app using first-party AndroidX building blocks: selected independently under the user's delegation. Reuse fonts/icon, prompt content and migration format, archive old web source safely.

## Scope and architecture
Single activity, Navigation Compose, screen ViewModels, StateFlow with lifecycle-aware collection. Room is source of truth; DataStore stores theme, screenshot privacy, view/sort, reminder preferences. Notes unify text, checklists and reflection entries; immutable UUID identity, original/updated timestamps, folder identity independent of archive/trash, optional prompt/mood/tags/photo. Soft delete everywhere; permanent deletion requires confirmation. Transactions for backup merging and folder deletion. Autosave serializes writes and exposes pending/error/confirmed states; back navigation waits for persistence or leaves recovery UI. Native JSON backup is versioned, bounded and strictly validated before transaction. Import merges without overwriting conflicting IDs; repeated identical import is idempotent. Old web schema 3 accepted, including reflections/drafts/checklist/tags/photos and system collections. Plaintext backup warning is honest.

## UX
See PRODUCT.md and DESIGN.md. Four primary destinations: notes, reflection, collections, settings. Focused editor with optional mood and prompt follow-ups. No fake initial content, activity statistics, encryption or AI. Optional daily reminder is inexact and requires notification permission. Native share entry, photo picker and document selection. English is not required; Indonesian interface matches baseline and request.

## Constraints and acceptance
minSdk 26, compile/targetSdk 36; Java 17 bytecode, stable pinned dependencies. No Internet or broad media permissions. App-private storage, Android backups excluded; screenshots hidden by default with a user-controlled preference. Debug APK only unless a trustworthy private release key is supplied through secrets. Same applicationId does not guarantee update compatibility with the old exposed certificate; never recommend uninstalling before backup. Android 16 software emulator acceptance is evidence; physical POCO F6 remains manual without a connected device.
