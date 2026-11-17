# Native Aster Journal Implementation Plan

> Execution: native in this session, following superpowers:executing-plans. User authorized independent end-to-end execution.

**Goal:** Installable private Android notebook with useful guided reflection and reliable local persistence.
**Architecture:** Single activity Compose UI, Navigation, screen ViewModels, Room and DataStore. Native platform APIs for photos/documents/reminders.
**Tech Stack:** Kotlin, Material 3, Room/KSP, Lifecycle, coroutines, AndroidX tests/JUnit.
**Spec:** docs/superpowers/specs/2026-11-17-native-android-design.md

## Global Constraints
minSdk 26; compile/targetSdk 36; package com.wynn.jurnalbintang; no Internet permission; no cloud/encryption claims; preserve history; never reuse exposed signing material; produce clearly labeled debug APK.

## Review Focus
- Immediate Back/background/recreation during writing: latest input retained and save failures visible.
- Malformed/oversized/duplicate/legacy backup: atomic validation, no overwrite or partial import.
- Trash/archive/folder boundaries: recoverable actions retain folder context and do not pollute active lists.
- Large text/keyboard/dark/system navigation: content and primary actions stay reachable.
- Denied notification/photo/document permissions or IO failures: no crash, no false success.

## Tasks
- [ ] Audit/research/skills: preserve baseline, inspect supplied visuals and four comparable apps, install pinned skill resources, verify commands and local Kotlin graph.
- [ ] Native build/data: Gradle wrapper, SDK 36, Room schema, converters and DAO; tests for filters/word counts/prompts/backup and Room persistence/transactions.
- [ ] Writing: build library/editor/checklist/photo flow with serialized autosave and recovery. Test create/edit/back/reopen and draft recreation.
- [ ] Reflection/organization: prompt categories/daily prompt/mood, folder CRUD, favorites/archive/trash, useful empty states and Android Back.
- [ ] Settings/ownership: theme preferences, privacy screen flag, inexact local reminder, JSON/legacy import and Markdown/JSON export with SAF and error recovery.
- [ ] Acceptance: run unit tests/lint/build/instrumentation, inspect real Android light/dark/editor/font-scale/tablet captures, fix findings, verify APK certificate/permissions and graph query/update. Save evidence, SHA256, build/install instructions and CI; make safe local commits.

## Commands
`./gradlew testDebugUnitTest lintDebug assembleDebug`; `./gradlew connectedDebugAndroidTest`; `tools/graph-refresh.sh`; `python3 tools/verify-skills.py`; `adb install -r app/build/outputs/apk/debug/app-debug.apk` on compatible test installation. Expected: green checks and explicit evidence for any unavailable physical tests.
