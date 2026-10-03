# Student Study Manager (MERN)

Track subjects, tasks, study sessions, notes and exams, with a dashboard of weekly study hours.

## Setup
Requirements: Node 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

**Server**
```
cd server
npm install
cp .env.example .env     # set MONGO_URI and JWT_SECRET
npm run dev              # http://localhost:5000
```
**Client** (new terminal)
```
cd client
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```
Register an account, add a subject first, then tasks, sessions, notes and exams.

## API (all routes except auth need `Authorization: Bearer <token>`)
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/{subjects|tasks|sessions|notes|exams}`, `PUT/DELETE /api/<resource>/:id` (tasks accept `?status=&subject=`)
- `GET /api/stats/dashboard`

## Deployment
Server on Render (set MONGO_URI, JWT_SECRET, CLIENT_URL). Client on Vercel (set VITE_API_URL to `https://<server>/api`).
