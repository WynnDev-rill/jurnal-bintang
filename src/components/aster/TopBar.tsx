import { Bell, SlidersHorizontal } from "lucide-react";
import { AsterMark } from "./Logo";

export function TopBar({
  title = "Aster Journal",
  subtitle,
  right,
  showWatermark = true,
  showDefaultActions = true,
  onSort,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  showWatermark?: boolean;
  showDefaultActions?: boolean;
  onSort?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 px-4 pb-3 pt-3.5 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center text-primary animate-bounce-in">
          <AsterMark className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <h1 className="truncate font-display text-[22px] leading-tight tracking-tight-display text-foreground">
              {title}
            </h1>
            {showWatermark && (
              <span className="shrink-0 font-display text-[10px] italic text-muted-foreground/70">
                by Wynn
              </span>
            )}
          </div>
          {subtitle && <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>

        {right}

        {showDefaultActions && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={onSort}
              aria-label="Urutkan"
              className="press grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <SlidersHorizontal className="h-[19px] w-[19px]" />
            </button>
            <button
              aria-label="Notifikasi"
              className="press relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <Bell className="h-[19px] w-[19px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background animate-sparkle" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
