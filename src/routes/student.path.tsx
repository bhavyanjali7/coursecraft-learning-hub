import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader, ProgressBar } from "@/components/app/ui-bits";
import { useDB } from "@/lib/data/store";
import { togglePathStep } from "@/lib/data/api";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/path")({
  head: pageHead("Learning path", "A step-by-step plan through your courses, with progress tracking."),
  component: Path,
});

function Path() {
  const db = useDB();
  const total = db.path.length;
  const done = db.path.filter((p) => p.done).length;
  const groups = db.courses.filter((c) => db.path.some((p) => p.courseId === c.id));

  return (
    <>
      <PageHeader eyebrow="Plan" title="Learning path" description="Work through these steps in order. Tick each one off as you complete it." />
      <div className="mb-8 rounded-lg border bg-card p-5">
        <div className="mb-2 flex justify-between text-sm"><span>Overall progress</span><span className="font-medium">{Math.round((done / total) * 100)}%</span></div>
        <ProgressBar value={(done / total) * 100} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {groups.map((c) => {
          const steps = db.path.filter((p) => p.courseId === c.id);
          return (
            <section key={c.id} className="rounded-lg border bg-card p-5">
              <p className="eyebrow">{c.code}</p>
              <h2 className="mb-5 text-xl">{c.title}</h2>
              <ol className="relative space-y-5 border-l pl-6">
                {steps.map((s) => (
                  <li key={s.id} className="relative">
                    <button
                      onClick={() => togglePathStep(s.id)}
                      aria-label={s.done ? `Mark ${s.title} incomplete` : `Mark ${s.title} complete`}
                      className={cn("absolute -left-[2.03rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border bg-card", s.done && "border-primary bg-primary text-primary-foreground")}
                    >
                      {s.done && <Check className="h-3 w-3" />}
                    </button>
                    <p className={cn("text-sm font-medium", s.done && "text-muted-foreground line-through")}>{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.detail}</p>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </>
  );
}
