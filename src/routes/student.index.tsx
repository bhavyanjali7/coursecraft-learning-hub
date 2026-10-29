import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, BookMarked, ListChecks, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, Panel, ProgressBar, StatCard, EmptyState } from "@/components/app/ui-bits";
import { useCurrentUser } from "@/components/app/app-shell";
import { useDB } from "@/lib/data/store";
import { courseScoreFor, studentAverage, visibleQuizzesForStudent } from "@/lib/data/api";
import { recommendationsFor } from "@/lib/data/derived";
import { STUDENT_ID } from "@/lib/data/seed";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/student/")({
  head: pageHead("Student dashboard", "Your courses, open quizzes, progress and recommendations at a glance."),
  component: StudentDashboard,
});

function StudentDashboard() {
  const db = useDB();
  const user = useCurrentUser();
  const data = useMemo(() => {
    const done = new Set(db.submissions.filter((s) => s.studentId === STUDENT_ID).map((s) => s.quizId));
    const open = visibleQuizzesForStudent(db).filter((q) => !done.has(q.id));
    const courses = db.courses.filter((c) => ["ml", "dl", "nlp", "dsa"].includes(c.id)).map((c) => {
      const mats = db.materials.filter((m) => m.courseId === c.id);
      const completed = mats.filter((m) => db.completedMaterials.includes(m.id)).length;
      return { ...c, progress: mats.length ? Math.round((completed / mats.length) * 100) : 0, score: courseScoreFor(db, STUDENT_ID, c.id) };
    });
    return { open, courses, avg: studentAverage(db, STUDENT_ID), recs: recommendationsFor(db).slice(0, 3) };
  }, [db]);
  const pathDone = db.path.filter((p) => p.done).length;

  return (
    <>
      <PageHeader eyebrow={`${user.department} · ${user.title}`} title={`Good to see you, ${user.name}.`} description="Here is where things stand across your courses this week." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Average score" value={`${data.avg}%`} hint="Across coursework and quizzes" icon={TrendingUp} />
        <StatCard label="Open quizzes" value={data.open.length} hint="Awaiting your attempt" icon={ListChecks} />
        <StatCard label="Materials read" value={`${db.completedMaterials.length}/${db.materials.length}`} icon={BookMarked} />
        <StatCard label="Learning path" value={`${pathDone}/${db.path.length}`} hint="Steps completed" icon={Target} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Open quizzes" className="lg:col-span-2" action={<Link to="/student/quizzes" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>}>
          {data.open.length === 0 ? (
            <EmptyState title="Nothing pending" body="New quizzes from faculty will show up here." />
          ) : (
            <ul className="divide-y">
              {data.open.map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium">{q.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {db.courses.find((c) => c.id === q.courseId)?.title} · {q.questions.length} questions · {q.timeLimit} min · due {q.dueDate}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link to="/student/quiz/$quizId" params={{ quizId: q.id }}>Start</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Suggested next" action={<Link to="/student/recommendations" className="text-xs text-muted-foreground hover:text-foreground">More</Link>}>
          <ul className="space-y-4">
            {data.recs.map((r) => (
              <li key={r.id}>
                <Badge variant="outline" className="mb-1 border-gold/50 text-gold">{r.kind}</Badge>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.reason}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Courses" className="mt-6">
        <div className="grid gap-5 md:grid-cols-2">
          {data.courses.map((c) => (
            <div key={c.id} className="rounded-md border p-4">
              <div className="flex items-baseline justify-between">
                <p className="eyebrow">{c.code}</p>
                <p className="text-xs text-muted-foreground">Score <span className="font-medium text-foreground">{c.score || "—"}{c.score ? "%" : ""}</span></p>
              </div>
              <p className="mt-1 font-serif text-lg">{c.title}</p>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={c.progress} />
                <span className="w-10 text-right text-xs text-muted-foreground">{c.progress}%</span>
              </div>
            </div>
          ))}
        </div>
        <Link to="/student/materials" className="mt-5 inline-flex items-center gap-1 text-sm text-gold hover:underline">
          Continue reading <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Panel>
    </>
  );
}
