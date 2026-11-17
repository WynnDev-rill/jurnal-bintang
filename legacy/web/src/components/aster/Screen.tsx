import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

/**
 * App shell: full-height flex column so headers stay fixed and only the
 * <Scroll> region scrolls. Bottom nav is part of the column (safe-area aware).
 */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex h-[100svh] w-full max-w-[520px] flex-col overflow-hidden bg-background">
      {children}
      <BottomNav />
    </div>
  );
}

/** The single scrollable region of a screen. */
export function Scroll({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`no-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
  tight,
}: {
  children: ReactNode;
  action?: ReactNode;
  tight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 ${tight ? "mb-2 mt-4" : "mb-2.5 mt-5"}`}
    >
      <h2 className="min-w-0 truncate font-display text-[16px] tracking-tight-display text-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function LinkAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="press shrink-0 text-[12.5px] font-semibold text-primary hover:opacity-80"
    >
      {children}
    </button>
  );
}

/** Premium empty state — never shows fake sample content. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  compact,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/60 px-6 text-center animate-fade-up ${
        compact ? "py-8" : "py-12"
      }`}
    >
      <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/8 text-primary">
        {icon}
      </span>
      <p className="mt-4 font-display text-[17px] tracking-tight-display">{title}</p>
      <p className="mt-1.5 max-w-[280px] text-[12.5px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
