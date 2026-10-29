import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { BookOpen, FileEdit, ListChecks, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, Panel, StatCard, EmptyState, formatDate } from "@/components/app/ui-bits";
import { useCurrentUser } from "@/components/app/app-shell";
import { useDB } from "@/lib/data/store";
import { FACULTY_ID } from "@/lib/data/seed";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/faculty/")({
  head: pageHead("Faculty dashboard", "Overview of courses, quizzes and recent student submissions."),
  component: FacultyDashboard,
});

function FacultyDashboard() {
  const db = useDB();
  const user = useCurrentUser();
  const d = useMemo(() => {
    const courses = db.courses.filter((c) => c.facultyId === FACULTY_ID);
    const ids = new Set(courses.map((c) => c.id));
    const quizzes = db.quizzes.filter((q) => ids.has(q.courseId));
    const qids = new Set(quizzes.map((q) => q.id));
    const subs = db.submissions.filter((s) => qids.has(s.quizId)).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    const avg = subs.length ? Math.round(subs.reduce((a, s) => a + (s.score / s.total) * 100, 0) / subs.length) : 0;
    return { courses, quizzes, subs, avg };
  }, [db]);
  const drafts = d.quizzes.filter((q) => q.status === "draft");

  return (
    <>
      <PageHeader eyebrow={`${user.department} · ${user.title}`} title={`Welcome, ${user.name}.`} description="A summary of your teaching activity." actions={
        <>
          <Button variant="outline" asChild><Link to="/faculty/materials">Upload material</Link></Button>
          <Button asChild><Link to="/faculty/quizzes">New quiz draft</Link></Button>
        </>
      } />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Courses" value={d.courses.length} icon={BookOpen} />
        <StatCard label="Students" value={db.students.length} hint="In demo roster" icon={Users} />
        <StatCard label="Published quizzes" value={d.quizzes.length - drafts.length} hint={`${drafts.length} draft(s)`} icon={ListChecks} />
        <StatCard label="Avg. quiz score" value={`${d.avg}%`} hint={`${d.subs.length} submissions`} icon={FileEdit} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Recent submissions" className="lg:col-span-2" action={<Link to="/faculty/analytics" className="text-xs text-muted-foreground hover:text-foreground">Analytics</Link>}>
          {d.subs.length === 0 ? <EmptyState title="No submissions yet" /> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="pb-2 font-medium">Student</th><th className="pb-2 font-medium">Quiz</th><th className="hidden pb-2 font-medium md:table-cell">Date</th><th className="pb-2 text-right font-medium">Score</th></tr></thead>
              <tbody>
                {d.subs.slice(0, 7).map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2.5">{s.studentName}</td>
                    <td className="py-2.5 text-muted-foreground">{db.quizzes.find((q) => q.id === s.quizId)?.title}</td>
                    <td className="hidden py-2.5 text-muted-foreground md:table-cell">{formatDate(s.submittedAt)}</td>
                    <td className="py-2.5 text-right font-medium">{s.score}/{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel title="Drafts">
          {drafts.length === 0 ? <p className="text-sm text-muted-foreground">No drafts in progress.</p> : (
            <ul className="space-y-3">
              {drafts.map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{q.title}</p>
                    <p className="text-xs text-muted-foreground">{q.questions.length} questions</p>
                  </div>
                  <Button size="sm" variant="outline" asChild><Link to="/faculty/quiz/$quizId" params={{ quizId: q.id }}>Edit</Link></Button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 border-t pt-4">
            <p className="eyebrow mb-2">Your courses</p>
            <div className="flex flex-wrap gap-2">{d.courses.map((c) => <Badge key={c.id} variant="secondary">{c.code} · {c.title}</Badge>)}</div>
          </div>
        </Panel>
      </div>
    </>
  );
}
