// All data operations live here so they can be replaced by backend calls.
import { newId, updateDB } from "./store";
import { STUDENT_ID } from "./seed";
import type { DB, Material, Notification, Question, Quiz, Role, Submission } from "./types";

const now = () => new Date().toISOString();

const notify = (db: DB, n: Omit<Notification, "id" | "read" | "at">): DB => ({
  ...db,
  notifications: [{ ...n, id: newId("n"), read: false, at: now() }, ...db.notifications],
});

/* ---------- pure helpers (tested) ---------- */

export function scoreQuiz(questions: Question[], answers: number[]) {
  const score = questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
  return { score, total: questions.length, percent: questions.length ? Math.round((score / questions.length) * 100) : 0 };
}

/** Quizzes a student may see: published only, never drafts. */
export function visibleQuizzesForStudent(db: DB) {
  return db.quizzes.filter((q) => q.status === "published");
}

export function studentAverage(db: DB, studentId: string) {
  const subs = db.submissions.filter((s) => s.studentId === studentId);
  const student = db.students.find((s) => s.id === studentId);
  const base = student ? Object.values(student.baseline) : [];
  const values = [...base, ...subs.map((s) => (s.score / s.total) * 100)];
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

export function courseScoreFor(db: DB, studentId: string, courseId: string) {
  const student = db.students.find((s) => s.id === studentId);
  const quizIds = new Set(db.quizzes.filter((q) => q.courseId === courseId).map((q) => q.id));
  const subs = db.submissions.filter((s) => s.studentId === studentId && quizIds.has(s.quizId));
  const vals = [...(student?.baseline[courseId] != null ? [student.baseline[courseId]] : []), ...subs.map((s) => (s.score / s.total) * 100)];
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

/* ---------- session ---------- */

export function login(role: Role, userId: string) {
  updateDB((db) => ({ ...db, session: { role, userId } }));
}
export function logout() {
  updateDB((db) => ({ ...db, session: null }));
}

/* ---------- notifications ---------- */

export function markAllRead(role: Role) {
  updateDB((db) => ({ ...db, notifications: db.notifications.map((n) => (n.role === role ? { ...n, read: true } : n)) }));
}

/* ---------- student progress ---------- */

export function toggleMaterialComplete(id: string) {
  updateDB((db) => ({
    ...db,
    completedMaterials: db.completedMaterials.includes(id)
      ? db.completedMaterials.filter((m) => m !== id)
      : [...db.completedMaterials, id],
  }));
}

export function togglePathStep(id: string) {
  updateDB((db) => ({ ...db, path: db.path.map((p) => (p.id === id ? { ...p, done: !p.done } : p)) }));
}

/* ---------- materials ---------- */

export function addMaterial(input: Omit<Material, "id" | "uploadedAt">) {
  updateDB((db) => {
    const course = db.courses.find((c) => c.id === input.courseId);
    const next = { ...db, materials: [{ ...input, id: newId("m"), uploadedAt: now().slice(0, 10) }, ...db.materials] };
    return notify(next, { role: "student", title: "New study material", body: `${input.title} was added to ${course?.title ?? "your course"}.`, link: "/student/materials" });
  });
}

export function deleteMaterial(id: string) {
  updateDB((db) => ({ ...db, materials: db.materials.filter((m) => m.id !== id) }));
}

/* ---------- quizzes (faculty) ---------- */

export function createQuizDraft(input: { title: string; courseId: string; timeLimit: number; questionIds: string[] }): string {
  const id = newId("quiz");
  updateDB((db) => {
    const questions = input.questionIds
      .map((qid) => db.questionBank.find((q) => q.id === qid))
      .filter(Boolean)
      .map((q) => ({ ...q!, options: [...q!.options] }));
    const quiz: Quiz = { id, title: input.title, courseId: input.courseId, timeLimit: input.timeLimit, status: "draft", questions, createdAt: now().slice(0, 10) };
    return { ...db, quizzes: [quiz, ...db.quizzes] };
  });
  return id;
}

/** Mock "generation": deterministic selection from the predefined question bank. */
export function suggestQuestions(db: DB, courseId: string, count: number, difficulty?: Question["difficulty"] | "Any") {
  const pool = db.questionBank.filter((q) => q.courseId === courseId && (!difficulty || difficulty === "Any" || q.difficulty === difficulty));
  return pool.slice(0, count).map((q) => q.id);
}

export function updateQuiz(id: string, patch: Partial<Omit<Quiz, "id">>) {
  updateDB((db) => ({ ...db, quizzes: db.quizzes.map((q) => (q.id === id ? { ...q, ...patch } : q)) }));
}

export function updateQuizQuestion(quizId: string, index: number, patch: Partial<Question>) {
  updateDB((db) => ({
    ...db,
    quizzes: db.quizzes.map((q) =>
      q.id === quizId ? { ...q, questions: q.questions.map((qq, i) => (i === index ? { ...qq, ...patch } : qq)) } : q,
    ),
  }));
}

export function removeQuizQuestion(quizId: string, index: number) {
  updateDB((db) => ({
    ...db,
    quizzes: db.quizzes.map((q) => (q.id === quizId ? { ...q, questions: q.questions.filter((_, i) => i !== index) } : q)),
  }));
}

export function addQuizQuestion(quizId: string, questionId: string) {
  updateDB((db) => {
    const src = db.questionBank.find((q) => q.id === questionId);
    if (!src) return db;
    return {
      ...db,
      quizzes: db.quizzes.map((q) => (q.id === quizId ? { ...q, questions: [...q.questions, { ...src, options: [...src.options] }] } : q)),
    };
  });
}

export function publishQuiz(id: string) {
  updateDB((db) => {
    const quiz = db.quizzes.find((q) => q.id === id);
    if (!quiz || quiz.questions.length === 0) return db;
    const due = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    const next = {
      ...db,
      quizzes: db.quizzes.map((q) => (q.id === id ? { ...q, status: "published" as const, publishedAt: now().slice(0, 10), dueDate: q.dueDate ?? due } : q)),
    };
    return notify(next, { role: "student", title: "New quiz published", body: `${quiz.title} is now available.`, link: "/student/quizzes" });
  });
}

export function unpublishQuiz(id: string) {
  updateQuiz(id, { status: "draft" });
}

export function deleteQuiz(id: string) {
  updateDB((db) => ({ ...db, quizzes: db.quizzes.filter((q) => q.id !== id), submissions: db.submissions.filter((s) => s.quizId !== id) }));
}

/* ---------- submissions (student) ---------- */

export function submitQuiz(quiz: Quiz, answers: number[], timeTaken: number, studentName: string): Submission {
  const { score, total } = scoreQuiz(quiz.questions, answers);
  const sub: Submission = { id: newId("sub"), quizId: quiz.id, studentId: STUDENT_ID, studentName, answers, score, total, timeTaken, submittedAt: now() };
  updateDB((db) => {
    const next = { ...db, submissions: [sub, ...db.submissions.filter((s) => !(s.quizId === quiz.id && s.studentId === STUDENT_ID))] };
    return notify(next, { role: "faculty", title: "New submission", body: `${studentName} scored ${score}/${total} on ${quiz.title}.`, link: "/faculty/analytics" });
  });
  return sub;
}
