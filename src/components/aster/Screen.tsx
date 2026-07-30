import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[520px] overflow-x-hidden bg-background pb-28">
      {children}
      <BottomNav />
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
      className={`flex items-center justify-between px-4 ${tight ? "mb-2 mt-4" : "mb-2.5 mt-5"}`}
    >
      <h2 className="font-display text-[16px] tracking-tight-display text-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function LinkAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="press text-[12.5px] font-semibold text-primary hover:opacity-80"
    >
      {children}
    </button>
  );
}
