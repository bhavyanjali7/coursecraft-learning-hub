// Simulated responses only. No model is called. Replace with a real service later.

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const KB: { keys: string[]; answer: string }[] = [
  { keys: ["overfit", "variance", "bias"], answer: "Overfitting happens when a model memorizes training data, including noise, and fails to generalize. Signs: low training error, high validation error. Remedies: more data, regularization (L1/L2), simpler models, dropout, early stopping, and cross-validation to tune complexity." },
  { keys: ["gradient", "descent", "learning rate"], answer: "Gradient descent updates parameters by stepping opposite to the gradient of the loss: θ ← θ − η∇L(θ). The learning rate η sets the step size. Too large and training diverges; too small and it crawls. Mini-batch variants trade noise for speed." },
  { keys: ["cnn", "convolution", "pooling"], answer: "A CNN learns filters that slide across an image, sharing weights spatially. Early layers detect edges, deeper layers detect shapes and objects. Pooling reduces spatial size, making features more robust to small shifts." },
  { keys: ["attention", "transformer", "self-attention"], answer: "Self-attention scores how much each token should attend to every other token using query–key dot products, then returns a weighted sum of value vectors. Transformers stack multi-head attention with feed-forward layers and positional encodings." },
  { keys: ["regularization", "l1", "l2", "lasso", "ridge"], answer: "L2 (ridge) adds the squared weight magnitude to the loss and shrinks weights smoothly. L1 (lasso) adds absolute values and pushes many weights to exactly zero, giving sparse, more interpretable models." },
  { keys: ["tf-idf", "tfidf", "embedding", "word2vec"], answer: "TF-IDF scores a term by how often it appears in a document, discounted by how common it is across the corpus. Embeddings like Word2Vec instead learn dense vectors from context so that similar words lie close together." },
  { keys: ["dijkstra", "graph", "shortest path"], answer: "Dijkstra's algorithm repeatedly extracts the closest unvisited node from a priority queue and relaxes its edges. It runs in O((V+E) log V) with a binary heap and requires non-negative edge weights." },
];

export async function tutorReply(question: string): Promise<string> {
  await wait(700 + question.length * 4);
  const lower = question.toLowerCase();
  const hit = KB.find((k) => k.keys.some((key) => lower.includes(key)));
  if (hit) return hit.answer;
  return "That's a good question. In this demo, the tutor answers from a small prepared set of topics: overfitting, gradient descent, CNNs, attention, regularization, TF-IDF and graph algorithms. Try asking about one of those, or check the course materials for this topic.";
}

const STOP = new Set("the a an and or of to in is are for on with by as at be it its this that from can into each such using than then they their which while also".split(" "));

export async function summarize(text: string, length: "short" | "detailed") {
  await wait(900);
  const sentences = text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 20);
  const freq = new Map<string, number>();
  text.toLowerCase().match(/[a-z][a-z-]{3,}/g)?.forEach((w) => !STOP.has(w) && freq.set(w, (freq.get(w) ?? 0) + 1));
  const scored = sentences.map((s, i) => ({
    s,
    i,
    score: (s.toLowerCase().match(/[a-z][a-z-]{3,}/g) ?? []).reduce((a, w) => a + (freq.get(w) ?? 0), 0) / Math.sqrt(s.length),
  }));
  const n = length === "short" ? Math.min(3, scored.length) : Math.min(6, scored.length);
  const points = [...scored].sort((a, b) => b.score - a.score).slice(0, n).sort((a, b) => a.i - b.i).map((x) => x.s.trim());
  const keyTerms = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
  return { points, keyTerms, wordCount: text.split(/\s+/).filter(Boolean).length };
}
