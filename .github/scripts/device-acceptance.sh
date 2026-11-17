#!/usr/bin/env bash
# Keep collection in one shell: the emulator action runs script lines separately.
set +e
./gradlew connectedDebugAndroidTest --no-daemon
aster_test_status=$?
adb pull /sdcard/Android/data/com.wynn.jurnalbintang/files/screenshots device-screenshots
adb shell am force-stop com.wynn.jurnalbintang
adb shell am start -W -n com.wynn.jurnalbintang/.MainActivity > device-startup.txt
adb shell dumpsys meminfo com.wynn.jurnalbintang > device-memory.txt
adb shell dumpsys gfxinfo com.wynn.jurnalbintang > device-frames.txt
exit "$aster_test_status"
