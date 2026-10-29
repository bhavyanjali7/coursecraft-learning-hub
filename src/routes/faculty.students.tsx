import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, ProgressBar } from "@/components/app/ui-bits";
import { useDB } from "@/lib/data/store";
import { courseScoreFor, studentAverage } from "@/lib/data/api";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/faculty/students")({
  head: pageHead("Student performance", "Track each student's scores, attendance and quiz activity."),
  component: Students,
});

function standing(avg: number) {
  if (avg >= 80) return { label: "Excelling", cls: "border-success/50 text-success" };
  if (avg >= 65) return { label: "On track", cls: "border-gold/50 text-gold" };
  return { label: "Needs support", cls: "border-destructive/50 text-destructive" };
}

function Students() {
  const db = useDB();
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("score");

  const rows = useMemo(() => db.students
    .map((s) => {
      const avg = course === "all" ? studentAverage(db, s.id) : courseScoreFor(db, s.id, course);
      return { ...s, avg, attempts: db.submissions.filter((x) => x.studentId === s.id).length, standing: standing(avg) };
    })
    .filter((s) => (s.name + s.rollNo).toLowerCase().includes(query.toLowerCase()) && (filter === "all" || s.standing.label === filter))
    .sort((a, b) => (sort === "score" ? b.avg - a.avg : sort === "attendance" ? b.attendance - a.attendance : a.name.localeCompare(b.name))), [db, query, course, filter, sort]);

  return (
    <>
      <PageHeader eyebrow="Cohort" title="Student performance" description="Averages combine coursework baselines with every quiz submission, and update live." />
      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or roll number" className="pl-9" />
        </div>
        <Select value={course} onValueChange={setCourse}>
          <SelectTrigger className="md:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {db.courses.filter((c) => c.id !== "dsa").map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="md:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All standings</SelectItem>
            <SelectItem value="Excelling">Excelling</SelectItem>
            <SelectItem value="On track">On track</SelectItem>
            <SelectItem value="Needs support">Needs support</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Sort: score</SelectItem>
            <SelectItem value="attendance">Sort: attendance</SelectItem>
            <SelectItem value="name">Sort: name</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="p-4 font-medium">Student</th>
              <th className="p-4 font-medium">Average</th>
              <th className="p-4 font-medium">Attendance</th>
              <th className="p-4 font-medium">Quiz attempts</th>
              <th className="p-4 font-medium">Standing</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-4"><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.rollNo}</p></td>
                <td className="p-4"><div className="flex items-center gap-3"><ProgressBar value={s.avg} className="w-24" /><span>{s.avg}%</span></div></td>
                <td className="p-4">{s.attendance}%</td>
                <td className="p-4">{s.attempts}</td>
                <td className="p-4"><Badge variant="outline" className={s.standing.cls}>{s.standing.label}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
