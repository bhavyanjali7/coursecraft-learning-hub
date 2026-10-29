import { useMemo, useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useRouterState, useHydrated } from "@tanstack/react-router";
import { Bell, LogOut, Menu, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { useDB } from "@/lib/data/store";
import { logout, markAllRead } from "@/lib/data/api";
import type { Role } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-sidebar-primary font-serif text-lg text-sidebar-primary">L</div>
      <span className="font-serif text-xl tracking-tight">LearnWise</span>
    </div>
  );
}

function SideNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: (() => void) | undefined }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = item.exact ? path === item.to : path === item.to || path.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to as "/"}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition-colors",
              active
                ? "border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground"
                : "border-transparent text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className={cn("h-4 w-4", active && "text-sidebar-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ items, role, onNavigate }: { items: NavItem[]; role: Role; onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col bg-sidebar px-4 py-6 text-sidebar-foreground">
      <div className="px-2">
        <Logo />
        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-sidebar-foreground/55">{role === "student" ? "Student portal" : "Faculty portal"}</p>
      </div>
      <div className="my-6 border-t border-sidebar-border" />
      <SideNav items={items} onNavigate={onNavigate} />
    </div>
  );
}

function Notifications({ role }: { role: Role }) {
  const db = useDB();
  const navigate = useNavigate();
  const items = useMemo(() => db.notifications.filter((n) => n.role === role), [db.notifications, role]);
  const unread = items.filter((n) => !n.read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications, ${unread} unread`} className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold text-gold-foreground">{unread}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-serif text-base">Notifications</p>
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => markAllRead(role)}>Mark all read</button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && <p className="p-4 text-sm text-muted-foreground">You're all caught up.</p>}
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => n.link && navigate({ to: n.link as "/" })}
              className="block w-full border-b px-4 py-3 text-left last:border-0 hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                <p className="text-sm font-medium">{n.title}</p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
              <p className="mt-1 text-[0.65rem] text-muted-foreground">{new Date(n.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell({ role, items, children }: { role: Role; items: NavItem[]; children: ReactNode }) {
  const hydrated = useHydrated();
  const db = useDB();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const user = db.users.find((u) => u.id === db.session?.userId);

  if (!hydrated) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!db.session || db.session.role !== role || !user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <SidebarBody items={items} role={role} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-0 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarBody items={items} role={role} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <Notifications role={role} />
          <ThemeToggle />
          <div className="mx-1 hidden h-8 border-l sm:block" />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.department} · {user.title}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}

export function useCurrentUser() {
  const db = useDB();
  return db.users.find((u) => u.id === db.session?.userId)!;
}
