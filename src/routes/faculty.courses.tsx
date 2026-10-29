import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/ui-bits";
import { useDB } from "@/lib/data/store";
import { FACULTY_ID } from "@/lib/data/seed";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/faculty/courses")({
  head: pageHead("Courses", "Courses you teach, with materials, quizzes and average scores."),
  component: Courses,
});

function Courses() {
  const db = useDB();
  const [query, setQuery] = useState("");
  const rows = useMemo(() => db.courses.filter((c) => c.facultyId === FACULTY_ID && (c.title + c.code).toLowerCase().includes(query.toLowerCase())).map((c) => {
    const quizzes = db.quizzes.filter((q) => q.courseId === c.id);
    const qids = new Set(quizzes.map((q) => q.id));
    const subs = db.submissions.filter((s) => qids.has(s.quizId));
    return {
      ...c,
      materials: db.materials.filter((m) => m.courseId === c.id).length,
      published: quizzes.filter((q) => q.status === "published").length,
      drafts: quizzes.filter((q) => q.status === "draft").length,
      avg: subs.length ? Math.round(subs.reduce((a, s) => a + (s.score / s.total) * 100, 0) / subs.length) : null,
    };
  }), [db, query]);

  return (
    <>
      <PageHeader eyebrow="Teaching" title="Courses" description="Courses assigned to you this semester." />
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses" className="pl-9" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {rows.map((c) => (
          <article key={c.id} className="flex flex-col rounded-lg border bg-card">
            <div className="border-b p-5">
              <p className="eyebrow">{c.code} · Semester {c.semester} · {c.credits} credits</p>
              <h2 className="mt-2 text-2xl">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-border">
              {[["Enrolled", c.enrolled], ["Materials", c.materials], ["Published quizzes", c.published], ["Avg. score", c.avg != null ? `${c.avg}%` : "—"]].map(([k, v]) => (
                <div key={k as string} className="bg-card p-4">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="font-serif text-2xl">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-auto flex gap-2 p-4">
              <Button size="sm" variant="outline" asChild><Link to="/faculty/materials">Materials</Link></Button>
              <Button size="sm" variant="outline" asChild><Link to="/faculty/quizzes">Quizzes{c.drafts ? ` (${c.drafts} draft)` : ""}</Link></Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
