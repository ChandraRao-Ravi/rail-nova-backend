# 🚉 RailNova API

> **Mock Backend for Modern IRCTC-Style RailNova App**  
> Node.js · TypeScript · Express · REST · In‑Memory Data

![Node](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue?logo=typescript)
![Express](https://img.shields.io/badge/Express-5-lightgrey?logo=express)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 🌐 Project Vision

Provide a **simple, type‑safe REST API** for the RailNova iOS app, powering train search, availability, and bookings using mock data. This backend mirrors the real IRCTC‑style flows so the iOS app can be fully functional end‑to‑end without relying on unstable third‑party APIs.

---

## ✨ Features

### Core API Features

- 🔍 Train search endpoint (`/api/search-trains`) with:
  - From/To station codes
  - Journey date
  - Class & quota filters
- 🚆 Train details endpoint (`/api/trains/:number`)
- 🎫 Booking creation (`/api/bookings`) with mock PNR generation
- 📚 User bookings listing (`/api/users/:userId/bookings`)
- ❤️ Health check (`/health`) for monitoring

### Mock / Dev Friendly

- 🧪 Pure in‑memory data store (no DB required)
- ⚡ Fast iteration with `ts-node-dev` and TypeScript
- 🔌 Designed to be swapped later with a real NestJS + PostgreSQL backend

---

## 🛠 Tech Stack

| Layer        | Technology                    |
|-------------|-------------------------------|
| **Runtime** | Node.js 20+                   |
| **Language**| TypeScript 6                  |
| **Web**     | Express 5                     |
| **CORS**    | `cors` middleware             |
| **Dev**     | `ts-node-dev`, strict TS config|

---

## 📦 NPM Dependencies

| Package          | Purpose                          |
|------------------|----------------------------------|
| `express`        | HTTP server & routing            |
| `cors`           | Cross‑origin support for iOS app |
| `typescript`     | Type‑safe backend code           |
| `ts-node-dev`    | Live‑reload TypeScript dev server|
| `@types/express` | Type definitions                 |
| `@types/cors`    | Type definitions                 |
| `@types/node`    | Node type definitions            |

---

## 🗂 Folder Structure

```bash
irctc-project-backend/
├── src/
│   ├── server.ts          # App entrypoint, route mounting
│   ├── types.ts           # Domain models (Train, Booking, etc.)
│   ├── data/
│   │   └── trains.ts      # Mock train data (Rajdhani, Shatabdi, etc.)
│   └── routes/
│       ├── trains.ts      # /api/search-trains, /api/trains/:number
│       └── bookings.ts    # /api/bookings, /api/users/:userId/bookings
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/ChandraRao-Ravi/irctc-project-backend.git
cd irctc-project-backend
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

You should see:

```text
RailNova API running on http://localhost:3000
```

### 3. Hit test endpoints

Health:

```bash
curl http://localhost:3000/health
# -> {"status":"ok","service":"railnova-api"}
```

Train search:

```bash
curl "http://localhost:3000/api/search-trains?from=NDLS&to=BCT&date=2024-05-24"
```

Train details:

```bash
curl http://localhost:3000/api/trains/12951
```

Create booking:

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "trainNumber": "12951",
    "journeyDate": "2024-05-24",
    "from": "NDLS",
    "to": "BCT",
    "totalFare": 3155
  }'
```

List bookings for a user:

```bash
curl http://localhost:3000/api/users/test-user-1/bookings
```

---

## 🔌 iOS Integration

Set the iOS `APIClient` base URL to point to this backend:

```swift
private let baseURL = "http://localhost:3000/api"
```

Example call (already wired in your project):

- `GET /api/search-trains` via `TrainService.searchTrains(...)`
- `GET /api/trains/:number` for Train Detail screen
- `POST /api/bookings` for booking confirmation

---

## 🧱 API Overview

### Train Search

- **Method**: `GET`
- **Path**: `/api/search-trains`
- **Query**:
  - `from` – station code (e.g. `NDLS`)
  - `to` – station code (e.g. `BCT`)
  - `date` – journey date (string, currently passthrough)
  - `classCode` – optional (e.g. `3A`)
  - `quota` – optional (e.g. `GENERAL`)

**Response** (example):

```json
{
  "from": "NDLS",
  "to": "BCT",
  "date": "2024-05-24",
  "quota": "GENERAL",
  "trains": [
    {
      "number": "12951",
      "name": "Mumbai Rajdhani",
      "from": "NDLS",
      "to": "BCT",
      "departureTime": "16:55",
      "arrivalTime": "09:30",
      "durationMinutes": 935,
      "daysOfOperation": ["M","T","W","T","F","S","S"],
      "classes": [
        { "code": "1A", "name": "First AC", "available": 8, "fare": 3155 }
      ]
    }
  ]
}
```

### Bookings

- `POST /api/bookings` – Create booking (returns booking with generated `id` and `pnr`)
- `GET /api/users/:userId/bookings` – List bookings for a user

---

## 🛣 Future Roadmap

| Phase | Scope |
|-------|-------|
| **Phase 1** | Mock API for search & bookings (in‑memory) |
| **Phase 2** | Add more IRCTC‑style fields (quota logic, PNR status) |
| **Phase 3** | Migrate to PostgreSQL + Prisma or NestJS |
| **Phase 4** | Add Razorpay sandbox integration for payments |
| **Phase 5** | Deploy to Railway / Render / AWS as shared dev backend |

---

## 👨‍💻 Author

**Chandra Rao** · Senior iOS & Backend Enthusiast  
[GitHub](https://github.com/ChandraRao-Ravi)

---

## 📄 License

MIT License © 2026 Chandra Rao
