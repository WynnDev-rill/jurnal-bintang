import { Bell, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AsterMark } from "./Logo";
import { sendNotificationPreview } from "@/lib/nativeNotifications";

export function TopBar({
  title = "Aster Journal",
  subtitle,
  right,
  showDefaultActions = true,
  onSort,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  showDefaultActions?: boolean;
  onSort?: () => void;
  /** kept for compatibility; the shell handles stickiness now */
  sticky?: boolean;
}) {

  const testNotification = async () => {
    try {
      const result = await sendNotificationPreview();
      if (!result.supported) {
        toast.info("Notifikasi native tersedia pada APK Android.");
      } else if (result.denied) {
        toast.error("Izin notifikasi ditolak. Aktifkan dari pengaturan aplikasi.");
      } else {
        toast.success("Notifikasi percobaan dijadwalkan.");
      }
    } catch {
      toast.error("Notifikasi belum dapat dijalankan pada perangkat ini.");
    }
  };

  return (
    <header className="relative z-30 shrink-0 bg-card px-4 pb-3 pt-[calc(env(safe-area-inset-top)+14px)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
            <AsterMark className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-[21px] leading-tight tracking-tight-display text-foreground">
              {title}
            </h1>

            {subtitle && <p className="truncate text-[11.5px] text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {right}
          {showDefaultActions && (
            <>
              <button
                onClick={onSort}
                aria-label="Urutkan"
                className="press grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <SlidersHorizontal className="h-[19px] w-[19px]" />
              </button>
              <button
                onClick={testNotification}
                aria-label="Notifikasi"
                className="press grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <Bell className="h-[19px] w-[19px]" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
