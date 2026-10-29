import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoNotice, EmptyState, PageHeader, Panel } from "@/components/app/ui-bits";
import { useDB } from "@/lib/data/store";
import { summarize } from "@/lib/data/mock-ai";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/student/summarize")({
  head: pageHead("Notes summary", "Condense notes or course material into key points and terms."),
  component: Summarize,
});

function Summarize() {
  const db = useDB();
  const [text, setText] = useState("");
  const [length, setLength] = useState<"short" | "detailed">("short");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof summarize>> | null>(null);

  const run = async () => {
    setBusy(true);
    setResult(await summarize(text, length));
    setBusy(false);
  };

  return (
    <>
      <PageHeader eyebrow="Study aid" title="Notes summary" description="Paste your notes or load a course material to pull out the key points." />
      <DemoNotice>Demo mode: summaries are produced by a simple sentence-ranking routine in your browser, not by an AI model.</DemoNotice>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <Panel title="Source">
          <div className="mb-3 flex flex-wrap gap-2">
            <Select onValueChange={(id) => setText(db.materials.find((m) => m.id === id)?.description ?? "")}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Load a course material" /></SelectTrigger>
              <SelectContent>
                {db.materials.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={length} onValueChange={(v) => setLength(v as "short" | "detailed")}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder="Paste notes here…" />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{text.split(/\s+/).filter(Boolean).length} words</p>
            <Button onClick={run} disabled={busy || text.trim().length < 40}>{busy ? "Summarizing…" : "Summarize"}</Button>
          </div>
        </Panel>
        <Panel title="Summary">
          {!result ? (
            <EmptyState title="No summary yet" body="Add at least a few sentences and press Summarize." />
          ) : (
            <div>
              <p className="eyebrow mb-3">Key points · sample output</p>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                {result.points.map((p, i) => <li key={i}>{p}</li>)}
              </ol>
              <p className="eyebrow mb-2 mt-6">Key terms</p>
              <div className="flex flex-wrap gap-2">
                {result.keyTerms.map((t) => <Badge key={t} variant="outline" className="border-gold/50">{t}</Badge>)}
              </div>
              <p className="mt-6 text-xs text-muted-foreground">Condensed from {result.wordCount} words.</p>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
