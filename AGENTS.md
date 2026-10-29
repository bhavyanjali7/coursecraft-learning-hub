<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- All app data goes through `src/lib/data/api.ts` (operations) over `src/lib/data/store.ts` (browser-storage persistence); components never touch storage directly, so a real backend can replace the store later.
- "AI" features (`src/lib/data/mock-ai.ts`) are local simulations and UI must label them as demo output, never claim real AI processing.
- Role portals are `/student/*` and `/faculty/*` layouts guarded by `AppShell`, which redirects to `/` when the session role doesn't match.
