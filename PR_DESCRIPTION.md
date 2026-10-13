## AI SBC clause suggestions (text + site photo)

### What changed
- **`/api/sbc-suggest`** (`app/api/sbc-suggest/route.ts`): given the engineer's finding, the AI picks up to 3 matching options from the project's **SBC Clause** menu. When none fits, it proposes a new SBC clause.
- **Form** (`QueueForm.tsx`):
  - Suggestions appear as a "Suggested SBC clause" box with **Select** buttons, and are marked `✨ … (AI suggestion)` in the menu.
  - Picking an AI-proposed clause saves it to the project (`POST /api/projects/{id}/testcases`) on submit and links the bug to it.
  - **"✨ Analyze photo with AI"**: for an attached image, the AI writes the Site Finding / Detailed finding and suggests the clause. Photos are resized in the browser (max 1280px JPEG) before upload.
  - Errors (auth, AI unavailable, no match) are shown in the form instead of failing silently.
- **Dashboard** renders `QueueForm` again (it was importing `QueueFormOld`), and appends newly created clauses to the menu.

### Why
Engineers must link each site finding to an SBC clause by hand. This suggests the clause from what they type or photograph; the engineer always confirms.

### Configuration
| Variable | Where | Purpose |
|---|---|---|
| `AI_API_KEY` | local + Vercel | Google Gemini key (free tier). Default models: `gemini-3.1-flash-lite`, fallback `gemini-flash-lite-latest` |
| `AI_MODEL` | optional | Comma-separated model override |
| `OPENAI_API_KEY` | optional | Used only when `AI_API_KEY` is not set |
| `API_URL_INTERNAL` | **local only** | e.g. `http://localhost:5066`. The route's auth check calls the .NET API from Node, which rejects the HTTPS dev certificate |

When no AI is reachable, a local keyword matcher (`clauseMatcher.ts`) ranks the project's clauses instead.

### Notes for reviewers
- The route requires a valid login (it checks the token against `GET /api/bugs/me`) because it spends the AI key.
- AI-proposed clauses come from the model's general SBC knowledge, so they're labelled for the engineer to verify.
- The first commit (`chore: …`) contains UI work that was already uncommitted before this change (TableOfQueue split into a folder, old `QueueFormOld` / `TableOfQueueOld` copies, account and home tweaks).
- Known existing type errors in `Dashboard.tsx` (lines ~206 and ~250: `DashboardHeader` props, `TableOfQueue` prop type) are not from this change.

### Testing
- Called the Gemini path directly: an exit-door finding matched the project clause; the kitchen extinguisher case proposed **SBC 801 – Fire extinguishers**; the Arabic handrail finding matched, with the reason in Arabic. Images without a violation returned "No building code violation identified."
- Not yet tested end to end in a logged-in browser, or with real site photos.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
