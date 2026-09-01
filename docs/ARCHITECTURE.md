# COMPETITION OS — SYSTEM ARCHITECTURE
Version: 2.0.0-PROD
Date: 2026-09-01

---

## 1. ARCHITECTURAL OVERVIEW

```
                         COMPETITION OS
                               |
                        EVENT ENGINE
                               |
       ----------------------------------------------------
       |            |             |           |           |
    TEMPLATE     REALTIME      AI HOST     JUDGING     ANALYTICS &
     ROUTER     (SSE / PubSub) (Gemini)    & GATES      TELEMETRY
       |
  ----------------------------------------------------
  |              |              |                    |
VIBEATHON      DUEL          CHALLENGE           PITCH / DEMO
(Hackathon)  (1v1 Battle)   (Speed Run)             DAY
```

---

## 2. CORE CONCEPTS

### 2.1 Universal Event Entity
Every competition in Competition OS is an `Event` with a `template_type`:
- `VIBEATHON`: Team-based asynchronous building, 30-sec Devlog, Milestones, Submission Gates, Multi-criteria Jury.
- `DUEL`: Synchronous 1v1 live battle, multi-round countdown timer, dual video/camera feeds, round scoring, audience real-time voting, AI commentary.
- `CHALLENGE`: Speed-run or prompt engineering contest with objective automated or peer verification.
- `PITCH`: Stage presentations, live audience polls, Q&A timers, and jury scorecards.

### 2.2 Event Engine & Event Logs
The Event Engine is the **single source of truth**. Every state transition generates an immutable `EventLog`:
```ts
interface EventLog {
  id: string;
  eventId: string;
  type: string; // EVENT_STARTED | PROGRESS_POSTED | ROUND_STARTED | SUBMISSION_CREATED | etc.
  actorId?: string;
  actorName?: string;
  targetId?: string;
  message: string;
  metadata?: Record<string, any>;
  visibility: 'PUBLIC' | 'ORGANIZER' | 'JUDGE' | 'TEAM';
  createdAt: string;
}
```

### 2.3 Realtime Pipeline
- **Transport**: Server-Sent Events (SSE) with structured event payloads.
- **Channels**: Global event stream and event-scoped feeds (`/api/events/:id/feed` and `/api/events/stream`).
- **Clients**: Observer, Participant, Judge, Organizer UIs receive instantaneous telemetry updates.

### 2.4 AI Host Architecture
- **Engine**: Gemini 3.7 Flash via `@google/genai` (Server-side only).
- **Guarantees**:
  1. AI never judges submissions or determines official rankings.
  2. AI receives only public context (no private judging notes, draft scores, or private chats).
  3. AI broadcasts are triggered on critical lifecycle events (Event Start, Milestone, Round Finish, Deadline Approaching, Final Show Recap) with rate limiting.
  4. Graceful offline degradation when Gemini API key is not present.

---

## 3. DATA SCHEMA & ENTITIES

- **Organization**: `id`, `name`, `slug`, `settings`
- **User**: `id`, `name`, `username`, `email`, `avatar`, `role`, `skills`, `stack`, `bio`
- **Event**:
  - `id`: string
  - `templateType`: `VIBEATHON` | `DUEL` | `CHALLENGE` | `PITCH`
  - `title`: string
  - `description`: string
  - `status`: `DRAFT` | `REGISTRATION` | `ACTIVE` | `SUBMISSION` | `JUDGING` | `RESULTS` | `ARCHIVED`
  - `startAt`, `endAt`, `deadline`: ISO timestamp strings
  - `config`: Template-specific JSON config (rounds, criteria, rubric, maxTeamSize)
  - `organizerId`, `organizerName`: string
- **DuelState** (for DUEL template):
  - `currentRound`: number
  - `totalRounds`: number
  - `roundDurationSec`: number
  - `roundRemainingSec`: number
  - `roundStatus`: `IDLE` | `RUNNING` | `PAUSED` | `COMPLETED`
  - `participantA`: { id, name, avatar, streamUrl, score, votes }
  - `participantB`: { id, name, avatar, streamUrl, score, votes }
  - `winnerId`?: string
- **Submission & SubmissionGate**:
  - `status`: `DRAFT` | `SUBMITTED` | `LOCKED` | `UNDER_REVIEW` | `REVIEWED`
  - `gates`: Repository check, Demo URL check, README verification, Instructions check.
- **Judgement**: `submissionId`, `judgeId`, `scores` (1-10 per criterion), `totalScore`, `feedback`.
- **EventRecap**: Permanent stored narrative artifact of completed events with highlights, stats, and winner story.

---

## 4. SECURITY & ACCESS CONTROL
- **Role Hierarchy**: `GUEST` < `OBSERVER` < `PARTICIPANT` < `TEAM_LEADER` < `JUDGE` < `ORGANIZER` < `ADMIN`.
- **Enforcement**:
  - Organizer endpoints (`/api/hackathon/update`, `/api/events/control`, `/api/events/publish-results`) strictly verify role.
  - Judge endpoints (`/api/judgements/submit`) require `judge` or `organizer` role.
  - Submissions are rejected by backend if current time exceeds `event.deadline` (unless organizer override).
  - Observer Mode is 100% anonymous with read-only access and anti-spam audience voting rate limits.
