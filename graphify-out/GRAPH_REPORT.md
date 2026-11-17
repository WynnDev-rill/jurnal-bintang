# Graph Report - aster-journal  (2026-11-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 410 nodes · 824 edges · 18 communities (8 shown, 10 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d064ade8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 14

## God Nodes (most connected - your core abstractions)
1. `Note` - 34 edges
2. `EditorContent()` - 17 edges
3. `Folder` - 16 edges
4. `JournalDao` - 14 edges
5. `AsterApp()` - 13 edges
6. `LibraryScreen()` - 13 edges
7. `SettingsScreen()` - 13 edges
8. `Backup` - 12 edges
9. `EditorViewModel` - 12 edges
10. `with` - 12 edges

## Surprising Connections (you probably didn't know these)
- `EditorContent()` --calls--> `CheckItem`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/ui/EditorScreen.kt → app/src/main/java/com/wynn/jurnalbintang/data/Note.kt
- `DraftState` --references--> `Note`  [EXTRACTED]
  app/src/main/java/com/wynn/jurnalbintang/data/DraftSession.kt → app/src/main/java/com/wynn/jurnalbintang/data/Note.kt
- `AsterApp()` --calls--> `Note`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/ui/AsterApp.kt → app/src/main/java/com/wynn/jurnalbintang/data/Note.kt
- `AsterApplication` --calls--> `JournalRepository`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/AsterApplication.kt → app/src/main/java/com/wynn/jurnalbintang/data/AsterDatabase.kt
- `AsterApp()` --calls--> `SettingsScreen()`  [INFERRED]
  app/src/main/java/com/wynn/jurnalbintang/ui/AsterApp.kt → app/src/main/java/com/wynn/jurnalbintang/ui/SettingsScreen.kt

## Import Cycles
- None detected.

## Communities (18 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (23): AsterApp(), CollectionRow(), CollectionsScreen(), AsterMark(), BackHeader(), BrandHeader(), dateLabel(), EmptyState() (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (4): DataAction(), SettingsScreen(), SettingsSection(), SettingSwitch()

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (14): Backup, encode(), noteJson(), validateNote(), CheckItem, filterNotes(), Folder, Note (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (9): AsterApplication, DraftState, Preferences, Settings, BootReceiver, ReminderReceiver, Reminders, LibraryState (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (6): checkedImageSize(), Documents, readBounded(), Photos, NotePhoto(), EditorViewModel

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (35): concurrency, cancel-in-progress, group, runs-on, steps, timeout-minutes, jobs, device-tests (+27 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (4): AsterDatabase, Converters, JournalDao, JournalRepository

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (4): MainActivity, Destination, LaunchRequest, AsterTheme()

## Knowledge Gaps
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Note` connect `Community 2` to `Community 0`, `Community 3`, `Community 5`, `Community 7`, `Community 9`, `Community 10`, `Community 11`?**
  _High betweenness centrality (0.209) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `Note` (e.g. with `.conflictingImportDoesNotOverwriteAndIsIdempotent()` and `.persistedWritingSurvivesReopenAndFolderRemovalKeepsContent()`) actually correct?**
  _`Note` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07673469387755102 - nodes in this community are weakly interconnected._
- **Why does `AsterApp()` connect `Community 0` to `Community 8`, `Community 1`, `Community 2`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Why does `LibraryState` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09513742071881606 - nodes in this community are weakly interconnected._