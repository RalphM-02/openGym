# Werk-out: product exploration

An exploratory direction built on openGym. These are proposals, not implemented features.

## Product idea

A training and accountability app people can use independently or with a coach.
Start with strength training as the core, and connect it to simple daily habits and
weekly reflection. Use Werk-out as a working name until a brand is chosen.

## Three directions to compare

| Direction | Main user | Core promise | First experiment |
| --- | --- | --- | --- |
| Personal fitness companion | Someone training independently | Know what to do today and see whether it is working | Today screen combining training, a short check-in, and habits |
| Coaching workspace | An independent coach and their clients | Turn training logs into useful feedback and program adjustments | Client overview and a weekly review with workout history |
| Connected member and coach app | People starting alone or receiving coaching | Keep one training history as coaching needs change | Member/coach preview switch with fictional linked clients |

Recommended exploration: the connected app, prototyped with fictional data before
implementing coach permissions or sharing real profiles.

## What to reuse

- Routine planning, exercise search, guided workouts, set logging, and rest timers.
- Progression helpers, workout history, strength statistics, and body-weight tracking.
- Existing offline persistence and sync.
- Existing optional AI-coach infrastructure, after reviewing its actual workflows.
- React frontend and Capacitor shells as a path from web to mobile.

## What to add

### Member experience

- Today: next workout, weekly training progress, daily check-in, and chosen habits.
- Check-in: self-reported sleep, energy, soreness, and a short note.
- Habits: optional user-defined actions such as walking or meal preparation.
- Weekly review: completed sessions, changes in performance, and personal reflections.
- Coach feedback attached to the relevant week or session.

### Coach experience

- Client overview: upcoming reviews, missed planned sessions, and new check-ins.
- Client detail: goals, assigned program, training history, and feedback.
- Program assignment: copy a template into a client's plan and track later revisions.
- Weekly review: inspect logs and check-ins, leave feedback, propose plan changes.
- Explicit client invitations, sharing consent, and server-enforced access controls.

## First prototype

Build only four connected screens using fictional data:

1. Member Today.
2. Workout detail linked to openGym's existing training experience.
3. Coach client overview.
4. Client weekly review.

Include a clearly labelled member/coach preview switch. This is a prototype control,
not authentication. Show the same fictional training week in both views so the value
of the connection is easy to judge.

Suggested visual direction: warm neutral backgrounds, dark text, one energetic accent,
generous spacing, clear charts, and a mobile-first member experience. Give the coach
workspace room for side-by-side client context and review notes.

## Technical boundaries

- UI: `frontend/src/views/`, shared components, and `frontend/src/App.jsx`.
- Profile state: `frontend/src/store/useStore.js`; review persistence and sync before
  introducing new check-in or habit data.
- Training rules: pure helpers in `frontend/src/lib/`, with meaningful unit tests.
- Server: `api/server.js`, supporting modules, and `api/openapi.yaml`.
- AI coaching: `api/coach/`, including core modules shared with the phone app.
- Coach/client relationships require new authorization and data-sharing design.
  Existing profiles and admin tools are not sufficient evidence of a coaching model.
- Per-profile JSON storage is suitable for exploration; reassess query patterns and
  storage before building a larger multi-coach service.

## Defer until the core experience works

Payments, a coach marketplace, full food logging, social feeds, and additional wearable
integrations. Start with useful weekly decisions and a smooth workout experience.

## Source and licensing notes

Reviewed upstream on 28 October 2026:

- Repository and features: https://github.com/DuarteSantos8/openGym
- Architecture: `docs/ARCHITECTURE.md`.
- Contribution conventions: `CONTRIBUTING.md`.
- Code license: `LICENSE` (AGPL).
- Exercise media and other asset terms: `NOTICE.md`.

The upstream README says a modified network service must offer its corresponding
source under the AGPL. Exercise stills and animations have separate terms: upstream
permits a non-commercial fork to retain unmodified 180 px media with the notice;
commercial use requires a separate Gym visual license. Review those terms before
choosing a commercial distribution model or reusing media in a branded product.
