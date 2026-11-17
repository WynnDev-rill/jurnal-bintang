# Physical acceptance checklist — POCO F6 / Android 16

This checklist is not a claim that a physical phone was tested. No POCO F6 is connected to this workspace. Install the delivered **debug** APK only after verifying a backup of any previous Aster installation; certificate mismatch may require a separate migration workflow and uninstalling loses local data.

- Airplane mode: launch, create text/checklist/reflection, immediate Back, background, force-stop/relaunch, rotate. Last confirmed writing persists; never call an in-flight unconfirmed write guaranteed durable.
- Search title/body/checklist/tag, sort, pin/favorite, assign folder/tag, rename/delete folder. Folder deletion keeps content. Archive/trash/restore preserves folder identity; permanent deletion has confirmation.
- Light/dark/system, 1.3 and 2.0 font scale, keyboard and gesture/three-button navigation, landscape, split-screen. No clipped primary controls; native Back follows the source collection.
- JSON export to Downloads; reopen/validate file, import into a clean test profile and reimport. Existing data is retained and repeated identical import adds no duplicates. Conflicting edited copies remain. Reject malformed/oversized images/backups without partial writes. Markdown is readable and explicitly describes image omission.
- Photo Picker cancellation, ordinary camera JPEG including EXIF rotation, inaccessible/corrupt/large image. No broad media permission; newly attached JPEG compression strips image metadata.
- Notification grant/deny/revoke, change reminder time, reboot, tap reminder. HyperOS battery policies can delay inexact reminders; no journal content appears in notification. Force-stop requires reopening Aster to schedule again.
- Default screen privacy blocks screenshot/recents; user can disable it for sharing and QA. Database is app-private, not custom encrypted. No network traffic/account/cloud behavior.
- Cold/warm launch, 100+ local notes, long note typing and scrolling; measure on physical hardware (software emulation cannot establish performance or high refresh-rate smoothness).
