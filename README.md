# 🏥 Upchaar — AI-Powered Clinic Management Platform

> **Production-ready** healthcare SaaS with Supabase cloud database, Gemini AI, real-time sync, and role-based authentication.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-teal)](https://vedant21-oss.github.io/Upcharr/)

---

## 🚀 What's Inside

| Feature | Status |
|---------|--------|
| 🔐 Supabase Auth (Login / Register) | ✅ |
| 🧑‍⚕️ Role-based access (Admin, Doctor, Receptionist, Patient) | ✅ |
| 📅 Appointment booking → saves to Supabase | ✅ |
| 🎟️ Live queue with token numbers | ✅ |
| 🤖 Gemini AI chatbot (9 Indian languages) | ✅ |
| 📋 Patient records stored in cloud | ✅ |
| 💰 Billing management | ✅ |
| 🔄 Realtime sync (all devices) | ✅ |
| 📊 Analytics dashboard | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML + CSS + JavaScript |
| Backend | Node.js + Express.js |
| Database | PostgreSQL via **Supabase** |
| Auth | Supabase Authentication |
| Realtime | Supabase Realtime |
| AI | Google **Gemini 1.5 Flash** |

---

## ⚡ Quick Start (Local)

### 1. Run the Database Schema
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/ckeuvqaogfpjrrwnvxbn/sql)
2. Open `supabase_schema.sql` and paste → Run

### 2. Start the Backend
```bash
npm install
node server.js
# → http://localhost:5001
```

### 3. Open the App
```
http://localhost:5001/login.html
```

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 👤 Admin | `admin@upchaar.in` | `Upchaar@123` |
| 🩺 Doctor | `doctor@upchaar.in` | `Upchaar@123` |
| 🗂️ Receptionist | `reception@upchaar.in` | `Upchaar@123` |
| 🧑 Patient | `patient@upchaar.in` | `Upchaar@123` |

---

## 📁 Project Structure

```
Upcharr/
├── index.html          ← Main app (original beautiful UI)
├── login.html          ← Auth page (matches original design)
├── style.css           ← All styles
├── app.js              ← Frontend logic + Supabase Realtime
├── server.js           ← Express.js API (Supabase backend)
├── package.json
├── .env                ← Supabase + Gemini keys (gitignored)
└── supabase_schema.sql ← Run this in Supabase SQL Editor
```

---

## 🌐 Deployment

### Backend → Render / Railway
1. Push this repo to GitHub (already done ✅)
2. Create a new web service on [Render](https://render.com)
3. Connect your `Upcharr` repo
4. **Build command:** `npm install`
5. **Start command:** `node server.js`
6. Add environment variables:
   ```
   SUPABASE_URL=https://ckeuvqaogfpjrrwnvxbn.supabase.co
   SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   GEMINI_API_KEY=...
   PORT=5001
   ```

### Frontend → GitHub Pages (already live)
The static site is auto-deployed via `.github/workflows/static.yml`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/register` | Create account |
| GET | `/api/patients` | List patients |
| POST | `/api/patients` | Add patient |
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/queue` | Live queue |
| PUT | `/api/queue/:id/call` | Call patient |
| PUT | `/api/queue/:id/complete` | Complete visit |
| GET | `/api/doctors` | List doctors |
| POST | `/api/chat` | Gemini AI chat |
| GET | `/api/analytics` | Stats |
| GET | `/api/billing` | Billing list |
| GET | `/health` | Health check |

---

## 🤖 Environment Variables

Create a `.env` file (already gitignored):
```env
PORT=5001
SUPABASE_URL=https://ckeuvqaogfpjrrwnvxbn.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
```

---

*Built with ❤️ for India's healthcare system*
