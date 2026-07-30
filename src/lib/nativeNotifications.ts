import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const DAILY_ID = 41001;
const WEEKLY_ID = 41002;

async function ensurePermission() {
  if (!Capacitor.isNativePlatform()) return true;
  const current = await LocalNotifications.checkPermissions();
  if (current.display === "granted") return true;
  const requested = await LocalNotifications.requestPermissions();
  return requested.display === "granted";
}

export async function setDailyReminder(enabled: boolean) {
  if (!Capacitor.isNativePlatform()) return { supported: false, enabled: false };

  await LocalNotifications.cancel({ notifications: [{ id: DAILY_ID }] });
  if (!enabled) return { supported: true, enabled: false };

  const granted = await ensurePermission();
  if (!granted) return { supported: true, enabled: false, denied: true };

  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_ID,
        title: "Waktunya menulis",
        body: "Luangkan beberapa menit untuk mencatat harimu di Aster Journal.",
        schedule: { on: { hour: 20, minute: 0 }, repeats: true, allowWhileIdle: true },
        smallIcon: "ic_stat_aster",
        iconColor: "#6AA7E8",
      },
    ],
  });

  return { supported: true, enabled: true };
}

export async function setWeeklyDigest(enabled: boolean) {
  if (!Capacitor.isNativePlatform()) return { supported: false, enabled: false };

  await LocalNotifications.cancel({ notifications: [{ id: WEEKLY_ID }] });
  if (!enabled) return { supported: true, enabled: false };

  const granted = await ensurePermission();
  if (!granted) return { supported: true, enabled: false, denied: true };

  await LocalNotifications.schedule({
    notifications: [
      {
        id: WEEKLY_ID,
        title: "Ringkasan mingguan Aster",
        body: "Lihat kembali catatan, refleksi, dan pola harimu minggu ini.",
        schedule: { on: { weekday: 1, hour: 19, minute: 0 }, repeats: true, allowWhileIdle: true },
        smallIcon: "ic_stat_aster",
        iconColor: "#6AA7E8",
      },
    ],
  });

  return { supported: true, enabled: true };
}

export async function sendNotificationPreview() {
  if (!Capacitor.isNativePlatform()) return { supported: false };
  const granted = await ensurePermission();
  if (!granted) return { supported: true, denied: true };

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now() % 100000,
        title: "Aster Journal",
        body: "Notifikasi aktif. Pengingatmu akan tampil menggunakan identitas Aster Journal.",
        schedule: { at: new Date(Date.now() + 1200) },
        smallIcon: "ic_stat_aster",
        iconColor: "#6AA7E8",
      },
    ],
  });
  return { supported: true };
}
