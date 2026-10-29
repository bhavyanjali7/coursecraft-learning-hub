import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DemoNotice, PageHeader } from "@/components/app/ui-bits";
import { tutorReply } from "@/lib/data/mock-ai";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/tutor")({
  head: pageHead("Tutor demo", "Ask study questions and get prepared, simulated explanations."),
  component: Tutor,
});

interface Msg { from: "you" | "tutor"; text: string }

const prompts = ["How do I avoid overfitting?", "Explain gradient descent simply", "What does self-attention do?", "L1 vs L2 regularization"];

function Tutor() {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "tutor", text: "Hello Bhavyanjali. Ask me about a concept from your courses and I'll walk you through it." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs, busy]);

  const ask = async (text: string) => {
    if (!text.trim() || busy) return;
    setMsgs((m) => [...m, { from: "you", text }]);
    setInput("");
    setBusy(true);
    const reply = await tutorReply(text);
    setMsgs((m) => [...m, { from: "tutor", text: reply }]);
    setBusy(false);
  };

  return (
    <>
      <PageHeader eyebrow="Study aid" title="Tutor" description="Work through concepts in conversation." />
      <DemoNotice>Demo mode: replies are prepared sample explanations matched by keyword. No AI model processes your questions.</DemoNotice>
      <div className="mt-4 flex h-[60vh] flex-col rounded-lg border bg-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {msgs.map((m, i) => (
            <div key={i} className={cn("flex", m.from === "you" && "justify-end")}>
              <div className={cn("max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed", m.from === "you" ? "bg-primary text-primary-foreground" : "border bg-background")}>
                {m.from === "tutor" && <p className="eyebrow mb-1">Tutor · sample response</p>}
                {m.text}
              </div>
            </div>
          ))}
          {busy && <p className="text-xs text-muted-foreground">Preparing a response…</p>}
          <div ref={end} />
        </div>
        <div className="border-t p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button key={p} onClick={() => ask(p)} className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-gold hover:text-foreground">{p}</button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
              placeholder="Ask a question…"
              rows={1}
              className="min-h-10 resize-none"
            />
            <Button type="submit" disabled={busy || !input.trim()} aria-label="Send"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </div>
    </>
  );
}
