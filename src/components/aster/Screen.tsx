import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] bg-background pb-24">
      {children}
      <BottomNav />
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-5 flex items-center justify-between px-4">
      <h2 className="font-display text-[15px] text-foreground">{children}</h2>
      {action}
    </div>
  );
}
