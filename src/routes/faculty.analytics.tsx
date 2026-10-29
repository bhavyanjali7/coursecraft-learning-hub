import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageHeader, Panel, StatCard, chartTooltip, formatDate } from "@/components/app/ui-bits";
import { useDB } from "@/lib/data/store";
import { FACULTY_ID } from "@/lib/data/seed";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/faculty/analytics")({
  validateSearch: (s: Record<string, unknown>): { quiz?: string | undefined } => ({ quiz: typeof s["quiz"] === "string" ? s["quiz"] : undefined }),
  head: pageHead("Submission analytics", "Attempts, score distribution and question-level results for each quiz."),
  component: Analytics,
});

function Analytics() {
  const db = useDB();
  const navigate = useNavigate({ from: "/faculty/analytics" });
  const search = Route.useSearch();
  const published = db.quizzes.filter((q) => q.status === "published" && db.courses.find((c) => c.id === q.courseId)?.facultyId === FACULTY_ID);
  const quiz = published.find((q) => q.id === search.quiz) ?? published[0];

  const a = useMemo(() => {
    if (!quiz) return null;
    const subs = db.submissions.filter((s) => s.quizId === quiz.id).sort((x, y) => y.submittedAt.localeCompare(x.submittedAt));
    const pcts = subs.map((s) => Math.round((s.score / s.total) * 100));
    const buckets = ["0–39", "40–59", "60–79", "80–100"].map((range, i) => ({
      range,
      count: pcts.filter((p) => (i === 0 ? p < 40 : i === 1 ? p >= 40 && p < 60 : i === 2 ? p >= 60 && p < 80 : p >= 80)).length,
    }));
    const perQ = quiz.questions.map((q, i) => ({
      q: `Q${i + 1}`,
      text: q.text,
      correct: subs.length ? Math.round((subs.filter((s) => s.answers[i] === q.answer).length / subs.length) * 100) : 0,
    }));
    return {
      subs,
      avg: pcts.length ? Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length) : 0,
      high: pcts.length ? Math.max(...pcts) : 0,
      low: pcts.length ? Math.min(...pcts) : 0,
      avgTime: subs.length ? Math.round(subs.reduce((x, s) => x + s.timeTaken, 0) / subs.length) : 0,
      buckets,
      perQ,
    };
  }, [db, quiz]);

  if (!quiz || !a) return <><PageHeader eyebrow="Insights" title="Submission analytics" /><EmptyState title="No published quizzes" body="Publish a quiz to start collecting submissions." /></>;

  return (
    <>
      <PageHeader eyebrow="Insights" title="Submission analytics" description="Updates as soon as students submit." actions={
        <Select value={quiz.id} onValueChange={(v) => navigate({ search: { quiz: v } })}>
          <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
          <SelectContent>{published.map((q) => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}</SelectContent>
        </Select>
      } />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Attempts" value={a.subs.length} />
        <StatCard label="Average" value={`${a.avg}%`} />
        <StatCard label="Highest" value={`${a.high}%`} />
        <StatCard label="Lowest" value={`${a.low}%`} />
        <StatCard label="Avg. time" value={`${Math.floor(a.avgTime / 60)}m ${a.avgTime % 60}s`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Score distribution">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={a.buckets}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="range" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={24} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="count" name="Students" fill="var(--chart-2)" radius={[3, 3, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Correct answers by question">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={a.perQ}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="q" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={40} unit="%" />
                <Tooltip {...chartTooltip} formatter={(v) => [`${v}%`, "Correct"]} labelFormatter={(l, p) => p?.[0]?.payload?.text ?? l} />
                <Bar dataKey="correct" fill="var(--chart-1)" radius={[3, 3, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <Panel title="Submissions" className="mt-6">
        {a.subs.length === 0 ? <EmptyState title="No submissions yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="pb-2 font-medium">Student</th><th className="pb-2 font-medium">Submitted</th><th className="pb-2 font-medium">Time</th><th className="pb-2 text-right font-medium">Score</th></tr></thead>
              <tbody>
                {a.subs.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2.5">{s.studentName}</td>
                    <td className="py-2.5 text-muted-foreground">{formatDate(s.submittedAt)}</td>
                    <td className="py-2.5 text-muted-foreground">{Math.floor(s.timeTaken / 60)}m {s.timeTaken % 60}s</td>
                    <td className="py-2.5 text-right font-medium">{s.score}/{s.total} · {Math.round((s.score / s.total) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
