# TalentOS — Digital Talent Management System

> Sprint 1: Auth system with gaming-inspired UI

---

## Tech Stack

| Layer      | Tech                              |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite                   |
| Backend    | Node.js + Express                 |
| Database   | PostgreSQL via Prisma ORM         |
| Auth       | JWT + bcryptjs                    |

---

## Project Structure

```
talent-system/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB schema (User model)
│   ├── src/
│   │   ├── controllers/
│   │   │   └── auth.controller.js # register, login, getMe
│   │   ├── middleware/
│   │   │   └── auth.middleware.js  # JWT protect guard
│   │   ├── routes/
│   │   │   └── auth.routes.js     # POST /register, POST /login, GET /me
│   │   └── utils/
│   │       └── jwt.js             # signToken, verifyToken
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Axios instance + interceptors
    │   ├── components/
    │   │   └── ProtectedRoute.jsx # Route guard
    │   ├── hooks/
    │   │   └── useAuth.js         # Auth state + API calls
    │   ├── pages/
    │   │   ├── Register.jsx       # "Create Player Account" page
    │   │   ├── Login.jsx          # "Enter Game" page
    │   │   ├── Dashboard.jsx      # Protected player hub
    │   │   ├── Auth.css           # Shared auth page styles
    │   │   └── Dashboard.css      # Dashboard styles
    │   ├── styles/
    │   │   └── global.css         # CSS variables + global resets
    │   ├── App.jsx                # Router
    │   └── main.jsx               # Entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Prerequisites

- Node.js v18+
- PostgreSQL running locally (or a remote URL)
- npm or yarn

---

## Setup — Step by Step

### 1. Clone and enter the project

```bash
git clone <your-repo-url>
cd talent-system
```

---

### 2. Setup the backend

```bash
cd backend
npm install
```

Create your `.env` file from the example:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/talent_system"
JWT_SECRET="some-long-random-secret-here"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
```

> **PostgreSQL tip**: Create the database first if it doesn't exist:
> ```sql
> CREATE DATABASE talent_system;
> ```

---

### 3. Run Prisma migrations

```bash
# Generate the Prisma client
npx prisma generate

# Apply the schema to your database (creates the users table)
npx prisma migrate dev --name init
```

You should see:
```
✔ Generated Prisma Client
✔ Applied migration `init`
```

---

### 4. Start the backend

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

Test it:
```bash
curl http://localhost:5000/api/health
# → {"status":"ok","ts":...}
```

---

### 5. Setup the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at: `http://localhost:5173`

The Vite proxy forwards `/api/*` to `localhost:5000` automatically — no CORS issues during development.

---

## API Endpoints

| Method | Path                 | Auth Required | Description         |
|--------|----------------------|---------------|---------------------|
| GET    | /api/health          | No            | Health check        |
| POST   | /api/auth/register   | No            | Create account      |
| POST   | /api/auth/login      | No            | Login               |
| GET    | /api/auth/me         | Yes (Bearer)  | Get current user    |

### Register example:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex", "email":"alex@example.com", "password":"secret123"}'
```

### Login example:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com", "password":"secret123"}'
```

---

## What's in Sprint 2

- Talent profiles & skills
- Team management
- Search & filter
- Role-based access (manager / admin)
- Notifications

---

## Security Notes

- Passwords hashed with bcrypt (cost factor 12)
- JWT stored in localStorage (consider httpOnly cookies for production)
- Duplicate email handled with 409 Conflict
- Auth errors are deliberately vague to prevent user enumeration
- `.env` is never committed — always use `.env.example` as the template
