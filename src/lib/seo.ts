export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} · LearnWise` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · LearnWise` },
    { property: "og:description", content: description },
    { name: "robots", content: "noindex" },
  ],
});
