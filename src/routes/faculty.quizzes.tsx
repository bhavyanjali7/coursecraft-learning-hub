import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DemoNotice, EmptyState, PageHeader } from "@/components/app/ui-bits";
import { getDB, useDB } from "@/lib/data/store";
import { createQuizDraft, publishQuiz, suggestQuestions } from "@/lib/data/api";
import { FACULTY_ID } from "@/lib/data/seed";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/faculty/quizzes")({
  head: pageHead("Quizzes", "Create quiz drafts from the question bank, edit and publish them."),
  component: FacultyQuizzes,
});

function FacultyQuizzes() {
  const db = useDB();
  const navigate = useNavigate();
  const myCourses = db.courses.filter((c) => c.facultyId === FACULTY_ID);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", courseId: myCourses[0]?.id ?? "", timeLimit: 10, count: 4, difficulty: "Any" });
  const [selected, setSelected] = useState<string[]>([]);

  const list = useMemo(() => db.quizzes.filter((q) => myCourses.some((c) => c.id === q.courseId) && (tab === "all" || q.status === tab) && q.title.toLowerCase().includes(query.toLowerCase())), [db, tab, query, myCourses]);
  const bank = db.questionBank.filter((q) => q.courseId === form.courseId);

  const generate = () => {
    const ids = suggestQuestions(getDB(), form.courseId, form.count, form.difficulty as "Any");
    setSelected(ids);
    if (!form.title) setForm((f) => ({ ...f, title: `${myCourses.find((c) => c.id === f.courseId)?.title} — Practice set` }));
    toast(`Selected ${ids.length} questions from the bank`);
  };

  const create = () => {
    if (!form.title.trim() || selected.length === 0) { toast.error("Add a title and at least one question"); return; }
    const id = createQuizDraft({ title: form.title, courseId: form.courseId, timeLimit: form.timeLimit, questionIds: selected });
    setOpen(false);
    setSelected([]);
    setForm((f) => ({ ...f, title: "" }));
    toast.success("Draft saved — only you can see it until it's published");
    navigate({ to: "/faculty/quiz/$quizId", params: { quizId: id } });
  };

  return (
    <>
      <PageHeader eyebrow="Assessments" title="Quizzes" description="Drafts are private to you. Publishing makes a quiz visible to students immediately." actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New draft</Button>} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search quizzes" className="pl-9" />
        </div>
      </div>

      {list.length === 0 ? <EmptyState title="No quizzes here" body="Create a draft to get started." /> : (
        <div className="overflow-hidden rounded-lg border bg-card">
          {list.map((q) => {
            const subs = db.submissions.filter((s) => s.quizId === q.id).length;
            return (
              <div key={q.id} className="flex flex-col gap-3 border-b p-5 last:border-0 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={q.status === "published" ? "default" : "outline"} className={q.status === "draft" ? "border-gold/50 text-gold" : ""}>{q.status === "published" ? "Published" : "Draft"}</Badge>
                    <span className="text-xs text-muted-foreground">{db.courses.find((c) => c.id === q.courseId)?.code}</span>
                  </div>
                  <p className="mt-2 font-serif text-lg">{q.title}</p>
                  <p className="text-xs text-muted-foreground">{q.questions.length} questions · {q.timeLimit} min · {subs} submission(s){q.dueDate ? ` · due ${q.dueDate}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild><Link to="/faculty/quiz/$quizId" params={{ quizId: q.id }}>Edit</Link></Button>
                  {q.status === "draft" ? (
                    <Button size="sm" disabled={!q.questions.length} onClick={() => { publishQuiz(q.id); toast.success("Published — students have been notified"); }}>Publish</Button>
                  ) : (
                    <Button size="sm" variant="secondary" asChild><Link to="/faculty/analytics" search={{ quiz: q.id }}>Analytics</Link></Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-medium">New quiz draft</DialogTitle>
            <DialogDescription>Pick questions from the predefined bank, or let LearnWise select a set for you.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="qt">Title</Label><Input id="qt" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Unit 3 Review" /></div>
            <div className="space-y-1.5"><Label>Course</Label>
              <Select value={form.courseId} onValueChange={(v) => { setForm({ ...form, courseId: v }); setSelected([]); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{myCourses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label htmlFor="tl">Time limit (min)</Label><Input id="tl" type="number" min={1} value={form.timeLimit} onChange={(e) => setForm({ ...form, timeLimit: Math.max(1, Number(e.target.value)) })} /></div>
          </div>
          <div className="rounded-md border p-4">
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <div className="space-y-1.5"><Label htmlFor="cnt">Questions</Label><Input id="cnt" type="number" min={1} max={bank.length} value={form.count} onChange={(e) => setForm({ ...form, count: Number(e.target.value) })} className="w-20" /></div>
              <div className="space-y-1.5"><Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Any", "Easy", "Medium", "Hard"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" onClick={generate}><Wand2 className="h-4 w-4" /> Generate draft</Button>
            </div>
            <DemoNotice>Generation picks from the predefined question bank by course and difficulty — no AI writes questions.</DemoNotice>
            <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
              {bank.map((q) => (
                <li key={q.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted">
                    <Checkbox checked={selected.includes(q.id)} onCheckedChange={(c) => setSelected((s) => (c ? [...s, q.id] : s.filter((x) => x !== q.id)))} className="mt-0.5" />
                    <span className="text-sm">{q.text}<span className="ml-2 text-xs text-muted-foreground">{q.topic} · {q.difficulty}</span></span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <span className="mr-auto self-center text-xs text-muted-foreground">{selected.length} selected</span>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create}>Save draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
