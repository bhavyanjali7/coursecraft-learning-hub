import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, ProgressBar } from "@/components/app/ui-bits";
import { useCurrentUser } from "@/components/app/app-shell";
import { useDB } from "@/lib/data/store";
import { submitQuiz } from "@/lib/data/api";
import type { Submission } from "@/lib/data/types";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/quiz/$quizId")({
  head: pageHead("Quiz attempt", "Answer each question and submit for instant scoring."),
  component: QuizPlayer,
});

function QuizPlayer() {
  const { quizId } = Route.useParams();
  const db = useDB();
  const user = useCurrentUser();
  const navigate = useNavigate();
  // Students may only open published quizzes; drafts are not found.
  const quiz = useMemo(() => db.quizzes.find((q) => q.id === quizId && q.status === "published"), [db.quizzes, quizId]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<Submission | null>(null);
  const [left, setLeft] = useState(() => (quiz?.timeLimit ?? 0) * 60);
  const started = useRef(Date.now());

  const finish = () => {
    if (!quiz || result) return;
    const filled = quiz.questions.map((_, i) => answers[i] ?? -1);
    const sub = submitQuiz(quiz, filled, Math.round((Date.now() - started.current) / 1000), user.name);
    setResult(sub);
    toast.success(`Submitted — you scored ${sub.score}/${sub.total}`);
  };

  useEffect(() => {
    if (!quiz || result) return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [quiz, result]);
  useEffect(() => {
    if (left <= 0 && quiz && !result) {
      toast.info("Time is up — your answers were submitted.");
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  if (!quiz) return <EmptyState title="Quiz unavailable" body="This quiz isn't published or no longer exists." />;

  const q = quiz.questions[idx]!;
  const answered = answers.filter((a) => a != null).length;
  const course = db.courses.find((c) => c.id === quiz.courseId);

  if (result) {
    const pct = Math.round((result.score / result.total) * 100);
    return (
      <>
        <PageHeader eyebrow={course?.title} title="Results" description={quiz.title} actions={
          <>
            <Button variant="outline" asChild><Link to="/student/quizzes">Back to quizzes</Link></Button>
            <Button asChild><Link to="/student/performance">View performance</Link></Button>
          </>
        } />
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-6"><p className="eyebrow">Score</p><p className="mt-2 font-serif text-4xl">{result.score}/{result.total}</p></div>
          <div className="rounded-lg border bg-card p-6"><p className="eyebrow">Percentage</p><p className="mt-2 font-serif text-4xl text-gold">{pct}%</p></div>
          <div className="rounded-lg border bg-card p-6"><p className="eyebrow">Time taken</p><p className="mt-2 font-serif text-4xl">{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</p></div>
        </div>
        <h2 className="mb-4 text-xl">Review</h2>
        <div className="space-y-4">
          {quiz.questions.map((qq, i) => {
            const ok = result.answers[i] === qq.answer;
            return (
              <div key={qq.id + i} className="rounded-lg border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", ok ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground")}>
                    {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  </span>
                  <div>
                    <p className="font-medium">{i + 1}. {qq.text}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Your answer: <span className="text-foreground">{qq.options[result.answers[i] ?? -1] ?? "Not answered"}</span></p>
                    {!ok && <p className="text-sm text-muted-foreground">Correct answer: <span className="text-success">{qq.options[qq.answer]}</span></p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow={course?.title} title={quiz.title} actions={
        <div className={cn("flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-sm", left < 60 && "border-destructive text-destructive")}>
          <Clock className="h-4 w-4" /> {Math.floor(Math.max(left, 0) / 60)}:{String(Math.max(left, 0) % 60).padStart(2, "0")}
        </div>
      } />
      <div className="mb-6 flex items-center gap-4">
        <ProgressBar value={(answered / quiz.questions.length) * 100} />
        <span className="whitespace-nowrap text-xs text-muted-foreground">{answered} of {quiz.questions.length} answered</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
        <div className="rounded-lg border bg-card p-6 md:p-8">
          <p className="eyebrow">Question {idx + 1} · {q.topic}</p>
          <p className="mt-3 font-serif text-2xl leading-snug">{q.text}</p>
          <div className="mt-6 space-y-2.5" role="radiogroup">
            {q.options.map((opt, oi) => {
              const sel = answers[idx] === oi;
              return (
                <button
                  key={oi}
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setAnswers((a) => { const n = [...a]; n[idx] = oi; return n; })}
                  className={cn("flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors", sel ? "border-gold bg-accent" : "hover:bg-muted")}
                >
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border text-xs", sel && "border-gold bg-gold text-gold-foreground")}>{String.fromCharCode(65 + oi)}</span>
                  {opt}
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex justify-between">
            <Button variant="outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Previous</Button>
            {idx < quiz.questions.length - 1 ? (
              <Button onClick={() => setIdx(idx + 1)}>Next</Button>
            ) : (
              <Button onClick={finish}>Submit quiz</Button>
            )}
          </div>
        </div>
        <aside className="rounded-lg border bg-card p-4">
          <p className="eyebrow mb-3">Questions</p>
          <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
            {quiz.questions.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={cn("h-9 rounded-md border text-sm", i === idx && "border-gold", answers[i] != null && "bg-primary text-primary-foreground")}>{i + 1}</button>
            ))}
          </div>
          <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate({ to: "/student/quizzes" })}>Leave quiz</Button>
        </aside>
      </div>
    </>
  );
}
