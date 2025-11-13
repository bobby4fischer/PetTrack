## Current State Assessment

* Frontend: React + Vite + Redux Toolkit SPA; virtual pet, tasks, focus timer, store, demo auth via localStorage

* Styling: Custom CSS; Tailwind installed but not used

* Persistence: localStorage-only (no server or database)

* Backend: Missing (no Express/MongoDB, no email)

* Extension: Missing (no manifest, no Chrome APIs)

* Notable fixes: task completion currently deletes tasks; missing import for `setTasks` in renew flow; some asset placeholders

## Architecture Overview

* Stack: React (with Redux Toolkit, React Router), Tailwind CSS, Node.js + Express, MongoDB (Mongoose), Socket.IO

* Auth: JWT-based with refresh tokens; bcrypt password hashing; CORS configured for dev/prod

* Persistence: MongoDB Atlas (prod/dev); local `.env` for secrets; strict schema via Mongoose

* Real-time: Socket.IO between client and server for pet reactions, idle alerts, and reward updates

* Email: Nodemailer + node-cron every 6 hours to send per-user task summaries

## Data Model

* User: `{ email, passwordHash, displayName, gems, settings: { theme, emailOptIn }, pet: { life, hunger, mood, level, lastDecayAt }, inventory: { food, milk, toys } }`

* Task: `{ userId, title, description, status: 'pending'|'completed', createdAt, completedAt, category }`

* Session: `{ userId, type: 'pomodoro', startAt, endAt, completed, interruptions }`

* ActivityEvent: `{ userId, type: 'idle'|'deviation', timestamp, url }`

* NotificationLog: `{ userId, sentAt, summary }`

## Backend API (Express)

* Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`

* Tasks: `GET/POST/PUT/PATCH/DELETE /api/tasks`; `PATCH /api/tasks/:id/complete`

* Pet: `GET /api/pet`, `POST /api/pet/feed`, `POST /api/pet/milk`, `POST /api/pet/play`, `POST /api/pet/renew`

* Store: `GET /api/store`, `POST /api/store/purchase`

* Gems: `GET /api/gems`, `POST /api/gems/award` (server-side rules), `POST /api/gems/spend`

* Sessions: `POST /api/sessions/start`, `POST /api/sessions/stop`, `GET /api/sessions/history`

* Activity: `POST /api/activity` (idle/deviation events)

* Socket.IO: namespaces/rooms per user; events: `pet:react`, `reward:update`, `idle:alert`

## Email Notifications (Every 6 Hours)

* Scheduler: node-cron `0 */6 * * *` (UTC) with per-user batching

* Summary: completed vs pending tasks, streaks, gems earned/spent, pet status

* Delivery: Nodemailer SMTP (e.g., SendGrid/Gmail) with HTML templates

* Logs: write `NotificationLog` entries for audit; retry on transient failures

* Opt-in: `User.settings.emailOptIn` controls participation

## Idle Detection & Deviation Popups

* Web App: detect `document.visibilityState` + inactivity (no key/mouse) for N minutes; trigger pet overlay and Socket event

* Extension: use `chrome.idle.onStateChanged` and `chrome.tabs` to detect when user deviates from allowed task URLs; show non-blocking overlay popup with pet guidance

* Events: record `ActivityEvent` (type+url+time) for analytics and rewards

## Gamification & Rewards

* Rules: award gems for completing tasks, maintaining focus sessions, returning from idle; spend gems to feed/milk/play with pet

* Pet Reactions: change mood/animations on events (complete, idle, feed); real-time via Socket.IO

* Decay: server-side pet life decay with last-decay timestamps; renew flow resets life with gem cost

## Pomodoro Timer & Focus Music

* Timer: 25/5 defaults, configurable; start/stop tracked as `Session` entries; notifications on phase changes (web + extension)

* Music: built-in player with curated tracks; store selection in `User.settings`; preload static assets or stream from safe sources

* Sync: reflect timer state between app and extension via Socket sockets

## Frontend Integration & Improvements

* Replace localStorage with API-backed Redux async thunks (axios) while migrating existing local data on first login

* Tailwind: adopt utility classes across dashboard, tasks, pet, store; unify visual design and responsiveness

* Animations: implement cat “pawing the head” animation (CSS keyframes or Lottie) triggered for a few seconds on selected events

* Fixes: correct task completion to toggle status; import missing actions; ensure assets exist

## Chrome Extension (MV3)

* Manifest: `manifest_version: 3`, `chrome_url_overrides: { newtab: 'index.html' }`, `background.service_worker: 'background.js'`

* Permissions: `storage`, `idle`, `tabs`, `alarms`, `notifications`, `activeTab`; `host_permissions` to backend API domain

* Content Scripts: inject pet overlay for deviation prompts; message passing with service worker

* Auth: reuse JWT via `chrome.storage.sync`; refresh flow handled in service worker

* Build: reuse React build for `newtab`; package `extension/` with manifest, background, assets

## Security & Config

* Secrets in `.env` (server): `MONGODB_URI`, `JWT_SECRET`, `SMTP_USER`, `SMTP_PASS`, `CLIENT_URL`

* CORS: restrict to dev/prod origins

* Passwords: bcrypt hashes; JWT short-lived access + refresh rotation

* README: step-by-step credential setup and connection instructions (placeholders, no real secrets)

## Testing & Verification

* Backend: unit tests for controllers/services; integration tests for auth/tasks/pet/store; cron email dry-run test

* Frontend: component tests for tasks/pet/timer; reducers/slices tests

* Extension: minimal e2e in dev Chrome profile; verify new tab override, idle detection, backend connectivity

## Migration Strategy

* On first authenticated run, read existing localStorage per-user keys and POST to server (tasks, pet, inventory, gems); then clear local copies

* Provide fallback offline mode if server unreachable (queued sync)

## Deployment

* Dev: run Express + Vite concurrently; MongoDB Atlas dev cluster

* Prod: deploy Express on a host (Render/Heroku/Vercel serverless with sockets), MongoDB Atlas; serve React build via CDN or from Express

* Extension: manual pack and install in Chrome (Load unpacked), later publish to Chrome Web Store

## Milestones

1. Backend foundation: schemas, auth, tasks, pet/store, sockets
2. Email scheduler + templates and opt-in
3. Frontend API integration, Tailwind refactor, animations
4. Pomodoro/music syncing + reward logic polish
5. Chrome extension MV3: new tab override, idle/deviation overlays
6. Testing, migration tool, README and packaging

## Deliverables

* Fully integrated MERN app with working backend and real-time features

* Automated 6-hour email summaries per user

* Enhanced UI/UX with pet animations and Tailwind styling

* Chrome extension overriding new tab, with idle detection and pet popups

* README with credential setup and connection instructions; test suite and packaging scripts

