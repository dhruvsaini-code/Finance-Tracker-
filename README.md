# FinanceSaaS - AI-Powered Full-Stack Wealth & Finance Tracker

FinanceSaaS is a production-grade, AI-powered fintech SaaS application designed for personal asset tracking. Built with **React 18, Vite, TypeScript, Node.js, Express, and MongoDB**, it features a gorgeous dark-theme glassmorphism dashboard, JWT refresh token rotation cookies, interactive charts, automated AI transaction categorization, spending heatmaps, and financial forecasting engines.

## Key Features

- **JWT Auth with Cookie-Based Rotation**: Implements secure access tokens (15m expiration) alongside HTTP-only, SameSite=Strict refresh tokens (7d expiration) in the backend to ensure high security against XSS.
- **AI-Powered Transaction Categorization**: Utilizes OpenAI API (with a seamless fallback to a local rule-based category mapper) to dynamically categorize user transactions (e.g., "Starbucks Coffee" is tagged as "Dining Out").
- **Interactive Recharts Visualizations**: Displays area trends, budget progress bars, category breakdown distributions, and weekday spending intensity heatmaps.
- **Financial Wellness Score (0-100)**: Evaluates saving speed, budget compliance rates, and savings goals completions to score user wellness.
- **Linear Predictive Analytics**: Projects next month's income, expenses, and cash flow trends based on previous history.
- **CSV Exporter**: Allows downloading the transaction history as clean Excel-compatible CSVs.
- **Command Palette (`Ctrl + K`)**: Instantly search pages, trigger theme switches, or log out of the session.
- **Enterprise Clean Architecture**: Structured utilizing separation of concerns (Repositories, Validators, Services, Controllers, and AI wrappers).
- **Containerized Development**: Equipped with Nginx, multi-stage Dockerfiles, and Docker Compose configurations.

---

## Codebase Architecture

```
Finance-Tracker-System/
├── Backend/
│   ├── ai/                 # OpenAI integrations & rule fallbacks
│   ├── config/             # Mongoose connection triggers
│   ├── controllers/        # Express request routing controllers
│   ├── middleware/         # Auth protect, rate limiting, and errors handlers
│   ├── models/             # Mongoose schema definitions
│   ├── repositories/       # Isolated database queries mapping
│   ├── routes/             # API routing mappings
│   ├── services/           # Business logic flow coordinates
│   ├── validators/         # Input request validation guards
│   ├── app.js              # Express app initializer
│   ├── seed.js             # Database dummy seed script
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── api/            # Axios instance with auth interceptors
│   │   ├── components/     # Layout wraps, GlassCard, command palettes
│   │   ├── pages/          # Dashboard, Transactions, Budgets, Savings, AI, Analytics
│   │   ├── store/          # Zustand global auth and theme stores
│   │   ├── services/       # React Query API fetch wrappers
│   │   ├── types/          # TypeScript interfaces
│   │   ├── App.tsx         # Route paths mappings
│   │   └── main.tsx
│   ├── index.html          # HTML entry
│   └── package.json
│
├── docker-compose.yml      # Docker multi-service runner
└── database_schema.sql     # Reference SQL design schema
```

---

## Local Getting Started Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Database Seeding & Environment Setup
Create a file at `env/.env` and insert your configurations:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_tracker
JWT_SECRET=super_secret_finance_tracker_key_123456
JWT_REFRESH_SECRET=super_secret_refresh_key_987654
NODE_ENV=development
# Optional: OPENAI_API_KEY=your_openai_api_key
```

Seed the database with mock user (`demo@example.com` / `password123`) and initial transactions:
```bash
cd Backend
npm install
node seed.js
```

### 2. Start the Backend API Server
```bash
npm run dev
# Server boots on port 5000
```

### 3. Start the Frontend React Client
```bash
cd ../Frontend
npm install
npm run dev
# React Vite server boots on http://localhost:5173
```
Log in using:
- **Email**: `demo@example.com`
- **Password**: `password123`

---

## Running inside Docker Containers

Ensure Docker is running, then launch the full-stack system:
```bash
docker-compose up --build
```
- Frontend client is accessible on: `http://localhost`
- Backend API server operates on: `http://localhost:5000`
- MongoDB operates on port: `27017`

---

## CI/CD Pipeline
GitHub Actions automatically runs compile verification, type checks (`tsc --noEmit`), and builds production client assets on push to `main` or `master` branches (configured under `.github/workflows/ci.yml`).

## Upcoming Features

- AI spending insights

- Budget forecasting
- Savings goal recommendations
- Expense categorization AI
Email attribution test
Update 1
June 16 contribution
// update 3
