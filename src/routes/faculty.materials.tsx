import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { Search, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoNotice, EmptyState, PageHeader, Panel, formatDate } from "@/components/app/ui-bits";
import { useDB } from "@/lib/data/store";
import { addMaterial, deleteMaterial } from "@/lib/data/api";
import { FACULTY_ID } from "@/lib/data/seed";
import type { MaterialType } from "@/lib/data/types";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/faculty/materials")({
  head: pageHead("Study materials", "Upload and manage readings, slides, lectures and notes for your courses."),
  component: FacultyMaterials,
});

const fmtSize = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

function FacultyMaterials() {
  const db = useDB();
  const myCourses = db.courses.filter((c) => c.facultyId === FACULTY_ID);
  const [form, setForm] = useState({ title: "", courseId: myCourses[0]?.id ?? "", type: "PDF" as MaterialType, topic: "", description: "" });
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");

  const list = useMemo(() => db.materials.filter((m) => myCourses.some((c) => c.id === m.courseId) && (course === "all" || m.courseId === course) && (m.title + m.topic).toLowerCase().includes(query.toLowerCase())), [db, query, course, myCourses]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.topic.trim()) { toast.error("Add a title and topic"); return; }
    addMaterial({ ...form, size: file?.size ?? "—", description: form.description || `${form.title} — ${form.topic}.` });
    toast.success("Material published to students");
    setForm({ ...form, title: "", topic: "", description: "" });
    setFile(null);
  };

  return (
    <>
      <PageHeader eyebrow="Library" title="Study materials" description="Share resources with your students. New uploads notify the class." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Panel title="Upload">
          <form onSubmit={submit} className="space-y-4">
            <DemoNotice>Files stay on your device in this demo; only the file name and size are recorded.</DemoNotice>
            <div className="space-y-1.5"><Label htmlFor="t">Title</Label><Input id="t" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Support Vector Machines" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Course</Label>
                <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{myCourses.map((c) => <SelectItem key={c.id} value={c.id}>{c.code}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MaterialType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(["PDF", "Slides", "Video", "Notes"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="tp">Topic</Label><Input id="tp" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Classification" /></div>
            <div className="space-y-1.5"><Label htmlFor="d">Description</Label><Textarea id="d" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground hover:border-gold">
              <UploadCloud className="h-5 w-5 text-gold" />
              {file ? <span className="text-foreground">{file.name} · {file.size}</span> : "Choose a file"}
              <input type="file" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile({ name: f.name, size: fmtSize(f.size) }); if (!form.title) setForm({ ...form, title: f.name.replace(/\.[^.]+$/, "") }); } }} />
            </label>
            <Button type="submit" className="w-full">Publish material</Button>
          </form>
        </Panel>
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search materials" className="pl-9" />
            </div>
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All my courses</SelectItem>
                {myCourses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {list.length === 0 ? <EmptyState title="No materials found" /> : (
            <div className="overflow-hidden rounded-lg border bg-card">
              {list.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-4 border-b p-4 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{db.courses.find((c) => c.id === m.courseId)?.code} · {m.type} · {m.size} · {m.topic} · {formatDate(m.uploadedAt)}</p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${m.title}`} onClick={() => { deleteMaterial(m.id); toast("Material removed"); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
