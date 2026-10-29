import type { DB, Question } from "./types";

export const STUDENT_ID = "stu-bhavyanjali";
export const FACULTY_ID = "fac-aparna";

const q = (
  id: string,
  courseId: string,
  topic: string,
  difficulty: Question["difficulty"],
  text: string,
  options: string[],
  answer: number,
): Question => ({ id, courseId, topic, difficulty, text, options, answer });

const bank: Question[] = [
  // Machine Learning
  q("q-ml-1", "ml", "Regression", "Easy", "Which loss function is most commonly used for linear regression?", ["Cross-entropy", "Mean squared error", "Hinge loss", "KL divergence"], 1),
  q("q-ml-2", "ml", "Bias–Variance", "Medium", "A model with very low training error but high test error is most likely suffering from:", ["Underfitting", "High bias", "Overfitting", "Data leakage"], 2),
  q("q-ml-3", "ml", "Regularization", "Medium", "L1 regularization tends to produce:", ["Dense weights", "Sparse weights", "Larger weights", "Negative weights only"], 1),
  q("q-ml-4", "ml", "Evaluation", "Easy", "Which metric is best suited to a highly imbalanced binary classification task?", ["Accuracy", "F1 score", "Mean absolute error", "R²"], 1),
  q("q-ml-5", "ml", "Clustering", "Medium", "In k-means, the centroid of a cluster is updated as:", ["The median point", "The mean of assigned points", "A random point", "The farthest point"], 1),
  q("q-ml-6", "ml", "Trees", "Hard", "Random forests reduce variance primarily through:", ["Boosting weak learners", "Bagging and feature subsampling", "Pruning deeper", "Gradient descent"], 1),
  q("q-ml-7", "ml", "Evaluation", "Medium", "k-fold cross-validation is mainly used to:", ["Speed up training", "Estimate generalization performance", "Increase dataset size", "Remove outliers"], 1),
  // Deep Learning
  q("q-dl-1", "dl", "Activations", "Easy", "Which activation helps mitigate the vanishing gradient problem in deep networks?", ["Sigmoid", "Tanh", "ReLU", "Step"], 2),
  q("q-dl-2", "dl", "CNNs", "Medium", "The main purpose of pooling layers in a CNN is to:", ["Add non-linearity", "Reduce spatial dimensions", "Normalize inputs", "Increase parameters"], 1),
  q("q-dl-3", "dl", "Optimization", "Medium", "Adam optimizer combines momentum with:", ["Dropout", "Adaptive per-parameter learning rates", "Batch normalization", "Weight tying"], 1),
  q("q-dl-4", "dl", "Regularization", "Easy", "Dropout randomly:", ["Removes training samples", "Zeros a fraction of activations during training", "Freezes layers", "Shrinks the learning rate"], 1),
  q("q-dl-5", "dl", "RNNs", "Hard", "LSTMs address long-range dependencies mainly using:", ["Convolutions", "Gating mechanisms", "Pooling", "Residual blocks"], 1),
  q("q-dl-6", "dl", "Transfer Learning", "Medium", "Fine-tuning a pretrained model typically involves:", ["Random re-initialization", "Training only on test data", "Updating some or all pretrained weights on a new task", "Removing all layers"], 2),
  // NLP
  q("q-nlp-1", "nlp", "Text Processing", "Easy", "Tokenization refers to:", ["Encrypting text", "Splitting text into units such as words or subwords", "Translating text", "Removing punctuation only"], 1),
  q("q-nlp-2", "nlp", "Representations", "Medium", "TF-IDF assigns higher weight to terms that are:", ["Frequent in all documents", "Frequent in a document but rare across the corpus", "Rare everywhere", "Stopwords"], 1),
  q("q-nlp-3", "nlp", "Embeddings", "Medium", "Word2Vec learns word vectors using:", ["Character n-grams only", "Local context prediction", "Parse trees", "Manual labels"], 1),
  q("q-nlp-4", "nlp", "Transformers", "Hard", "Self-attention computes outputs as a weighted sum of:", ["Queries", "Keys", "Values", "Gradients"], 2),
  q("q-nlp-5", "nlp", "Evaluation", "Medium", "BLEU is primarily used to evaluate:", ["Sentiment classifiers", "Machine translation output", "Topic models", "Spell checkers"], 1),
  // DSA
  q("q-dsa-1", "dsa", "Complexity", "Easy", "Binary search on a sorted array runs in:", ["O(n)", "O(log n)", "O(n log n)", "O(1)"], 1),
  q("q-dsa-2", "dsa", "Graphs", "Medium", "Dijkstra's algorithm fails with:", ["Cycles", "Negative edge weights", "Undirected graphs", "Dense graphs"], 1),
  q("q-dsa-3", "dsa", "Hashing", "Medium", "Average lookup in a well-designed hash table is:", ["O(1)", "O(log n)", "O(n)", "O(n²)"], 0),
];

