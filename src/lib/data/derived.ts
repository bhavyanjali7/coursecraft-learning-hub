import { courseScoreFor, visibleQuizzesForStudent } from "./api";
import { STUDENT_ID } from "./seed";
import type { DB } from "./types";

export interface Recommendation {
  id: string;
  kind: "Material" | "Quiz" | "Practice" | "Path";
  title: string;
  reason: string;
  to: string;
  priority: "High" | "Medium" | "Low";
}

/** Rule-based recommendations from the student's own data (no AI involved). */
export function recommendationsFor(db: DB): Recommendation[] {
  const recs: Recommendation[] = [];
  const myCourses = ["ml", "dl", "nlp"];
  const scores = myCourses.map((c) => ({ c, s: courseScoreFor(db, STUDENT_ID, c) })).sort((a, b) => a.s - b.s);
  const done = new Set(db.submissions.filter((s) => s.studentId === STUDENT_ID).map((s) => s.quizId));
  const courseName = (id: string) => db.courses.find((c) => c.id === id)?.title ?? id;

  for (const q of visibleQuizzesForStudent(db)) {
    if (!done.has(q.id)) recs.push({ id: `r-q-${q.id}`, kind: "Quiz", title: q.title, reason: `Open quiz in ${courseName(q.courseId)} — due ${q.dueDate ?? "soon"}.`, to: "/student/quizzes", priority: "High" });
  }
  scores.slice(0, 2).forEach(({ c, s }) => {
    const mat = db.materials.find((m) => m.courseId === c && !db.completedMaterials.includes(m.id));
    if (mat) recs.push({ id: `r-m-${mat.id}`, kind: "Material", title: mat.title, reason: `${courseName(c)} is at ${s}% — this ${mat.type.toLowerCase()} covers ${mat.topic}.`, to: "/student/materials", priority: s < 70 ? "High" : "Medium" });
  });
  for (const sub of db.submissions.filter((s) => s.studentId === STUDENT_ID)) {
    const quiz = db.quizzes.find((q) => q.id === sub.quizId);
    if (!quiz) continue;
    const missed = quiz.questions.filter((qq, i) => sub.answers[i] !== qq.answer).map((qq) => qq.topic);
    if (missed.length) recs.push({ id: `r-p-${sub.id}`, kind: "Practice", title: `Review: ${[...new Set(missed)].join(", ")}`, reason: `You missed ${missed.length} question(s) on ${quiz.title}.`, to: "/student/tutor", priority: "Medium" });
  }
  const nextStep = db.path.find((p) => !p.done);
  if (nextStep) recs.push({ id: `r-s-${nextStep.id}`, kind: "Path", title: nextStep.title, reason: `Next step on your learning path: ${nextStep.detail}.`, to: "/student/path", priority: "Low" });
  return recs;
}
