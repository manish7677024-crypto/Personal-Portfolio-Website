# 🚀 Personal Portfolio — Full Stack

A polished personal portfolio with a **dark terminal-themed UI**, **Node.js/Express backend**, and **PostgreSQL** database. Deployable on **Vercel + Railway** (or Heroku) in minutes.

---

## 📁 Project Structure

```
portfolio/
├── index.html          ← Frontend (pure HTML/CSS/JS — no build step!)
├── server.js           ← Express.js API backend
├── package.json
├── .env.example        ← Copy to .env and fill in your values
└── README.md
```

---

## ✨ Features

| Area | Details |
|---|---|
| **Frontend** | Terminal-hero animation, glassmorphism cards, scroll animations, mobile-responsive |
| **Backend** | REST API (projects + contact form), rate limiting, input validation |
| **Database** | PostgreSQL — projects table + messages table, auto-seeded |
| **Email** | Nodemailer SMTP — get notified on every contact form submission |
| **Security** | Helmet, CORS, express-rate-limit, express-validator |

---

## 🛠 Local Setup

### 1 — Prerequisites

- Node.js ≥ 18
- PostgreSQL running locally (or a free [Supabase](https://supabase.com) instance)

### 2 — Install dependencies

```bash
npm install
```

### 3 — Configure environment

```bash
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL
```

### 4 — Start the backend

```bash
npm run dev       # development (auto-restart)
# or
npm start         # production
```

### 5 — Open the frontend

Open `index.html` directly in your browser. Done!

> In production, the Express server serves `index.html` from the `public/` folder.
> Copy `index.html` → `public/index.html` before deploying.

---

## 🌐 Deployment

### Option A — Vercel (frontend) + Railway (backend + DB)  ⭐ Recommended

**Backend on Railway:**
1. Push the repo to GitHub.
2. New project → "Deploy from GitHub repo" → select your repo.
3. Add a PostgreSQL plugin → Railway auto-sets `DATABASE_URL`.
4. Set the remaining env vars in the Railway dashboard.

**Frontend on Vercel:**
1. Import the same repo on [vercel.com](https://vercel.com).
2. Set **Output Directory** to `.` and **Framework** to "Other".
3. Add `VITE_API_URL=https://your-backend.railway.app` (update the fetch calls in `index.html`).

---

### Option B — Heroku (all-in-one)

```bash
heroku create your-portfolio
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
git push heroku main
```

Copy `index.html` to `public/index.html` first so Express can serve it.

---

### Option C — Netlify (frontend-only, static)

If you don't need the backend:
1. Drag-and-drop `index.html` at [app.netlify.com](https://app.netlify.com).
2. The contact form will show a success message (client-side only).

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | All projects (featured first) |
| `GET` | `/api/projects/:id` | Single project |
| `POST` | `/api/contact` | Submit contact form |
| `GET` | `/api/health` | Server health check |

### POST /api/contact body

```json
{
  "name":    "Jane Smith",
  "email":   "jane@company.com",
  "subject": "Freelance project",
  "message": "I have an exciting project for you..."
}
```

---

## ✏️ Customisation Checklist

- [ ] Replace **Alex Rivera** with your name throughout `index.html`
- [ ] Update the **terminal lines** in the `lines` array (bottom of `index.html`)
- [ ] Swap in real **project details** (via the DB or directly in HTML)
- [ ] Update **social links** and `mailto:` address
- [ ] Swap placeholder emoji thumbnails for real screenshots
- [ ] Set a real `CONTACT_EMAIL` in `.env` to receive form submissions

---

## 🧰 Tech Stack

- **Frontend:** HTML5, CSS3 (custom properties, grid, glassmorphism), Vanilla JS
- **Fonts:** Space Grotesk · Inter · JetBrains Mono (Google Fonts)
- **Backend:** Node.js 18+, Express 4, express-validator, Helmet, express-rate-limit
- **Database:** PostgreSQL (via `pg` driver)
- **Email:** Nodemailer
- **Hosting:** Vercel + Railway (or Heroku / Netlify)

---

## 📄 License

MIT — do whatever you want, just don't claim you built it from scratch 😄
