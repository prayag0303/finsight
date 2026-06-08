# FinSight — Personal Finance Intelligence Dashboard

A production-ready, full-stack AI-powered personal finance management application built with React, Node.js, MongoDB, and OpenAI.

---

## Features

| Feature | Description |
|---|---|
| **Transaction Management** | Add, edit, delete, and CSV-import transactions with auto-categorization |
| **Smart Categorization** | Rule-based NLP keyword detection across 14 categories |
| **Analytics Dashboard** | Income, expenses, savings rate, trends, and category breakdowns |
| **Budget Tracking** | Set monthly limits per category with visual progress tracking |
| **Savings Goals** | Create goals, track contributions, forecast completion dates |
| **Cash Flow Forecasting** | 3–6 month projections using weighted moving averages + trend analysis |
| **Anomaly Detection** | Z-score based detection of unusual transactions and spending spikes |
| **Subscription Detection** | Auto-identify recurring subscriptions (Netflix, Spotify, etc.) |
| **What-If Simulator** | Adjust spending sliders and see real-time impact on savings |
| **AI Monthly Reports** | GPT-4o-mini powered financial analysis and recommendations |
| **Dark / Light Mode** | Full theme support with OS preference detection |
| **JWT Auth** | Secure registration, login, and profile management |

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS v3, Recharts, Axios, React Router v6  
**Backend:** Node.js, Express.js, Mongoose  
**Database:** MongoDB  
**Auth:** JWT + bcrypt  
**AI:** OpenAI GPT-4o-mini (graceful fallback if no key)

---

## Project Structure

```
finance/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/         # Auth, Transactions, Budgets, Goals, Reports, Forecasts
│   │   ├── middleware/          # JWT auth, error handler
│   │   ├── models/              # User, Transaction, Budget, Goal, Report
│   │   ├── routes/              # Express routers
│   │   └── services/            # AI, categorization, forecasting, anomaly, subscriptions
│   ├── seed/seed.js
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── charts/          # Recharts wrappers
    │   │   ├── common/          # Modal, StatsCard, Badge, Spinner
    │   │   ├── layout/          # Layout, Sidebar, Header
    │   │   └── transactions/    # Table, Form, CSV Upload
    │   ├── context/             # Auth, Theme
    │   ├── pages/               # Dashboard, Transactions, Budgets, Goals, Forecasts, Reports, Settings
    │   ├── services/api.js
    │   └── utils/formatters.js
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (optional — AI features fall back to template reports)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your values

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your_strong_secret_here
OPENAI_API_KEY=sk-your-key-here   # optional
FRONTEND_URL=http://localhost:5173
```

### 3. Seed Demo Data

```bash
cd backend
npm run seed
```
This creates a demo user (`demo@example.com` / `demo123`) with 12 months of realistic transactions, budgets, and goals.

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # http://localhost:5000

# Terminal 2 — Frontend  
cd frontend
npm run dev        # http://localhost:5173
```

### 5. Run Tests

```bash
cd backend
npm test
```

---

## API Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Transactions
| Method | Route | Description |
|---|---|---|
| GET | `/api/transactions` | List (paginated, filterable) |
| POST | `/api/transactions` | Create |
| PUT | `/api/transactions/:id` | Update |
| DELETE | `/api/transactions/:id` | Delete |
| POST | `/api/transactions/upload` | Import CSV |
| GET | `/api/transactions/stats/overview` | Monthly stats |
| GET | `/api/transactions/stats/trend` | Monthly trend |

### Budgets, Goals, Reports, Forecasts
Standard CRUD endpoints at `/api/budgets`, `/api/goals`, `/api/reports`.  
Forecast endpoints: `/api/forecasts/cashflow`, `/api/forecasts/anomalies`, `/api/forecasts/subscriptions`, `/api/forecasts/recurring`.

---

## CSV Import Format

Supported formats:
```csv
Date,Description,Amount,Type
2025-01-15,Starbucks Coffee,250,Debit
2025-01-16,Salary Credit,75000,Credit
```
```csv
Date,Description,Debit,Credit
2025-01-15,Zomato Order,450,
2025-01-01,Salary,,75000
```

---

## Deployment

**Frontend (Vercel):**
```bash
cd frontend && npm run build
# Deploy dist/ to Vercel
# Set VITE_API_URL=https://your-backend.onrender.com/api
```

**Backend (Render / Railway):**
```
Build: npm install
Start: node server.js
Environment: Set all .env variables
```

---

## License

MIT
