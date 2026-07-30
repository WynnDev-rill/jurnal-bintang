import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const DAILY_ID = 1001;
const WEEKLY_ID = 1002;
const CHANNEL_ID = "aster-journal-reminders";

async function ensurePermission() {
  if (!Capacitor.isNativePlatform()) return false;

  const current = await LocalNotifications.checkPermissions();
  if (current.display === "granted") return true;

  const requested = await LocalNotifications.requestPermissions();
  return requested.display === "granted";
}

async function ensureChannel() {
  if (Capacitor.getPlatform() !== "android") return;

  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: "Pengingat Aster Journal",
    description: "Pengingat menulis dan ringkasan mingguan Aster Journal",
    importance: 4,
    visibility: 1,
    vibration: true,
    lights: true,
  });
}

export async function setDailyReminder(enabled: boolean) {
  if (!Capacitor.isNativePlatform()) return { supported: false, enabled: false };

  await LocalNotifications.cancel({ notifications: [{ id: DAILY_ID }] });
  if (!enabled) return { supported: true, enabled: false };

  if (!(await ensurePermission())) {
    throw new Error("Izin notifikasi belum diberikan.");
  }

  await ensureChannel();
  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_ID,
        title: "Waktunya menulis",
        body: "Luangkan beberapa menit untuk mencatat hari ini.",
        channelId: CHANNEL_ID,
        smallIcon: "ic_stat_aster",
        schedule: {
          on: { hour: 20, minute: 0 },
          repeats: true,
          allowWhileIdle: true,
        },
      },
    ],
  });

  return { supported: true, enabled: true };
}

export async function setWeeklyDigest(enabled: boolean) {
  if (!Capacitor.isNativePlatform()) return { supported: false, enabled: false };

  await LocalNotifications.cancel({ notifications: [{ id: WEEKLY_ID }] });
  if (!enabled) return { supported: true, enabled: false };

  if (!(await ensurePermission())) {
    throw new Error("Izin notifikasi belum diberikan.");
  }

  await ensureChannel();
  await LocalNotifications.schedule({
    notifications: [
      {
        id: WEEKLY_ID,
        title: "Ringkasan mingguan Aster",
        body: "Lihat kembali catatan, refleksi, dan konsistensimu minggu ini.",
        channelId: CHANNEL_ID,
        smallIcon: "ic_stat_aster",
        schedule: {
          on: { weekday: 1, hour: 18, minute: 0 },
          repeats: true,
          allowWhileIdle: true,
        },
      },
    ],
  });

  return { supported: true, enabled: true };
}

export async function syncNativeReminders(daily: boolean, weekly: boolean) {
  if (!Capacitor.isNativePlatform()) return;
  await setDailyReminder(daily);
  await setWeeklyDigest(weekly);
}
