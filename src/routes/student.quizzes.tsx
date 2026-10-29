import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageHeader } from "@/components/app/ui-bits";
import { useDB } from "@/lib/data/store";
import { visibleQuizzesForStudent } from "@/lib/data/api";
import { STUDENT_ID } from "@/lib/data/seed";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/student/quizzes")({
  head: pageHead("Quizzes", "Attempt published quizzes and review your completed results."),
  component: StudentQuizzes,
});

function StudentQuizzes() {
  const db = useDB();
  const [tab, setTab] = useState("open");
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");

  const rows = useMemo(() => {
    const mine = new Map(db.submissions.filter((s) => s.studentId === STUDENT_ID).map((s) => [s.quizId, s]));
    return visibleQuizzesForStudent(db)
      .map((q) => ({ q, sub: mine.get(q.id) }))
      .filter(({ q, sub }) => (tab === "open" ? !sub : !!sub))
      .filter(({ q }) => (course === "all" || q.courseId === course) && q.title.toLowerCase().includes(query.toLowerCase()));
  }, [db, tab, query, course]);

  return (
    <>
      <PageHeader eyebrow="Assessments" title="Quizzes" description="Quizzes published by your faculty. Each attempt is scored instantly." />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="open">Available</TabsTrigger>
            <TabsTrigger value="done">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search quizzes" className="pl-9" />
        </div>
        <Select value={course} onValueChange={setCourse}>
          <SelectTrigger className="md:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {db.courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={tab === "open" ? "No quizzes to attempt" : "No completed quizzes yet"} />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          {rows.map(({ q, sub }) => (
            <div key={q.id} className="flex flex-col gap-3 border-b p-5 last:border-0 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="eyebrow">{db.courses.find((c) => c.id === q.courseId)?.title}</p>
                <p className="mt-1 font-serif text-lg">{q.title}</p>
                <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{q.questions.length} questions</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{q.timeLimit} min</span>
                  {q.dueDate && <span>Due {q.dueDate}</span>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {sub && (
                  <Badge variant="outline" className="border-gold/50 text-sm">
                    {sub.score}/{sub.total} · {Math.round((sub.score / sub.total) * 100)}%
                  </Badge>
                )}
                <Button asChild size="sm" variant={sub ? "outline" : "default"}>
                  <Link to="/student/quiz/$quizId" params={{ quizId: q.id }}>{sub ? "Retake" : "Start quiz"}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
