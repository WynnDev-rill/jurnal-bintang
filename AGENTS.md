<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project UI/UX skills
For any visual, mobile UX, interaction, or accessibility work in Aster Journal, read and apply both project-local skills before editing:

- `.agents/skills/ui-ux-pro-max/SKILL.md`
- `.agents/skills/mobile-ui-ux-designer/SKILL.md`

Aster is local-first. Never imply cloud sync, encryption, biometric protection, AI processing, or other trust-sensitive capabilities unless they are actually implemented in the repository.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. When the answer is under a Markdown heading, `graphify section "<heading>"` prints that section's text, so the .md need not be opened. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.

## Native Android authority (2026-11 redesign)
The shipping app is now `app/`, Kotlin + Jetpack Compose + Material 3, minSdk 26, compile/targetSdk 36. `legacy/web/` preserves the previous React/Capacitor source and migration format; never ship it inside the APK. Read PRODUCT.md, DESIGN.md, docs/research/NATIVE_REDESIGN_RESEARCH.md and the native design spec before changing behavior. Preserve the Lovable/history warning above. Never force-push or rewrite published history.

### Architecture and data safety
Room is the single source of truth. Notes include plain text, checklists and reflections, original timestamps, tags, mood, folder, archive/trash states and bounded image data. Keep folder identity separate from archive/trash. Use ViewModels/StateFlow, lifecycle-aware observation and IO-dispatched database/file work. Serialize autosave writes; do not say saved before Room succeeds. Preserve input on failure and flush before navigation. DataStore owns preferences; keep it a singleton. No destructive Room migration, main-thread database work, fake sample journal entries or logcat containing user content. Validate backup completely before atomic import; merge without overwriting existing user data. Add migrations and exported schemas for all future schema changes.

### Skills: one canonical project-local copy each
- `.agents/skills/ponytail/SKILL.md`: full by default; ultra for complex simplification/review. Never simplify data integrity, security, accessibility or explicit requirements away.
- `.agents/skills/ui-ux-pro-max/SKILL.md`: research, system and accessibility guidance. Use `python3 .agents/skills/ui-ux-pro-max/scripts/search.py 'state accessibility' --stack jetpack-compose`. Reject web-specific recommendations that don't fit native Android.
- `.agents/skills/impeccable/SKILL.md`: visual audit/polish/harden/animate, especially `reference/android.md`, `audit.native.md`, `adapt.native.md`. Native verification uses Android screenshots; the web detector is not a Compose audit.
- `.agents/skills/mobile-ui-ux-designer/SKILL.md`: preserve baseline usability/accessibility rules, translated to Compose semantics, 48dp and Android insets.
- `.codex/skills/graphify/SKILL.md`: locally installed upstream CLI skill. Run `tools/graph-refresh.sh` after structural edits; `graphify query 'autosave'` and `graphify explain 'EditorViewModel'` orient AI coding. Read exact source before editing; graph edges can be inferred. Do not index personal backups, signing material, build outputs or secrets. Pin version in `tools/requirements-graph.txt`.
User instructions, Android contracts and PRODUCT/DESIGN take precedence over skill defaults. Do not create duplicate adapters or install one skill globally and locally. Provenance/hashes are in `tools/skills-lock.json`; `python3 tools/verify-skills.py` verifies installation.

### Native design standard
Material 3 controls, semantic roles in both light/dark, bundled font roles, at least 48dp targets, meaningful content descriptions, no color-only state. Single create FAB; preserve source collection and Back behavior. Compact navigation bar/expanded rail. Respect status/navigation/cutout/IME insets, font scaling and system animation scale. Real empty/loading/error/recovery states; Indonesian copy. Never claim encryption, cloud sync or AI. No Internet permission or broad storage/media permission; SAF and Photo Picker only. App backups excluded by default; screenshot privacy is user-visible.

### Verification and build
JDK 21, Android SDK platform/build-tools 36, Gradle wrapper. Set ANDROID_HOME or local.properties (never commit local.properties). Run `./gradlew testDebugUnitTest lintDebug assembleDebug` and on emulator `./gradlew connectedDebugAndroidTest`. Meaningful unit tests cover parser/filtering; instrumentation covers Room and end-to-end Compose writing/navigation. Inspect light/dark, populated/empty, keyboard, Back, large font, compact/expanded. Check merged manifest permissions and `apksigner verify`. Save evidence in docs/verification; distinguish software emulator results from physical POCO F6. APK is debug unless signed through a trusted private key; no secrets or keystores committed. CI builds and uploads a labeled debug APK. Before replacing the old app export JSON and verify backup; certificate mismatch prevents direct update and uninstall removes local data.
