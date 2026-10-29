import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EmptyState, PageHeader } from "@/components/app/ui-bits";
import { useDB } from "@/lib/data/store";
import { addQuizQuestion, deleteQuiz, publishQuiz, removeQuizQuestion, unpublishQuiz, updateQuiz, updateQuizQuestion } from "@/lib/data/api";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faculty/quiz/$quizId")({
  head: pageHead("Edit quiz", "Edit quiz questions, answers and settings before publishing."),
  component: QuizEditor,
});

function QuizEditor() {
  const { quizId } = Route.useParams();
  const db = useDB();
  const navigate = useNavigate();
  const quiz = db.quizzes.find((q) => q.id === quizId);
  const [adding, setAdding] = useState("");
  if (!quiz) return <EmptyState title="Quiz not found" />;

  const course = db.courses.find((c) => c.id === quiz.courseId);
  const inQuiz = new Set(quiz.questions.map((q) => q.id));
  const available = db.questionBank.filter((q) => q.courseId === quiz.courseId && !inQuiz.has(q.id));

  return (
    <>
      <Link to="/faculty/quizzes" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> All quizzes</Link>
      <PageHeader
        eyebrow={`${course?.title} · ${quiz.status === "draft" ? "Draft — hidden from students" : "Published"}`}
        title={quiz.title}
        actions={
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="ghost"><Trash2 className="h-4 w-4" /> Delete</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this quiz?</AlertDialogTitle>
                  <AlertDialogDescription>The quiz and all its submissions will be removed.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { deleteQuiz(quiz.id); navigate({ to: "/faculty/quizzes" }); toast("Quiz deleted"); }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {quiz.status === "draft" ? (
              <Button disabled={!quiz.questions.length} onClick={() => { publishQuiz(quiz.id); toast.success("Published — students have been notified"); }}>Publish quiz</Button>
            ) : (
              <Button variant="outline" onClick={() => { unpublishQuiz(quiz.id); toast("Moved back to drafts — hidden from students"); }}>Unpublish</Button>
            )}
          </>
        }
      />

      <div className="mb-8 grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[1fr_160px_160px]">
        <div className="space-y-1.5"><Label htmlFor="title">Title</Label><Input id="title" value={quiz.title} onChange={(e) => updateQuiz(quiz.id, { title: e.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor="time">Time limit (min)</Label><Input id="time" type="number" min={1} value={quiz.timeLimit} onChange={(e) => updateQuiz(quiz.id, { timeLimit: Math.max(1, Number(e.target.value)) })} /></div>
        <div className="space-y-1.5"><Label htmlFor="due">Due date</Label><Input id="due" type="date" value={quiz.dueDate ?? ""} onChange={(e) => updateQuiz(quiz.id, { dueDate: e.target.value })} /></div>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((q, i) => (
          <div key={q.id + i} className="rounded-lg border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg">Q{i + 1}</span>
                <Badge variant="outline">{q.topic}</Badge>
                <Badge variant="outline">{q.difficulty}</Badge>
              </div>
              <Button variant="ghost" size="icon" aria-label="Remove question" onClick={() => removeQuizQuestion(quiz.id, i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <Textarea value={q.text} rows={2} onChange={(e) => updateQuizQuestion(quiz.id, i, { text: e.target.value })} />
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className={cn("flex items-center gap-2 rounded-md border p-1.5 pl-2", q.answer === oi && "border-success")}>
                  <button
                    type="button"
                    onClick={() => updateQuizQuestion(quiz.id, i, { answer: oi })}
                    aria-label={`Mark option ${String.fromCharCode(65 + oi)} correct`}
                    className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs", q.answer === oi && "border-success bg-success text-primary-foreground")}
                  >
                    {String.fromCharCode(65 + oi)}
                  </button>
                  <Input
                    value={opt}
                    className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0"
                    onChange={(e) => updateQuizQuestion(quiz.id, i, { options: q.options.map((o, k) => (k === oi ? e.target.value : o)) })}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Click a letter to set the correct answer.</p>
          </div>
        ))}
        {quiz.questions.length === 0 && <EmptyState title="No questions yet" body="Add questions from the bank below." />}
      </div>

      <div className="mt-6 flex flex-col gap-2 rounded-lg border border-dashed p-4 sm:flex-row">
        <Select value={adding} onValueChange={setAdding}>
          <SelectTrigger className="flex-1"><SelectValue placeholder={available.length ? "Add a question from the bank" : "All bank questions are in this quiz"} /></SelectTrigger>
          <SelectContent>{available.map((q) => <SelectItem key={q.id} value={q.id}>{q.text}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" disabled={!adding} onClick={() => { addQuizQuestion(quiz.id, adding); setAdding(""); }}><Plus className="h-4 w-4" /> Add</Button>
      </div>
    </>
  );
}
