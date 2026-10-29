import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BarChart3, BookOpen, LayoutDashboard, ListChecks, Upload, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/app-shell";

const items: NavItem[] = [
  { to: "/faculty", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/faculty/courses", label: "Courses", icon: BookOpen },
  { to: "/faculty/students", label: "Student performance", icon: Users },
  { to: "/faculty/materials", label: "Study materials", icon: Upload },
  { to: "/faculty/quizzes", label: "Quizzes", icon: ListChecks },
  { to: "/faculty/analytics", label: "Submission analytics", icon: BarChart3 },
];

export const Route = createFileRoute("/faculty")({
  component: () => (
    <AppShell role="faculty" items={items}>
      <Outlet />
    </AppShell>
  ),
});
