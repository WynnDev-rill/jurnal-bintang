#!/usr/bin/env bash
# Keep collection in one shell: the emulator action runs script lines separately.
set +e
./gradlew connectedDebugAndroidTest --no-daemon
aster_test_status=$?
adb pull /sdcard/Pictures/AsterJournalAcceptance device-screenshots
# AGP tears down the test installation; reinstall only for a cold-start diagnostic.
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am force-stop com.wynn.jurnalbintang
adb shell am start -W -n com.wynn.jurnalbintang/.MainActivity > device-startup.txt
adb shell dumpsys meminfo com.wynn.jurnalbintang > device-memory.txt
adb shell dumpsys gfxinfo com.wynn.jurnalbintang > device-frames.txt
exit "$aster_test_status"
