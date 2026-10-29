import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState, PageHeader, Panel, StatCard, chartTooltip, formatDate } from "@/components/app/ui-bits";
import { useDB } from "@/lib/data/store";
import { courseScoreFor, studentAverage } from "@/lib/data/api";
import { STUDENT_ID } from "@/lib/data/seed";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/student/performance")({
  head: pageHead("Performance", "Score trends, course-wise results and quiz history."),
  component: Performance,
});


function Performance() {
  const db = useDB();
  const { trend, byCourse, subs } = useMemo(() => {
    const subs = db.submissions.filter((s) => s.studentId === STUDENT_ID).sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
    const trend = [...db.scoreHistory, ...subs.map((s, i) => ({ week: `Q${i + 1}`, score: Math.round((s.score / s.total) * 100) }))];
    const byCourse = ["ml", "dl", "nlp"].map((c) => ({ course: db.courses.find((x) => x.id === c)!.code, score: courseScoreFor(db, STUDENT_ID, c) }));
    return { trend, byCourse, subs };
  }, [db]);
  const best = subs.reduce((m, s) => Math.max(m, Math.round((s.score / s.total) * 100)), 0);

  return (
    <>
      <PageHeader eyebrow="Progress" title="Performance" description="How your scores are moving across the semester." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Overall average" value={`${studentAverage(db, STUDENT_ID)}%`} />
        <StatCard label="Quizzes taken" value={subs.length} />
        <StatCard label="Best quiz" value={subs.length ? `${best}%` : "—"} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Score trend">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={30} />
                <Tooltip {...chartTooltip} />
                <Line type="monotone" dataKey="score" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3, fill: "var(--chart-2)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="By course">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byCourse}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="course" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={30} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="score" fill="var(--chart-1)" radius={[3, 3, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <Panel title="Quiz history" className="mt-6">
        {subs.length === 0 ? <EmptyState title="No attempts yet" body="Complete a quiz to see it here." /> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="pb-2 font-medium">Quiz</th><th className="pb-2 font-medium">Date</th><th className="pb-2 text-right font-medium">Score</th></tr></thead>
            <tbody>
              {[...subs].reverse().map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3">{db.quizzes.find((q) => q.id === s.quizId)?.title}</td>
                  <td className="py-3 text-muted-foreground">{formatDate(s.submittedAt)}</td>
                  <td className="py-3 text-right font-medium">{s.score}/{s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
