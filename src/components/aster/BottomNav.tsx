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
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px] border-t border-border/70 bg-background/92 pb-[calc(env(safe-area-inset-bottom)+6px)] shadow-[0_-10px_30px_rgba(7,13,24,0.10)] backdrop-blur-xl">
      <ul className="flex items-stretch pt-1">
        {items.map(({ to, label, Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className="press relative flex flex-col items-center gap-1 py-2 text-[10px] font-medium"
              >
                <span
                  className={`grid h-8 w-14 place-items-center rounded-full transition-all duration-300 ${
                    active ? "bg-primary/12 text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] transition-transform duration-300 ${
                      active ? "scale-110" : ""
                    }`}
                  />
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
