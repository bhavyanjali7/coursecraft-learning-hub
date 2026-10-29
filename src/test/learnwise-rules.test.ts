import { describe, expect, it } from "vitest";
import { scoreQuiz, visibleQuizzesForStudent } from "@/lib/data/api";
import { createSeed } from "@/lib/data/seed";

describe("LearnWise rules", () => {
  it("scores one point per correct answer", () => {
    const db = createSeed();
    const quiz = db.quizzes.find((q) => q.id === "quiz-ml-1")!;
    const answers = quiz.questions.map((q, i) => (i < 3 ? q.answer : -1));
    expect(scoreQuiz(quiz.questions, answers)).toEqual({ score: 3, total: 5, percent: 60 });
  });

  it("hides draft quizzes from students", () => {
    const db = createSeed();
    const ids = visibleQuizzesForStudent(db).map((q) => q.id);
    expect(ids).not.toContain("quiz-nlp-draft");
    expect(ids).toContain("quiz-ml-1");
  });
});
