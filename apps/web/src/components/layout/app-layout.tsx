import * as React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Router,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  X,
  Github,
  Crown,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { GitHubButton, useGitHubStars } from "@/components/github-button";
import { VersionBadge } from "@/components/version-badge";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { PANEL_VERSION } from "@/lib/brand";
import { Star, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RailLogo } from "@/components/rail-logo";
import { AnimatedBackground } from "@/components/animated-background";

const GITHUB_URL = "https://github.com/icubaby/SideRail";

import type { Permission } from "@/lib/types";

const nav: { to: string; label: string; icon: typeof LayoutDashboard; end: boolean; perm: Permission }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, perm: "dashboard" },
  { to: "/users", label: "Users", icon: Users, end: false, perm: "users" },
  { to: "/inbounds", label: "Inbounds", icon: Router, end: false, perm: "inbounds" },
  { to: "/activity", label: "Activity Log", icon: ScrollText, end: false, perm: "activity" },
  { to: "/settings", label: "Settings", icon: Settings, end: false, perm: "settings" },
];

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-base border-2 border-border bg-main text-mtext neo-shadow">
        <RailLogo className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="font-heading text-lg tracking-tight">SideRail</div>
        <div className="text-[10px] uppercase tracking-widest text-text/60">icubaby</div>
      </div>
    </div>
  );
}

function NavItems({
  onNavigate,
  can,
}: {
  onNavigate?: () => void;
  can: (perm: Permission) => boolean;
}) {
  return (
    <nav className="flex flex-col gap-2">
      {nav
        .filter((item) => can(item.perm))
        .map((item) => (
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
  const { username, logout, can, admin } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-border bg-bw/60 p-4 backdrop-blur lg:flex">
          <div className="px-2 py-2">
            <Brand />
          </div>
          <div className="mt-6 flex-1">
            <NavItems can={can} />
          </div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="mb-2 flex items-center justify-between gap-2 rounded-base border-2 border-border bg-bg/50 px-3 py-2.5 font-heading text-sm text-text/80 transition-all hover:bg-main hover:text-mtext hover:neo-shadow"
          >
            <span className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub
            </span>
            <StarCount />
          </a>
          <a
            href={`${GITHUB_URL}/releases`}
            target="_blank"
            rel="noreferrer"
            className="mb-3 flex items-center justify-between gap-2 rounded-base border-2 border-border bg-bg/50 px-3 py-2.5 font-heading text-sm text-text/80 transition-all hover:bg-main hover:text-mtext hover:neo-shadow"
          >
            <span className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Version
            </span>
            <span className="text-xs text-text/60">v{PANEL_VERSION}</span>
          </a>
          <SidebarFooter username={username} role={admin?.role} onLogout={logout} />
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
              <GitHubButton showStars={false} />
              <VersionBadge />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-base border-2 border-transparent px-1 py-1 transition-all hover:border-border"
                >
                  <span className="hidden text-sm font-heading sm:block">{username}</span>
                  <div
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-base border-2 border-border font-heading uppercase",
                      admin?.role === "owner"
                        ? "bg-yellow-300 text-black"
                        : "bg-main text-mtext",
                    )}
                  >
                    {admin?.role === "owner" ? (
                      <Crown className="h-4 w-4" />
                    ) : (
                      (username || "A").slice(0, 1)
                    )}
                  </div>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 z-40 w-52 rounded-base border-2 border-border bg-bw p-2 neo-shadow animate-pop-in">
                    <div className="border-b-2 border-border/30 px-2 pb-2">
                      <div className="truncate text-sm font-heading">{username || "admin"}</div>
                      <div className="text-[10px] uppercase tracking-widest text-text/50">
                        {admin?.role === "owner" ? "Owner" : "Admin"}
                      </div>
                    </div>
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center justify-between gap-2 rounded-[4px] px-2 py-2 text-sm font-base transition-colors hover:bg-main/15"
                    >
                      <span className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        GitHub
                      </span>
                      <StarCount />
                    </a>
                    <a
                      href={`${GITHUB_URL}/releases`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 rounded-[4px] px-2 py-2 text-sm font-base transition-colors hover:bg-main/15"
                    >
                      <span className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Version
                      </span>
                      <span className="text-xs font-heading text-text/60">v{PANEL_VERSION}</span>
                    </a>
                    <button
                      onClick={() => void logout()}
                      className="flex w-full items-center gap-2 rounded-[4px] px-2 py-2 text-left text-sm font-base text-red-400 transition-colors hover:bg-red-400/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8">
            <div className="mx-auto max-w-7xl animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
        <WelcomeDialog />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-overlay" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 border-r-2 border-border bg-bg p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <Brand />
              <Button variant="neutral" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-6">
              <NavItems can={can} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="absolute inset-x-4 bottom-4">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="mb-2 flex items-center justify-between gap-2 rounded-base border-2 border-border bg-bg/50 px-3 py-2.5 font-heading text-sm text-text/80 transition-all hover:bg-main hover:text-mtext"
              >
                <span className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  GitHub
                </span>
                <StarCount />
              </a>
              <a
                href={`${GITHUB_URL}/releases`}
                target="_blank"
                rel="noreferrer"
                className="mb-3 flex items-center justify-between gap-2 rounded-base border-2 border-border bg-bg/50 px-3 py-2.5 font-heading text-sm text-text/80 transition-all hover:bg-main hover:text-mtext"
              >
                <span className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Version
                </span>
                <span className="text-xs text-text/60">v{PANEL_VERSION}</span>
              </a>
              <SidebarFooter username={username} role={admin?.role} onLogout={logout} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StarCount() {
  const stars = useGitHubStars();
  if (stars === null) return null;
  return (
    <span className="flex items-center gap-1 rounded-[4px] border-2 border-border bg-main px-1.5 text-xs text-mtext">
      <Star className="h-3 w-3" fill="currentColor" />
      {stars}
    </span>
  );
}

function SidebarFooter({
  username,
  role,
  onLogout,
}: {
  username: string | null;
  role: "owner" | "admin" | undefined;
  onLogout: () => Promise<void>;
}) {
  return (
    <div className="rounded-base border-2 border-border bg-bg/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <div
          className={cn(
            "grid h-8 w-8 place-items-center rounded-base border-2 border-border font-heading uppercase",
            role === "owner" ? "bg-yellow-300 text-black" : "bg-main text-mtext",
          )}
        >
          {role === "owner" ? <Crown className="h-4 w-4" /> : (username || "A").slice(0, 1)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-heading">{username || "admin"}</div>
          <div className="text-[10px] uppercase tracking-widest text-text/50">
            {role === "owner" ? "Owner" : "Admin"}
          </div>
        </div>
      </div>
      <Button variant="neutral" size="sm" className="w-full" onClick={() => void onLogout()}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
