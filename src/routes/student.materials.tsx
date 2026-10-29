import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, FileText, Film, Presentation, Search, StickyNote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, PageHeader, formatDate } from "@/components/app/ui-bits";
import { useDB } from "@/lib/data/store";
import { toggleMaterialComplete } from "@/lib/data/api";
import type { Material, MaterialType } from "@/lib/data/types";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/student/materials")({
  head: pageHead("Course materials", "Browse, search and track your course readings, slides and lectures."),
  component: Materials,
});

const typeIcon: Record<MaterialType, typeof FileText> = { PDF: FileText, Slides: Presentation, Video: Film, Notes: StickyNote };

function Materials() {
  const db = useDB();
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState<Material | null>(null);

  const list = useMemo(() => {
    const q = query.toLowerCase();
    return db.materials.filter((m) => {
      const done = db.completedMaterials.includes(m.id);
      return (
        (course === "all" || m.courseId === course) &&
        (type === "all" || m.type === type) &&
        (status === "all" || (status === "done" ? done : !done)) &&
        (!q || m.title.toLowerCase().includes(q) || m.topic.toLowerCase().includes(q))
      );
    });
  }, [db, query, course, type, status]);

  return (
    <>
      <PageHeader eyebrow="Library" title="Course materials" description="Readings, slides, lectures and notes shared by your faculty." />
      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or topic" className="pl-9" />
        </div>
        <Select value={course} onValueChange={setCourse}>
          <SelectTrigger className="md:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {db.courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="md:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(["PDF", "Slides", "Video", "Notes"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="md:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="todo">To read</SelectItem>
            <SelectItem value="done">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No materials match" body="Try a different search or filter." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((m) => {
            const Icon = typeIcon[m.type];
            const done = db.completedMaterials.includes(m.id);
            return (
              <article key={m.id} className="flex flex-col rounded-lg border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="h-4 w-4 text-gold" /> {m.type} · {m.size}
                  </div>
                  {done && <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" /> Read</Badge>}
                </div>
                <h3 className="mt-3 text-lg leading-snug">{m.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{db.courses.find((c) => c.id === m.courseId)?.title} · {m.topic} · {formatDate(m.uploadedAt)}</p>
                <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{m.description}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOpen(m)}>Open</Button>
                  <Button size="sm" variant={done ? "ghost" : "default"} onClick={() => toggleMaterialComplete(m.id)}>
                    {done ? "Mark unread" : "Mark as read"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <p className="eyebrow">{open.type} · {open.topic}</p>
                <DialogTitle className="font-serif text-2xl font-medium">{open.title}</DialogTitle>
                <DialogDescription>{db.courses.find((c) => c.id === open.courseId)?.title}</DialogDescription>
              </DialogHeader>
              <p className="text-sm leading-relaxed">{open.description}</p>
              <div className="flex justify-end">
                <Button onClick={() => { toggleMaterialComplete(open.id); setOpen(null); }}>
                  {db.completedMaterials.includes(open.id) ? "Mark unread" : "Mark as read"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
