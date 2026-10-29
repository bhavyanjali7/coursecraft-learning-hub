export type Role = "student" | "faculty";

export interface User {
  id: string;
  name: string;
  role: Role;
  department: string;
  title: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  facultyId: string;
  credits: number;
  semester: string;
  description: string;
  enrolled: number;
}

export type MaterialType = "PDF" | "Slides" | "Video" | "Notes";

export interface Material {
  id: string;
  courseId: string;
  title: string;
  type: MaterialType;
  size: string;
  uploadedAt: string;
  topic: string;
  description: string;
}

export interface Question {
  id: string;
  courseId: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  text: string;
  options: string[];
  answer: number;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  status: "draft" | "published";
  timeLimit: number; // minutes
  questions: Question[];
  createdAt: string;
  publishedAt?: string;
  dueDate?: string;
}

export interface Submission {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: number[];
  score: number;
  total: number;
  timeTaken: number; // seconds
  submittedAt: string;
}

export interface Notification {
  id: string;
  role: Role;
  title: string;
  body: string;
  read: boolean;
  at: string;
  link?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  attendance: number;
  // baseline course scores (percent) before in-app quizzes
  baseline: Record<string, number>;
}

export interface PathStep {
  id: string;
  courseId: string;
  title: string;
  detail: string;
  done: boolean;
}

export interface DB {
  version: number;
  session: { userId: string; role: Role } | null;
  users: User[];
  courses: Course[];
  materials: Material[];
  questionBank: Question[];
  quizzes: Quiz[];
  submissions: Submission[];
  notifications: Notification[];
  students: Student[];
  completedMaterials: string[];
  path: PathStep[];
  scoreHistory: { week: string; score: number }[];
}
