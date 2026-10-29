import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader } from "@/components/app/ui-bits";
import { useDB } from "@/lib/data/store";
import { recommendationsFor } from "@/lib/data/derived";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/student/recommendations")({
  head: pageHead("Recommendations", "Suggestions based on your scores, open quizzes and reading progress."),
  component: Recommendations,
});

function Recommendations() {
  const db = useDB();
  const [kind, setKind] = useState("all");
  const recs = useMemo(() => recommendationsFor(db).filter((r) => kind === "all" || r.kind === kind), [db, kind]);
  return (
    <>
      <PageHeader eyebrow="For you" title="Recommendations" description="Suggestions drawn from your quiz results, reading progress and learning path. They update as you work." />
      <Tabs value={kind} onValueChange={setKind} className="mb-6">
        <TabsList>
          {["all", "Quiz", "Material", "Practice", "Path"].map((k) => <TabsTrigger key={k} value={k}>{k === "all" ? "All" : k}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      {recs.length === 0 ? <EmptyState title="Nothing here right now" /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {recs.map((r) => (
            <Link key={r.id} to={r.to as "/"} className="group rounded-lg border bg-card p-5 transition-colors hover:border-gold">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-gold/50 text-gold">{r.kind}</Badge>
                <span className="text-xs text-muted-foreground">{r.priority} priority</span>
              </div>
              <p className="mt-3 font-serif text-lg">{r.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.reason}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-gold">Go <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
