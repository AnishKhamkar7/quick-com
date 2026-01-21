# QuickCom – Local Quick Commerce Platform

QuickCom is a **full‑stack quick commerce application** built with **React + Vite (TypeScript)** on the client, **Node.js** on the server, and **PostgreSQL** as the database. The database runs locally using **Docker**, while the client and server run normally using npm.

This README explains **how to run the project locally**, set up the database, and understand the project structure.

---

## 🧱 Tech Stack

### Frontend

- React + TypeScript
- Vite
- shadcn/ui + Tailwind CSS
- React Router

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL

### Infrastructure

- Docker (Postgres only)

---

## 📁 Project Structure

```txt
quick/
 ├─ client/        # React (Vite) frontend
 ├─ server/        # Node.js + Express backend
 ├─ prisma/        # Prisma schema & migrations
 ├─ docker-compose.yml
 ├─ .env
 └─ README.md
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- Node.js (v18 or higher recommended)
- npm
- Docker & Docker Compose

Check versions:

```bash
node -v
npm -v
docker -v
docker compose version
```

---

## 🐘 Database Setup (PostgreSQL with Docker)

The project uses **PostgreSQL running inside Docker**.

### 1️⃣ Start the database

From the project root:

```bash
docker compose up -d
```

This will:

- Pull `postgres:15-alpine`
- Start the database on port **5433**

Verify:

```bash
docker ps
```

You should see a container named something like:

```
delivery_db
```

---

### 2️⃣ Environment Variables

Create a `.env` file in the **server directory** (or project root depending on setup):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/delivery_db"
```

> Update username/password/db name if your docker config differs.

---

### 3️⃣ Run Prisma Migrations

From the **server** directory:

```bash
npx prisma migrate dev
```

This will:

- Create all tables
- Apply enums and indexes
- Sync Prisma schema with Postgres

(Optional) Open Prisma Studio:

```bash
npx prisma studio
```

---

### 4️⃣ Access Database via CLI (Optional)

```bash
docker exec -it delivery_db psql -U postgres
```

Inside psql:

```sql
\dt
SELECT * FROM "User";
```

---

## 🖥️ Backend Setup

From the **server** directory:

```bash
npm install
npm run dev
```

Server will start on (example):

```
http://localhost:3000
```

---

## 🌐 Frontend Setup

From the **client** directory:

```bash
npm install
npm run dev
```

Client will start on:

```
http://localhost:5173
```

---

## 👥 User Roles

QuickCom supports multiple roles:

- **Customer** – Browse products, place orders
- **Delivery Partner** – Accept & deliver orders
- **Admin** – Manage platform data

Role handling is managed via Prisma enums and backend guards.

---

## 📦 Core Features

- Customer product browsing & cart
- Order placement & tracking
- Delivery partner dashboard
- Active delivery handling
- City‑based order assignment
- Order status history

---

## 🛠 Common Commands

```bash
# Start DB
docker compose up -d

# Stop DB
docker compose down

# Backend
npm run dev

# Frontend
npm run dev

# Prisma
npx prisma migrate dev
npx prisma studio
```

---

## 🚀 Notes

- Database runs **only in Docker**
- Client & server run **normally using npm**
- Tables use **PascalCase** (Prisma default)
- Enum values are **UPPERCASE**

---

## 🧠 Future Improvements

- Redis for live order updates
- WebSocket‑based delivery tracking
- Admin analytics dashboard
- Real map integration

---

## 📄 License

MIT License
