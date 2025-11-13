# PetTalk MERN Productivity + Chrome Extension

## Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB

## Backend Setup
- Copy `backend/.env.example` to `backend/.env` and set:
  - `MONGODB_URI`: your MongoDB connection string
  - `JWT_SECRET`: a strong secret
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: your SMTP credentials
  - `CLIENT_URL`: `http://localhost:5173`
  - `SERVER_PORT`: `4000`
- Install and run:
  - `cd backend`
  - `npm install`
  - `npm run dev`

## Frontend Setup
- `cd frontend`
- `npm install`
- Optionally set `VITE_API_URL` in `.env` to `http://localhost:4000/api`
- `npm run dev`

## Email Summaries
- The server schedules a summary email every 6 hours for users with `emailOptIn` enabled.
- Set valid SMTP credentials in `backend/.env` to enable delivery.

## Chrome Extension
- Files are under `extension/`
- Load unpacked in Chrome:
  - Open `chrome://extensions`
  - Enable Developer Mode
  - Click "Load unpacked" and select the `extension` folder
  - New tab will show PetTalk; background detects idle and nudges focus

## Credentials Guidance
- MongoDB URI: create a Database User and copy the URI from Atlas (replace `<user>`, `<pass>`, `<cluster>`, `<db>`)
- SMTP: use SendGrid (API key as `SMTP_USER=apikey` and `SMTP_PASS=<key>`) or Gmail App Password

## Notes
- In development, the server starts without DB if `MONGODB_URI` is empty; API features require a valid DB.
- The frontend falls back to local storage if the backend is unreachable.