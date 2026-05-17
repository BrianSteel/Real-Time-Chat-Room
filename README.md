# 101 RealChat — Real-Time Chat Room

A real-time chat application where users can create and join chat rooms, send messages, and see live typing indicators.

**Tech Stack:** Node.js · Express · Socket.IO · MongoDB · Vanilla JavaScript

---

## Features

- Create and join chat rooms
- Real-time messaging with Socket.IO
- Message history (last 50 messages loaded on join)
- Live typing indicators
- Active user list per room
- Join/leave notifications
- Duplicate username prevention per room

## Prerequisites

- [Node.js](https://nodejs.org/) (v12 or higher)
- [MongoDB Community Edition](https://docs.mongodb.com/manual/installation/) — or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

## Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env
```

### Local MongoDB

Start your local MongoDB server:

```bash
# macOS/Linux
mongod

# Windows — MongoDB starts as a service automatically
```

Leave `MONGODB_URI` in `.env` as the default `mongodb://localhost/listOfUsers`.

### MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Set it in your `.env`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/listOfUsers
```

## Running

```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

Then open `http://localhost:4000`.

## Environment Variables

| Variable      | Description                   | Default                           |
|---------------|-------------------------------|-----------------------------------|
| `MONGODB_URI` | MongoDB connection string     | `mongodb://localhost/listOfUsers` |
| `PORT`        | Port the server listens on    | `4000`                            |

## Project Structure

```
.
├── public/               # Static client-side files
├── server/
│   ├── index.js          # Main server + socket events
│   ├── dbconnection.js   # MongoDB connection
│   └── utils/users.js    # In-memory user management
├── models/
│   ├── list.js           # Schema for room/user tracking
│   └── message.js        # Schema for message persistence
└── package.json
```

## Improvements Made

- **Environment variables** — `MONGODB_URI` and `PORT` via `.env` instead of hardcoded values
- **Message persistence** — Messages saved to MongoDB; last 50 loaded on room join
- **Validation** — Empty name/room blocked on client and server; duplicate usernames per room rejected
- **Security** — Helmet middleware added (XSS protection, clickjacking prevention, MIME sniffing protection)
- **npm scripts** — `npm start` and `npm run dev` added
- **README** — Setup instructions, env vars table, Atlas guide, troubleshooting

## Troubleshooting

**MongoDB connection error** — Ensure `mongod` is running and listening on `localhost:27017`, or that your Atlas URI is correct.

**Port 4000 already in use** — Set `PORT=YOUR_PORT` in your `.env` file.
