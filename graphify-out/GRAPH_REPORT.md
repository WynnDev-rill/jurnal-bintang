# Graph Report - aster-journal  (2026-11-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 352 nodes · 647 edges · 20 communities (7 shown, 13 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 66 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `12b02b02`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 16

## God Nodes (most connected - your core abstractions)
1. `Note` - 30 edges
2. `EditorContent()` - 17 edges
3. `JournalDao` - 14 edges
4. `Folder` - 14 edges
5. `AsterApp()` - 14 edges
6. `EditorViewModel` - 13 edges
7. `LibraryScreen()` - 13 edges
8. `SettingsScreen()` - 13 edges
9. `with` - 12 edges
10. `Backup` - 11 edges

## Surprising Connections (you probably didn't know these)
- `AsterApplication` --calls--> `JournalRepository`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/AsterApplication.kt → app/src/main/java/com/wynn/jurnalbintang/data/AsterDatabase.kt
- `EditorContent()` --calls--> `CheckItem`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/ui/EditorScreen.kt → app/src/main/java/com/wynn/jurnalbintang/data/Note.kt
- `DraftState` --references--> `Note`  [EXTRACTED]
  app/src/main/java/com/wynn/jurnalbintang/data/DraftSession.kt → app/src/main/java/com/wynn/jurnalbintang/data/Note.kt
- `AsterApp()` --calls--> `Note`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/ui/AsterApp.kt → app/src/main/java/com/wynn/jurnalbintang/data/Note.kt
- `AsterApp()` --calls--> `SettingsScreen()`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/ui/AsterApp.kt → app/src/main/java/com/wynn/jurnalbintang/ui/SettingsScreen.kt

## Import Cycles
- None detected.

## Communities (20 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (23): AsterApp(), CollectionRow(), CollectionsScreen(), AsterMark(), BackHeader(), BrandHeader(), dateLabel(), EmptyState() (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (35): concurrency, cancel-in-progress, group, runs-on, steps, timeout-minutes, jobs, device-tests (+27 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (4): AsterDatabase, Converters, JournalDao, JournalRepository

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (6): AsterApplication, Preferences, Settings, BootReceiver, ReminderReceiver, Reminders

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (10): CheckItem, filterNotes(), Folder, Note, Prompt, wordCount(), Prompts, BackupCodecTest (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (8): Backup, decode(), encode(), noteJson(), Documents, readBounded(), Photos, NotePhoto()

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (7): DraftState, LibraryState, reload(), DataAction(), SettingsScreen(), SettingsSection(), SettingSwitch()

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Note` connect `Community 5` to `Community 0`, `Community 3`, `Community 6`, `Community 7`, `Community 9`, `Community 11`, `Community 13`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `Note` (e.g. with `.conflictingImportDoesNotOverwriteAndIsIdempotent()` and `.persistedWritingSurvivesReopenAndFolderRemovalKeepsContent()`) actually correct?**
  _`Note` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07890070921985816 - nodes in this community are weakly interconnected._
- **Why does `AsterApp()` connect `Community 0` to `Community 1`, `Community 5`, `Community 7`, `Community 8`, `Community 9`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `EditorContent()` (e.g. with `CheckItem` and `wordCount()`) actually correct?**
  _`EditorContent()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10158730158730159 - nodes in this community are weakly interconnected._
- **Why does `LibraryState` connect `Community 7` to `Community 0`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._