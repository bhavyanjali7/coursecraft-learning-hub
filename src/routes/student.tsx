import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BookMarked, Brain, ChartLine, FileText, LayoutDashboard, ListChecks, Map, Sparkles } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/app-shell";

const items: NavItem[] = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/student/materials", label: "Course materials", icon: BookMarked },
  { to: "/student/tutor", label: "Tutor (demo)", icon: Brain },
  { to: "/student/summarize", label: "Notes summary", icon: FileText },
  { to: "/student/quizzes", label: "Quizzes", icon: ListChecks },
  { to: "/student/path", label: "Learning path", icon: Map },
  { to: "/student/performance", label: "Performance", icon: ChartLine },
  { to: "/student/recommendations", label: "Recommendations", icon: Sparkles },
];

export const Route = createFileRoute("/student")({
  component: () => (
    <AppShell role="student" items={items}>
      <Outlet />
    </AppShell>
  ),
});
