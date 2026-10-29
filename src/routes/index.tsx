import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, GraduationCap, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { login } from "@/lib/data/api";
import { resetDB } from "@/lib/data/store";
import { FACULTY_ID, STUDENT_ID } from "@/lib/data/seed";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LearnWise — Sign in" },
      { name: "description", content: "Sign in to LearnWise as a student or faculty member to access courses, quizzes and analytics." },
      { property: "og:title", content: "LearnWise — Sign in" },
      { property: "og:description", content: "Courses, quizzes, learning paths and analytics for students and faculty." },
    ],
  }),
  component: Login,
});

const roles = [
  { role: "student" as const, id: STUDENT_ID, name: "Bhavyanjali", dept: "CSE-AIML", label: "Student", icon: GraduationCap, to: "/student", blurb: "Materials, quizzes, tutor, learning path and progress." },
  { role: "faculty" as const, id: FACULTY_ID, name: "Dr. Aparna", dept: "CSE-AIML", label: "Faculty", icon: BookOpen, to: "/faculty", blurb: "Courses, uploads, quiz drafts, publishing and analytics." },
];

function Login() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-sidebar-primary font-serif text-xl text-sidebar-primary">L</div>
          <span className="font-serif text-2xl">LearnWise</span>
        </div>
        <div className="max-w-lg">
          <p className="mb-6 text-[0.7rem] uppercase tracking-[0.2em] text-sidebar-primary">Est. for considered learning</p>
          <h1 className="font-serif text-5xl leading-[1.1] text-sidebar-accent-foreground">Study with intent. Teach with clarity.</h1>
          <p className="mt-6 text-base leading-relaxed text-sidebar-foreground/75">
            One place for course materials, assessments and progress — built around how students learn and how faculty teach.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 border-t border-sidebar-border pt-6 text-sm">
          {[["4", "Courses"], ["21", "Bank questions"], ["8", "Learners"]].map(([v, l]) => (
            <div key={l}>
              <p className="font-serif text-3xl text-sidebar-primary">{v}</p>
              <p className="text-sidebar-foreground/60">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col px-6 py-8 md:px-16">
        <div className="flex justify-between lg:justify-end">
          <span className="font-serif text-xl lg:hidden">LearnWise</span>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <p className="eyebrow">Demo sign-in</p>
          <h2 className="mt-2 text-3xl">Choose your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Each account opens its own portal. Changes you make are saved in this browser.</p>

          <div className="mt-8 space-y-3">
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => {
                  login(r.role, r.id);
                  navigate({ to: r.to });
                }}
                className="group flex w-full items-center gap-4 rounded-lg border bg-card p-5 text-left transition-colors hover:border-gold"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-gold">
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="eyebrow">{r.label}</p>
                  <p className="font-serif text-xl">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.dept} · {r.blurb}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-gold" />
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              resetDB();
              toast.success("Demo data restored to its original state");
            }}
            className="mt-8 inline-flex items-center gap-2 self-start text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Reset demo data
          </button>
        </div>
      </section>
    </div>
  );
}
