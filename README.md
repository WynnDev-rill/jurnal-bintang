# Aster Journal · Native Android

A calm, local-first notebook and guided journal, built in **Kotlin + Jetpack Compose + Material 3**. The shipping APK contains native Android UI and local Room storage, with no WebView, account, server, analytics, or Internet permission.

## Download
[Download Aster Journal 3.0.0 — debug APK](https://raw.githubusercontent.com/WynnDev-rill/jurnal-bintang/fd0274d28f9a4547271db56921a41ed5dec82703/artifacts/Aster-Journal-3.0.0-debug.apk). This is a debug prerelease; back up the previous installation first. See the [final verification report](docs/verification/FINAL_REPORT.md) for source/CI evidence and physical-device limits.

## Daily use
- Text notes, checklists and reflection entries with serialized autosave and honest pending/error states.
- Thirty thoughtful prompts in six themes, each with two optional follow-up questions. Mood is optional.
- Search title/body/prompt/tags/checklists; pin, favorite, folders/tags, sorting, archive and recoverable trash.
- Optional bounded photos through Android Photo Picker, native text sharing and receiving shared text.
- System/light/dark themes, large-text support, keyboard insets and compact navigation/expanded rail.
- Screenshot/recents privacy enabled by default; optional inexact daily local reminder.
- Versioned JSON backup, non-destructive merge import (including old Aster web JSON), and readable Markdown export through Android's document picker.

## Build and install
JDK 21, Android SDK platform 36 and build-tools 36.0.0. `ANDROID_HOME` must point to the SDK, or put `sdk.dir=/your/sdk/path` in untracked `local.properties`.

```sh
./gradlew testDebugUnitTest lintDebug assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
./gradlew connectedDebugAndroidTest
```

The artifact is an **installable debug APK**, not a production-signed release. GitHub Actions builds/tests it and uploads `Aster-Journal-native-debug`. Debug certificates are local to the build machine; APKs from different machines may not update one another. Release signing must use a trustworthy private keystore supplied outside Git (for example GitHub Secrets). Historical embedded signing material was removed from the active workflow and must be rotated; it is not reused.

## Migrating from the previous app
**Export and verify a JSON backup from the old Aster app before replacing/uninstalling it.** The package remains `com.wynn.jurnalbintang`, but certificate mismatch can prevent an in-place update. Uninstalling removes local data. The native app cannot directly read the remote website's localStorage; use Setelan → Impor cadangan Aster. Import preserves notes, checklists, tags, folders, archive/trash, reflections, reflection draft and supported embedded photos. It keeps the existing native data and creates a conflict copy when IDs differ in content. Re-importing identical data is idempotent. Old profile/reminder settings are not imported to silently enable permissions. Legacy `journal` notes become normal notes; reflection records remain reflections.

## Privacy and limits
Room and preferences are app-private; Android automatic backup/device transfer is excluded. There is no custom database encryption or biometric lock. Use Android's device lock. Exports are plaintext; store them securely. Keep a verified backup: deleting app data/uninstalling without one cannot be undone. Photos accept up to 12 MiB input, sampled and compressed to at most 600 KiB per new image. Imports accept legacy images up to 700 KiB, 16 MiB JSON, 10,000 notes, 1,000 folders, 500 checklist items/note and 200,000 body characters/note and a 1.5 MB aggregate serialized-note budget to keep Room cursor reads reliable. Imported images are additionally limited to 4096 pixels per edge and 8 megapixels. If a dataset outgrows JSON capacity, JSON export reports an error without changing notes; Markdown remains a text-only export. There is no partial JSON export. Preserve original photos separately and keep verified periodic backups before accumulating large attachments. User content is never placed in navigation routes or logs. Reminders may be delayed by Android/HyperOS battery policies; force-stop requires reopening the app.

## Development
Read [AGENTS.md](AGENTS.md), [product](PRODUCT.md), [design system](DESIGN.md), [research](docs/research/NATIVE_REDESIGN_RESEARCH.md), and [verification](docs/verification/PROGRESS.md). The old React/Capacitor implementation is preserved in `legacy/web/` for reference; it is not part of the APK or current CI. Git history is retained without force pushes.

Ponytail `full`, UI/UX Pro Max and Impeccable have one canonical project-local installation each; provenance is pinned in `tools/skills-lock.json`. Graphify 0.9.111 is installed as a CLI/Codex skill:

```sh
uv tool install 'graphifyy[watch]==0.9.111'
python3 tools/verify-skills.py
./tools/graph-refresh.sh
graphify query 'EditorViewModel autosave Room' --budget 1500
graphify explain 'DraftSession'
python3 -m http.server 8000 --directory graphify-out
```

Open `graphify-out/graph.html` for the interactive repository graph; `GRAPH_REPORT.md` and `graph.json` are also committed. Extraction is local AST only, has no LLM/API cost, and excludes legacy/vendor skills, build outputs, backups and secrets. Some Kotlin grammar constructs are only partially modeled; use source and compiler/test evidence as authority. `graphify update .` refreshes incrementally; `tools/graph-refresh.sh` rebuilds deterministically and recreates visualization. See [tooling](docs/TOOLING.md) for watch/AI guidance.
