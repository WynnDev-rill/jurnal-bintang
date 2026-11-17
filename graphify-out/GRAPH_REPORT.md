# Graph Report - aster-journal  (2026-11-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 438 nodes · 876 edges · 19 communities (8 shown, 11 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a48f21ce`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 14
- Community 15

## God Nodes (most connected - your core abstractions)
1. `Note` - 36 edges
2. `EditorContent()` - 17 edges
3. `Folder` - 16 edges
4. `with` - 15 edges
5. `JournalDao` - 14 edges
6. `SettingsScreen()` - 13 edges
7. `AsterApp()` - 13 edges
8. `LibraryScreen()` - 13 edges
9. `EditorViewModel` - 12 edges
10. `Backup` - 12 edges

## Surprising Connections (you probably didn't know these)
- `AsterApplication` --calls--> `JournalRepository`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/AsterApplication.kt → app/src/main/java/com/wynn/jurnalbintang/data/AsterDatabase.kt
- `DraftState` --references--> `Note`  [EXTRACTED]
  app/src/main/java/com/wynn/jurnalbintang/data/DraftSession.kt → app/src/main/java/com/wynn/jurnalbintang/data/Note.kt
- `EditorContent()` --calls--> `CheckItem`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/ui/EditorScreen.kt → app/src/main/java/com/wynn/jurnalbintang/data/Note.kt
- `AsterApp()` --calls--> `Note`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/ui/AsterApp.kt → app/src/main/java/com/wynn/jurnalbintang/data/Note.kt
- `AsterApp()` --calls--> `SettingsScreen()`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/ui/AsterApp.kt → app/src/main/java/com/wynn/jurnalbintang/ui/SettingsScreen.kt

## Import Cycles
- None detected.

## Communities (19 total, 11 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (5): Destination, DataAction(), SettingsScreen(), SettingsSection(), SettingSwitch()

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (10): AsterApplication, DraftState, Preferences, Settings, BootReceiver, ReminderReceiver, Reminders, LibraryState (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (23): AsterApp(), CollectionRow(), CollectionsScreen(), AsterMark(), BackHeader(), BrandHeader(), dateLabel(), EmptyState() (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (8): PhotoTest, encode(), noteJson(), validateNote(), checkedImageSize(), Photos, NotePhoto(), EditorViewModel

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (38): concurrency, cancel-in-progress, group, runs-on, steps, timeout-minutes, jobs, device-tests (+30 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (11): Backup, CheckItem, filterNotes(), Folder, Note, Prompt, wordCount(), Prompts (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (4): AsterDatabase, Converters, JournalDao, JournalRepository

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (3): MainActivity, LaunchRequest, AsterTheme()

## Knowledge Gaps
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Note` connect `Community 6` to `Community 1`, `Community 2`, `Community 3`, `Community 7`, `Community 8`, `Community 9`, `Community 11`?**
  _High betweenness centrality (0.232) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `Note` (e.g. with `.conflictingImportDoesNotOverwriteAndIsIdempotent()` and `.persistedWritingSurvivesReopenAndFolderRemovalKeepsContent()`) actually correct?**
  _`Note` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.057912457912457915 - nodes in this community are weakly interconnected._
- **Why does `AsterApp()` connect `Community 2` to `Community 0`, `Community 10`, `Community 6`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05656108597285068 - nodes in this community are weakly interconnected._
- **Why does `LibraryState` connect `Community 1` to `Community 0`, `Community 2`, `Community 6`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07653061224489796 - nodes in this community are weakly interconnected._