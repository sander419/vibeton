# PRODUCTION AUDIT — COMPETITION OS
Date: 2026-09-01
Author: Senior Full-Stack Product Engineer + System Architect

---

## 1. EXECUTIVE SUMMARY
The existing codebase is a high-fidelity live hackathon station ("PulseOS / Вайбатон №2"). It contains a working Express + React 19 + Tailwind + Vite full-stack application with Gemini 3.7 AI Host integration, Web Audio API synthesis, Server-Sent Events (SSE) realtime bus, and comprehensive UI components.

To evolve this repository into **Competition OS** (a multi-format Event Engine supporting Vibeathons, Duels, Challenges, Tournaments, and Observer Broadcasts), we must generalize the single-hackathon store into a multi-event engine without breaking existing working features.

---

## 2. CURRENT ARCHITECTURE

### Backend (`/server.ts`):
- **Framework**: Express 4 with TypeScript (`tsx` in dev, `esbuild` to CommonJS in build).
- **Persistence**: In-memory state store with rich demo seed (`generateInitialStore`).
- **Realtime**: Server-Sent Events (`/api/events/stream`) with subscriber set and `broadcastSSE`.
- **AI Engine**: Server-side Google GenAI (`@google/genai` v2.4.0) with Gemini 3.7 Flash for Devlog polishing, Team matching, Live Host broadcast generation, interactive Q&A (multi-persona), and Final Show Recap.
- **Audio Engine**: Web Audio synthesizer & Web Speech API on client side (`src/utils/audio.ts`).

### Frontend (`/src`):
- **Framework**: React 19 + TypeScript + Tailwind CSS 4 + Vite 6.
- **State Management**: `HackathonContext.tsx` handling polling/SSE subscriptions, user roles, optimistic mutations, and sound effects.
- **Views & Components**:
  - `Header`: Navigation, role switcher, countdown timer, sound toggle.
  - `LiveStageDashboard`: Hero banner, AI Host block, live stream chat, quick action cards, activity pulse, stage timeline.
  - `DevlogSection`: 30-sec fast devlog publisher with AI polishing, media support, reactions, and comments.
  - `ProjectsTeamsSection`: Team creation, team matching with AI, project catalog.
  - `Leaderboard`: Jury scores table with criteria breakdown, activity pulse leaderboard, special awards, podium.
  - `JudgeDashboard`: Scoring matrix for judges across 4 criteria with feedback and instant totals.
  - `OrganizerDashboard`: Stage control, deadline adjuster, broadcast trigger, results publishing.
  - `LiveChatView`: Public broadcast chat with message pinning.
  - `AskHostModal`, `SubmissionModal`, `RegisterModal`: Interactive modals.

---

## 3. WORKING FEATURES (DO NOT REWRITE)
- [x] Realtime SSE event broadcasting and client reaction.
- [x] AI Host live broadcasts grounded in real stats (participants, teams, MVPs, submissions).
- [x] Multi-persona AI Q&A (`STREAMER`, `MENTOR`, `ROAST`, `TIMEKEEPER`).
- [x] Fast Devlog post creation with AI polishing.
- [x] Post reactions (emoji counters) and comments.
- [x] Team creation and membership join logic.
- [x] Project upsert with MVP milestone timestamping.
- [x] Submission creation with checklist and links.
- [x] Multi-criteria judging system with automated total score calculations.
- [x] Leaderboard with Jury Rankings and Activity Pulse separation (Rule 8 compliant).
- [x] Web Audio synth sounds & Web Speech audio announcer.

---

## 4. GAPS & MISSING FEATURES FOR COMPETITION OS
1. **Universal Event Engine**: Current data model hardcodes a single `hackathon` entity. Needs an `Event` registry supporting multiple event instances (`VIBEATHON`, `DUEL`, `CHALLENGE`, `PITCH`).
2. **Event Discovery (Home Screen)**: No unified discovery page showing LIVE NOW, UPCOMING, and RECENT competitions with template badges and quick watch/join actions.
3. **Duel / 1v1 Battle Mode**: No Duel engine with round lifecycle (`ROUND_STARTED`, `ROUND_FINISHED`, `SCORE_UPDATED`), round timers, dual video/camera feeds, and audience live voting.
4. **Observer Mode**: Public URL/mode without auth requirement (`/live/:id`), presenting an esports broadcast UI with live telemetry, stream feed, and audience interaction.
5. **Submission Verification Gates**: Submissions need automated backend validation (URL reachability format validation, README checks, demo gates).
6. **Backend Role Permissions Enforcement**: Verify user roles on sensitive endpoints (`POST /api/hackathon/update`, `POST /api/hackathon/publish-results`, `POST /api/judgements/submit`, and post-deadline submissions).
7. **Persistent Event Recap & Show Archive**: Recap must be saved as a permanent event artifact.
8. **Audience Live Voting**: Anti-spam / one-vote-per-round audience voting for Duels and Pitches.

---

## 5. TECHNICAL DEBT & ACTION ITEMS
- Refactor data model to use `Event` with `template_type` (`VIBEATHON`, `DUEL`, `CHALLENGE`, etc.) and `event_id` partitioning across all entities.
- Add Duel Engine with WebRTC/video camera feeds, live scoreboard, round timer, and audience voting.
- Build `EventDiscovery` view for discovering live and upcoming competitions.
- Build `ObserverLayout` for first-class public spectator experience.
- Implement Submission Gates with Pass/Warning/Fail validation.
- Protect all organizer and judge endpoints with backend role verification.

---

## 6. DO NOT TOUCH
- Do not remove the working Web Audio synthesizer or speech synthesis utilities.
- Do not replace working React 19 / Tailwind / Lucide-react components with unneeded heavyweight frameworks.
- Keep the high-energy cyber/esports aesthetic.
