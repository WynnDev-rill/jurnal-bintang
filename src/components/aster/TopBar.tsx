import { AsterFlower } from "./Logo";

export function TopBar({
  title = "Aster Journal",
  subtitle,
  right,
  showWatermark = true,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  showWatermark?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary animate-pop">
          <AsterFlower className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h1 className="truncate font-display text-[19px] leading-tight text-foreground">
              {title}
            </h1>
            {showWatermark && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-[2px] text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                By Wynn
              </span>
            )}
          </div>
          {subtitle && (
            <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
