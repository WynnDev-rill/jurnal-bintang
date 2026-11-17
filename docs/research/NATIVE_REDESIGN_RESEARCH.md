# Native redesign: audit, research and asset selection
Date: 2026-11-17. Source baseline: 2b5c87e. Repository discovered through the connected GitHub account and cloned from https://github.com/WynnDev-rill/jurnal-bintang. Workspace initially had no checkout.

## Repository audit
The prior product is ~2,856 lines of app-specific TSX/TS plus a generic Radix component library. Six routes: notes, reflection, folders, insights, profile, root. React 19/TanStack/Vite 8; Capacitor config points at jurnal-bintang.vercel.app. Data is a full JSON object in localStorage, with 400ms editor autosave and reflection draft recovery. No checked-in Android project, Gradle wrapper, Room schema, native unit tests or UI tests. Existing features worth retaining: checklists, moods, daily prompts, folders, pin/favorite, recoverable note trash, archive, JSON/Markdown export, reminders and honest privacy copy. Risks: remote-site dependency in APK, storage quota and whole-state writes, direct reflection deletion, backup replaces all content, native notification dependence on web bridge, no native verification, embedded signing material in CI. That old signing material is treated as exposed, removed from active workflow, and not reused; rotate it outside this development session. Git history is preserved, never rewritten. Legacy web source remains in legacy/web for migration/reference, excluded from native APK.

## Supplied visual references (retrieved and visually inspected)
- [Modern Note-Taking App](https://dribbble.com/shots/26259906-Modern-Note-Taking-App-UI-Clean-Minimal-Mobile-Design), Agil Juwita Puri: white/icy blue surfaces, large search, a single clear create action, typed content and structured folders. Adopt scanability; avoid a taxonomy of seldom-used media types.
- [Betwixt Journal](https://dribbble.com/shots/16945102-Betwixt-Journal), Flod/GogoApps: reflective serif typography, deep blue/purple atmosphere, emotional prompts and thoughtful reading pace. Adopt intimacy and prompt depth, retain practical Android contrast and controls.
- [Notes.io](https://www.behance.net/gallery/107508941/Notesio-Note-taking-App-UI-Kit), Satadal Mazumdar: dark notebooks, pins, labels and quick creation. Adopt clear organization and first-class dark mode. The page explicitly reserves copyright; no artwork copied into app.

## Comparable mature applications
This is a source-backed product comparison, not hands-on testing or a claim of objective ranking. Weaknesses below are fit/tradeoff assessments.

| Product and official source | Strength | Tradeoff for Aster's task | Quality standard adopted |
|---|---|---|---|
| [Day One](https://dayoneapp.com/) / [Android listing](https://play.google.com/store/apps/details?id=com.dayoneapp.dayone) | Prompts, templates, search, readable exports, data ownership, mature privacy features | Cloud/media/subscription breadth is beyond a fast private local notebook | Start from a useful prompt; export remains accessible; do not copy encryption claims |
| [Journey](https://journey.cloud/) | Journal/calendar, emotional reflection, multimedia and cross-platform review | More integrations and cloud architecture create maintenance/attention cost | Optional mood and reflection history; focused local navigation |
| [Google Keep](https://workspace.google.com/products/keep/) | Very fast capture, lists, offline editing, familiar Android actions | Not designed primarily for deeper guided reflection; Google account/sync differs from local-only ownership | One clear create action, checklists, pins, search and recoverable trash |
| [Standard Notes](https://standardnotes.com/) | Offline copy, explicit ownership, backups and strong published privacy model | Encryption/sync architecture is a much larger scope; not a reflective prompt experience | Truthful privacy copy, reliable persistence, no analytics, portable backup |

## Asset-first evaluation before native implementation
| Candidate | License / compatibility | Decision |
|---|---|---|
| AndroidX Compose/Material 3, Room, DataStore, Lifecycle, Navigation | Apache-2.0; first-party Android APIs, pinned stable versions | Adopt rather than custom UI toolkit, SQL persistence, preference engine or navigation stack |
| Android Photo Picker, SAF, AlarmManager, NotificationManager | Android platform, no extra runtime license/dependency | Adopt for photos, backup documents, daily optional inexact reminder |
| [Fossify Notes](https://github.com/FossifyOrg/Notes) | GPL-3.0; native note app, architecture/product reference | Evaluate as mature alternative, no copied source: whole-app import brings license/product mismatch |
| [Joplin](https://github.com/laurent22/joplin) | AGPL-3.0, React Native | Evaluate patterns; unsuitable for explicit Kotlin/Compose requirement, no copied code |
| [DM Serif Display](https://github.com/google/fonts/tree/main/ofl/dmserifdisplay), [Plus Jakarta Sans](https://github.com/google/fonts/tree/main/ofl/plusjakartasans) | SIL OFL 1.1; bundled local fonts | Adopt with license files; no network font loading |
| Existing Aster icon | Already committed repository asset; original provenance beyond baseline unspecified | Reuse; do not claim new ownership/license |
| Third-party rich text editor, remote AI, cloud sync, custom crypto | Additional complexity, data/trust surface and daily-use cost | Omit; native text/checklist/reflection editor meets present goals |

## Skill integration and conflict resolution
Ponytail full is default; ultra is supported for complex simplification/review without cutting requested features, validation or data safety. UI/UX Pro Max supplies research/data and accessibility guidance; Impeccable supplies native critique/polish. PRODUCT.md, DESIGN.md, Android Material and the user's explicit brief override web-biased recommendations. Its initial broad design-system query returned a marketing layout, which was rejected as inapplicable. A targeted Compose query verified state restoration/content descriptions/semantics. A keyboard query returned no match; Android insets documentation is the fallback, not a fabricated skill match. Full upstream skill resources replace the older tiny adapter without creating parallel duplicate skills. Graphify uses deterministic local AST extraction, including Kotlin, and never sends code or personal data to an LLM.