const pick = (...ids: string[]) => ids.map((id) => ({ ...bank.find((b) => b.id === id)! }));

export function createSeed(): DB {
  return {
    version: 1,
    session: null,
    users: [
      { id: STUDENT_ID, name: "Bhavyanjali", role: "student", department: "CSE-AIML", title: "B.Tech, Semester VII" },
      { id: FACULTY_ID, name: "Dr. Aparna", role: "faculty", department: "CSE-AIML", title: "Associate Professor" },
    ],
    courses: [
      { id: "ml", code: "AI401", title: "Machine Learning", facultyId: FACULTY_ID, credits: 4, semester: "VII", enrolled: 62, description: "Supervised and unsupervised learning, model evaluation and regularization." },
      { id: "dl", code: "AI402", title: "Deep Learning", facultyId: FACULTY_ID, credits: 4, semester: "VII", enrolled: 58, description: "Neural networks, CNNs, sequence models and optimization." },
      { id: "nlp", code: "AI403", title: "Natural Language Processing", facultyId: FACULTY_ID, credits: 3, semester: "VII", enrolled: 54, description: "Text representations, embeddings, transformers and evaluation." },
      { id: "dsa", code: "CS204", title: "Data Structures & Algorithms", facultyId: "fac-other", credits: 3, semester: "VII", enrolled: 64, description: "Complexity, graphs, hashing and algorithm design." },
    ],
    materials: [
      { id: "m1", courseId: "ml", title: "Linear Models and Gradient Descent", type: "PDF", size: "2.4 MB", uploadedAt: "2026-10-02", topic: "Regression", description: "Linear regression is fitted by minimizing mean squared error. Gradient descent iteratively updates weights in the direction of the negative gradient. The learning rate controls step size; too large a rate diverges, too small converges slowly. Feature scaling improves convergence. Closed-form solutions exist via the normal equation but are expensive for large feature sets." },
      { id: "m2", courseId: "ml", title: "Bias, Variance and Regularization", type: "Slides", size: "5.1 MB", uploadedAt: "2026-10-09", topic: "Regularization", description: "Generalization error decomposes into bias, variance and irreducible noise. Simple models underfit with high bias; complex models overfit with high variance. L2 regularization shrinks weights smoothly while L1 drives many weights to zero, producing sparse models. Cross-validation helps choose the regularization strength." },
      { id: "m3", courseId: "ml", title: "Ensemble Methods Walkthrough", type: "Video", size: "48 min", uploadedAt: "2026-10-16", topic: "Trees", description: "Decision trees split data on features that maximize information gain. Bagging trains trees on bootstrap samples and averages predictions to reduce variance. Random forests also subsample features at each split. Boosting builds trees sequentially, each correcting the errors of the previous ones." },
      { id: "m4", courseId: "dl", title: "Convolutional Neural Networks", type: "PDF", size: "3.8 MB", uploadedAt: "2026-10-05", topic: "CNNs", description: "Convolutional layers apply learned filters that share weights across spatial positions. Pooling layers reduce spatial dimensions and add translation invariance. Deep CNNs stack many such layers; residual connections ease optimization of very deep models. Data augmentation improves robustness." },
      { id: "m5", courseId: "dl", title: "Optimizers: SGD to Adam", type: "Notes", size: "640 KB", uploadedAt: "2026-10-12", topic: "Optimization", description: "Stochastic gradient descent updates parameters using mini-batches. Momentum accumulates past gradients to accelerate in consistent directions. RMSProp scales updates by a running average of squared gradients. Adam combines momentum and adaptive learning rates and is a strong default." },
      { id: "m6", courseId: "nlp", title: "From TF-IDF to Embeddings", type: "Slides", size: "4.2 MB", uploadedAt: "2026-10-07", topic: "Representations", description: "Bag-of-words ignores word order. TF-IDF weights terms frequent in a document but rare in the corpus. Word embeddings such as Word2Vec map words to dense vectors learned from context, capturing semantic similarity. Subword tokenization handles rare words." },
      { id: "m7", courseId: "nlp", title: "Attention and Transformers", type: "PDF", size: "3.1 MB", uploadedAt: "2026-10-20", topic: "Transformers", description: "Self-attention lets each token attend to every other token using queries, keys and values. Multi-head attention captures different relationships in parallel. Positional encodings inject order information. Transformers replaced recurrence and enabled large pretrained language models." },
      { id: "m8", courseId: "dsa", title: "Graph Algorithms Reference", type: "Notes", size: "820 KB", uploadedAt: "2026-10-03", topic: "Graphs", description: "Breadth-first search finds shortest paths in unweighted graphs. Dijkstra's algorithm handles non-negative weights using a priority queue. Bellman-Ford supports negative weights and detects negative cycles. Topological sort orders directed acyclic graphs." },
    ],
    questionBank: bank,
    quizzes: [
      { id: "quiz-ml-1", title: "Unit 2 · Model Evaluation", courseId: "ml", status: "published", timeLimit: 10, questions: pick("q-ml-2", "q-ml-3", "q-ml-4", "q-ml-7", "q-ml-5"), createdAt: "2026-10-18", publishedAt: "2026-10-19", dueDate: "2026-11-08" },
      { id: "quiz-dl-1", title: "CNN Fundamentals Check", courseId: "dl", status: "published", timeLimit: 8, questions: pick("q-dl-1", "q-dl-2", "q-dl-4", "q-dl-3"), createdAt: "2026-10-21", publishedAt: "2026-10-22", dueDate: "2026-11-05" },
      { id: "quiz-nlp-draft", title: "Transformers Deep Dive", courseId: "nlp", status: "draft", timeLimit: 12, questions: pick("q-nlp-3", "q-nlp-4", "q-nlp-5"), createdAt: "2026-10-27" },
    ],
    submissions: [
      { id: "s1", quizId: "quiz-ml-1", studentId: "stu-2", studentName: "Rahul Verma", answers: [2, 1, 1, 1, 1], score: 5, total: 5, timeTaken: 412, submittedAt: "2026-10-20T10:12:00Z" },
      { id: "s2", quizId: "quiz-ml-1", studentId: "stu-3", studentName: "Sneha Reddy", answers: [2, 0, 1, 1, 1], score: 4, total: 5, timeTaken: 380, submittedAt: "2026-10-20T11:30:00Z" },
      { id: "s3", quizId: "quiz-ml-1", studentId: "stu-4", studentName: "Arjun Nair", answers: [0, 1, 0, 1, 2], score: 2, total: 5, timeTaken: 540, submittedAt: "2026-10-21T09:05:00Z" },
      { id: "s4", quizId: "quiz-ml-1", studentId: "stu-5", studentName: "Kavya Iyer", answers: [2, 1, 1, 0, 1], score: 4, total: 5, timeTaken: 455, submittedAt: "2026-10-21T14:44:00Z" },
      { id: "s5", quizId: "quiz-ml-1", studentId: "stu-6", studentName: "Mohammed Faiz", answers: [1, 1, 0, 1, 1], score: 3, total: 5, timeTaken: 501, submittedAt: "2026-10-22T08:20:00Z" },
      { id: "s6", quizId: "quiz-dl-1", studentId: "stu-2", studentName: "Rahul Verma", answers: [2, 1, 1, 1], score: 4, total: 4, timeTaken: 300, submittedAt: "2026-10-23T10:00:00Z" },
      { id: "s7", quizId: "quiz-dl-1", studentId: "stu-7", studentName: "Ishita Sharma", answers: [2, 0, 1, 0], score: 2, total: 4, timeTaken: 420, submittedAt: "2026-10-23T12:10:00Z" },
      { id: "s8", quizId: "quiz-dl-1", studentId: "stu-3", studentName: "Sneha Reddy", answers: [2, 1, 1, 0], score: 3, total: 4, timeTaken: 350, submittedAt: "2026-10-24T09:40:00Z" },
    ],
    notifications: [
      { id: "n1", role: "student", title: "New quiz published", body: "CNN Fundamentals Check is now open in Deep Learning.", read: false, at: "2026-10-22T09:00:00Z", link: "/student/quizzes" },
      { id: "n2", role: "student", title: "New material", body: "Attention and Transformers was added to NLP.", read: false, at: "2026-10-20T09:00:00Z", link: "/student/materials" },
      { id: "n3", role: "faculty", title: "New submissions", body: "3 students submitted CNN Fundamentals Check.", read: false, at: "2026-10-24T10:00:00Z", link: "/faculty/analytics" },
    ],
    students: [
      { id: STUDENT_ID, name: "Bhavyanjali", rollNo: "21AIML014", department: "CSE-AIML", attendance: 92, baseline: { ml: 78, dl: 72, nlp: 64 } },
      { id: "stu-2", name: "Rahul Verma", rollNo: "21AIML021", department: "CSE-AIML", attendance: 95, baseline: { ml: 88, dl: 90, nlp: 81 } },
      { id: "stu-3", name: "Sneha Reddy", rollNo: "21AIML033", department: "CSE-AIML", attendance: 89, baseline: { ml: 80, dl: 76, nlp: 84 } },
      { id: "stu-4", name: "Arjun Nair", rollNo: "21AIML007", department: "CSE-AIML", attendance: 71, baseline: { ml: 52, dl: 58, nlp: 49 } },
      { id: "stu-5", name: "Kavya Iyer", rollNo: "21AIML040", department: "CSE-AIML", attendance: 86, baseline: { ml: 82, dl: 70, nlp: 77 } },
      { id: "stu-6", name: "Mohammed Faiz", rollNo: "21AIML045", department: "CSE-AIML", attendance: 80, baseline: { ml: 66, dl: 63, nlp: 70 } },
      { id: "stu-7", name: "Ishita Sharma", rollNo: "21AIML052", department: "CSE-AIML", attendance: 77, baseline: { ml: 61, dl: 55, nlp: 68 } },
      { id: "stu-8", name: "Vikram Rao", rollNo: "21AIML058", department: "CSE-AIML", attendance: 68, baseline: { ml: 48, dl: 51, nlp: 55 } },
    ],
    completedMaterials: ["m1", "m4"],
    path: [
      { id: "p1", courseId: "ml", title: "Revise linear models", detail: "Read Linear Models and Gradient Descent", done: true },
      { id: "p2", courseId: "ml", title: "Bias–variance trade-off", detail: "Study regularization slides and attempt Unit 2 quiz", done: false },
      { id: "p3", courseId: "ml", title: "Ensembles", detail: "Watch the ensemble walkthrough", done: false },
      { id: "p4", courseId: "dl", title: "CNN foundations", detail: "Complete CNN Fundamentals Check", done: true },
      { id: "p5", courseId: "dl", title: "Optimizers", detail: "Compare SGD, momentum and Adam", done: false },
      { id: "p6", courseId: "nlp", title: "Text representations", detail: "TF-IDF and Word2Vec", done: false },
      { id: "p7", courseId: "nlp", title: "Attention mechanisms", detail: "Read Attention and Transformers", done: false },
    ],
    scoreHistory: [
      { week: "W1", score: 62 },
      { week: "W2", score: 66 },
      { week: "W3", score: 64 },
      { week: "W4", score: 71 },
      { week: "W5", score: 74 },
      { week: "W6", score: 73 },
      { week: "W7", score: 78 },
    ],
  };
}
