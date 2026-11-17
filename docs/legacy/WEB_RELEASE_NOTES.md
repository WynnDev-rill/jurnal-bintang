# Aster Journal Android release

## Reliability hardening update

- Catatan now auto-save while being written; the check button simply finishes the editor.
- Reflection drafts are persisted locally and can be resumed after closing the composer or reopening the app.
- A clear warning appears if local storage cannot safely persist the latest change.
- Image attachments are recompressed and capped for realistic local-first storage use.
- The Insights streak now reflects any meaningful writing, not only entries created as the Journal type.
- Returning from a note inside a folder, archive, trash, or favorite collection preserves that collection context.
- Settings no longer advertises biometric locking before it exists; privacy and backup guidance is shown directly instead.

- App name: Aster Journal
- Package ID remains `com.wynn.jurnalbintang` so future APKs can update the same installation.
- APK artifact: `Aster-Journal-APK`
- Launcher icon uses an adaptive vector with extra safe-area padding.
