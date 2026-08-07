import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, FolderClosed, NotebookPen, Sparkles, User } from "lucide-react";

const items = [
  { to: "/", label: "Catatan", Icon: NotebookPen },
  { to: "/reflection", label: "Refleksi", Icon: Sparkles },
  { to: "/folders", label: "Folder", Icon: FolderClosed },
  { to: "/insights", label: "Insight", Icon: BarChart3 },
  { to: "/profile", label: "Profil", Icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav aria-label="Navigasi utama" className="z-40 shrink-0 border-t border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="flex items-stretch px-1 pb-1 pt-1.5">
        {items.map(({ to, label, Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link to={to} aria-current={active ? "page" : undefined} className="press relative flex min-h-12 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium">
                <span className={`grid h-7 w-14 place-items-center rounded-full transition-all duration-300 ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                  <Icon aria-hidden="true" className={`h-[18px] w-[18px] transition-transform duration-300 ${active ? "scale-110" : ""}`} />
                </span>
                <span className={active ? "text-primary" : "text-muted-foreground"}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
