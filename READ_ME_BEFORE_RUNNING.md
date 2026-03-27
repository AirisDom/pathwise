# PathWise — Setup Guide

## Requirements

Before you begin, make sure you have the following installed:

- **Node.js** v20 or later — https://nodejs.org
- **Docker Desktop** — https://www.docker.com/products/docker-desktop (needed to run the database)

---

## Step 1 — Start the Database

Open a terminal and run:

```bash
docker run -d \
  --name pathwise-db \
  -e POSTGRES_USER=pathwise \
  -e POSTGRES_PASSWORD=pathwise123 \
  -e POSTGRES_DB=pathwise \
  -p 5432:5432 \
  postgres:15
```

> If you have already run this before and the container already exists, just start it with:
> ```bash
> docker start pathwise-db
> ```

---

## Step 2 — Install Dependencies

In the project folder, run:

```bash
npm install
```

---

## Step 3 — Set Up the Database

Run both of these commands in order:

```bash
npx prisma migrate deploy
```

```bash
npm run seed
```

The seed command creates two ready-to-use demo accounts (see Login section below).

---

## Step 4 — Start the App

```bash
npm run dev
```

Then open your browser and go to: **http://localhost:3000**

---

## Logging In (Demo Accounts)

On the login page you will see a **"Demo Access"** box with two buttons:

| Button | Role | Email | Password |
|---|---|---|---|
| Student Demo | Student | student@demo.com | Demo1234! |
| Creator Demo | Creator | creator@demo.com | Demo1234! |

Just click either button — no typing required. One click logs you straight in.

---

## What to Explore

**As a Student (`Student Demo` button):**
- Browse and enroll in courses
- Watch lessons and track progress
- Chat with Lumi (AI study assistant) on any course page
- Message course creators
- View your dashboard and enrolled courses

**As a Creator (`Creator Demo` button):**
- View the creator dashboard with real charts
- Create and publish courses with lessons and videos
- Manage enrolled students and view their progress
- Read and filter student reviews
- Use the messaging inbox to reply to students
- Update profile and settings

---

## Troubleshooting

**Site won't load / spinning forever**
- Check Docker is running: `docker ps` — you should see `pathwise-db` listed
- If not listed, run `docker start pathwise-db` then refresh

**"Demo account not ready" error on login**
- You may have skipped Step 3 — run `npm run seed` then try again

**Port 3000 already in use**
- Something else is using port 3000. Stop that process or run `npm run dev -- -p 3001` and visit http://localhost:3001
