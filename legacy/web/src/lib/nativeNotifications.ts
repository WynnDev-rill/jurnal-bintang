import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const DAILY_ID = 41001;
const WEEKLY_ID = 41002;
const CHANNEL_ID = "aster-journal-reminders";

async function ensurePermission() {
  if (!Capacitor.isNativePlatform()) return true;
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
    description: "Pengingat menulis dan ringkasan mingguan",
    importance: 4,
    visibility: 1,
    vibration: true,
    lights: true,
  });
}

function parseTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return { hour: 20, minute: 0 };
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export async function setDailyReminder(enabled: boolean, time = "20:00") {
  if (!Capacitor.isNativePlatform()) return { supported: false, enabled: false };
  await LocalNotifications.cancel({ notifications: [{ id: DAILY_ID }] });
  if (!enabled) return { supported: true, enabled: false };

  const granted = await ensurePermission();
  if (!granted) return { supported: true, enabled: false, denied: true };
  await ensureChannel();
  const { hour, minute } = parseTime(time);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_ID,
        title: "Waktunya menulis",
        body: "Luangkan beberapa menit untuk mencatat harimu di Aster Journal.",
        channelId: CHANNEL_ID,
        smallIcon: "ic_launcher",
        schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
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
  await ensureChannel();

  await LocalNotifications.schedule({
    notifications: [
      {
        id: WEEKLY_ID,
        title: "Ringkasan mingguan Aster",
        body: "Lihat kembali catatan, refleksi, dan pola harimu minggu ini.",
        channelId: CHANNEL_ID,
        smallIcon: "ic_launcher",
        schedule: { on: { weekday: 1, hour: 19, minute: 0 }, repeats: true, allowWhileIdle: true },
      },
    ],
  });
  return { supported: true, enabled: true };
}

export async function sendNotificationPreview() {
  if (!Capacitor.isNativePlatform()) return { supported: false };
  const granted = await ensurePermission();
  if (!granted) return { supported: true, denied: true };
  await ensureChannel();

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Math.floor(Date.now() % 100000),
        title: "Aster Journal",
        body: "Notifikasi aktif. Pengingatmu sudah siap.",
        channelId: CHANNEL_ID,
        smallIcon: "ic_launcher",
        schedule: { at: new Date(Date.now() + 1200) },
      },
    ],
  });
  return { supported: true };
}
