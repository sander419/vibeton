# COMPETITION OS — API SPECIFICATION

## Base URL: `/api`

### 1. Discovery & State
- `GET /api/state` — Returns full state snapshot including active events, current event state, users, teams, projects, submissions, judgements, and leaderboard.
- `GET /api/events` — Returns list of all competitions (Live Now, Upcoming, Recent) with template metadata and stats.
- `GET /api/events/:id` — Returns single event detail by ID.
- `GET /api/events/stream` — SSE realtime event stream.

### 2. Auth & Roles
- `POST /api/auth/register` — Register or update user profile and role (`participant`, `judge`, `organizer`, `observer`).
- `POST /api/auth/switch` — Switch active session user.

### 3. Universal Event Management (Organizer)
- `POST /api/events/create` — Create a new event with template (`VIBEATHON`, `DUEL`, `CHALLENGE`, `PITCH`).
- `POST /api/events/update` — Update event metadata, stages, and deadline.
- `POST /api/events/publish-results` — Publish official competition results and lock judging.

### 4. Duel / Battle Engine
- `POST /api/duel/action` — Control duel state (`START_ROUND`, `PAUSE_ROUND`, `END_ROUND`, `SET_SCORE`, `FINISH_DUEL`).
- `POST /api/duel/vote` — Audience vote for Participant A or B (enforced 1 vote per round/session).

### 5. Participant Flow & Projects
- `POST /api/teams/create` — Create team for current event.
- `POST /api/teams/join` — Join open team.
- `POST /api/projects/upsert` — Create or update project details, stack, and MVP milestones.
- `POST /api/posts/create` — Post 30-sec Devlog update.
- `POST /api/posts/react` — React to Devlog post with emoji.
- `POST /api/posts/comment` — Add comment to post.

### 6. Submission & Verification Gates
- `POST /api/submissions/validate-gate` — Test repository, demo URL, and README readiness.
- `POST /api/submissions/create` — Submit final work (enforces deadline).

### 7. Judging
- `POST /api/judgements/submit` — Submit rubric scores (1-10 per criterion) and feedback (judge only).

### 8. AI Host & Intelligence
- `POST /api/ai/host-broadcast` — Trigger AI broadcast with context grounding.
- `POST /api/ai/ask-host` — Ask AI host question (with persona: `STREAMER`, `MENTOR`, `ROAST`, `TIMEKEEPER`).
- `POST /api/ai/polish-post` — Polish raw devlog status into high-impact update.
- `POST /api/ai/team-match` — Synergistic team matching suggestions.
- `POST /api/ai/final-recap` — Generate and persist narrative final show recap.

### 9. Chat & Live Feed
- `POST /api/chat/send` — Send broadcast chat message.
- `POST /api/chat/pin` — Pin/unpin chat message (organizer).
- `POST /api/seed/reset` — Reset state with comprehensive demo seed.
