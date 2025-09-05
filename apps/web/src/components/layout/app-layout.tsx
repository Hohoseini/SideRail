import * as React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  X,
  TrainFront,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/users", label: "Users", icon: Users, end: false },
  { to: "/activity", label: "Activity Log", icon: ScrollText, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
];

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-base border-2 border-border bg-main text-mtext neo-shadow">
        <Zap className="h-5 w-5" fill="currentColor" />
      </div>
      <div className="leading-tight">
        <div className="font-heading text-lg tracking-tight">SideRail</div>
        <div className="text-[10px] uppercase tracking-widest text-text/60">Xray Panel</div>
      </div>
    </div>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-2">
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-base border-2 border-transparent px-3 py-2.5 font-heading text-sm transition-all",
              isActive
                ? "border-border bg-main text-mtext neo-shadow"
                : "text-text/80 hover:border-border hover:bg-bw hover:text-text",
            )
          }
        >
          <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const { username, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 grid-dots" />
      <div className="relative flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-border bg-bw/60 p-4 backdrop-blur lg:flex">
          <div className="px-2 py-2">
            <Brand />
          </div>
          <div className="mt-6 flex-1">
            <NavItems />
          </div>
          <SidebarFooter username={username} onLogout={logout} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-border bg-bg/80 px-4 backdrop-blur lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Button
                variant="neutral"
                size="icon"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Brand />
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <TrainFront className="h-4 w-4 text-text/60" />
              <span className="text-sm font-base text-text/60">
                Deployed on Railway · Xray-core
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-heading sm:block">{username}</span>
              <div className="grid h-9 w-9 place-items-center rounded-base border-2 border-border bg-main text-mtext font-heading uppercase">
                {(username || "A").slice(0, 1)}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8">
            <div className="mx-auto max-w-7xl animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 border-r-2 border-border bg-bg p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <Brand />
              <Button variant="neutral" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-6">
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="absolute inset-x-4 bottom-4">
              <SidebarFooter username={username} onLogout={logout} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarFooter({
  username,
  onLogout,
}: {
  username: string | null;
  onLogout: () => Promise<void>;
}) {
  return (
    <div className="mt-4 rounded-base border-2 border-border bg-bg/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-base border-2 border-border bg-main text-mtext font-heading uppercase">
          {(username || "A").slice(0, 1)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-heading">{username || "admin"}</div>
          <div className="text-[10px] uppercase tracking-widest text-text/50">Administrator</div>
        </div>
      </div>
      <Button variant="neutral" size="sm" className="w-full" onClick={() => void onLogout()}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
