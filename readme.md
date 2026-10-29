# Lens LM

> An AI-powered document research assistant built with React, Node.js, MongoDB, and Groq. Upload PDFs, Word documents, spreadsheets, and code files — then ask questions and get accurate, cited answers grounded in your documents using Retrieval-Augmented Generation (RAG).

---

## Features

- **OTP-based authentication** — passwordless login via 6-digit email codes with rate limiting and brute-force protection
- **Multi-model AI** — Nova Mini, Nova Pro, and Lens Ultra powered by Groq (OpenAI-compatible routing)
- **RAG pipeline** — semantic search over uploaded documents using local `all-MiniLM-L6-v2` embeddings (Xenova/transformers.js)
- **Document support** — PDF, DOCX, TXT, Markdown, CSV, XLSX, images, and code files (JS, JSX, HTML, CSS, Python)
- **Chat history** — full conversation browser with search, filter by pinned, preview, and export
- **Pin / unpin chats** — persist pinned status in MongoDB per-user; pinned chats appear in a dedicated section above recent chats
- **Chat management** — rename, delete, pin/unpin from inline controls in the history panel
- **File management** — upload up to 5 files per request, 10 MB each, with Cloudinary cloud storage
- **Source references** — AI cites filename and page number when quoting document passages
- **Dark / light theme** — persistent CSS variable-based theming with one-click toggle
- **Voice output** — Microsoft Azure Cognitive Services TTS with voice selector
- **Responsive design** — full mobile drawer support for side panel and sources panel
- **Security** — JWT httpOnly cookies, Helmet.js, CORS, rate limiting, input validation, user-scoped data isolation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, Redux Toolkit, Framer Motion, GSAP |
| Backend | Node.js 22 (ESM), Express 5, Mongoose 9 |
| Database | MongoDB Atlas |
| AI / LLM | Groq API (OpenAI-compatible) |
| Embeddings | `@xenova/transformers` — `all-MiniLM-L6-v2` (runs locally, no external API) |
| File Storage | Cloudinary |
| Authentication | JWT (HS256) + OTP via Nodemailer/Gmail |
| Speech | Microsoft Cognitive Services Speech SDK |


## Installation

### Prerequisites

- Node.js 22+
- A MongoDB Atlas cluster (free tier works)
- Cloudinary account (free tier works)
- Groq API key — [console.groq.com](https://console.groq.com)
- Gmail account with an App Password enabled for SMTP

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Lens LM"
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env` (see [Environment Variables](#environment-variables) below).

Start the backend:

```bash
node server.js
```

On first run, the embedding model (`all-MiniLM-L6-v2`, ~22 MB) is downloaded automatically and cached in `backend/.cache/` by `@xenova/transformers`. Subsequent starts are instant.

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment Variables

### `backend/.env`

```env
# ── Server ──────────────────────────────────────────
PORT=5000
NODE_ENV=development          # "production" in prod
CLIENT_URL=http://localhost:5173  # Must match frontend origin exactly
MONGO_URI=

JWT_SECRET=<min-32-char-random-secret>
JWT_EXPIRES_IN=1d
OTP_SECRET=<different-min-32-char-random-secret>

OTP_EXPIRES_MINUTES=5         # OTP validity window
OTP_MAX_ATTEMPTS=5            # Failed attempts before lockout
OTP_RESEND_SECONDS=60         # Cooldown between OTP requests

EMAIL_USER=you@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx 

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=000000000000000
CLOUDINARY_API_SECRET=your-api-secret

GROQ_API_KEY=gsk_...

RAG_EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
RAG_CHUNK_SIZE=1000           # Characters per chunk
RAG_CHUNK_OVERLAP=200         # Overlap between adjacent chunks
RAG_TOP_K=6                   # Chunks retrieved per query
RAG_SIMILARITY_THRESHOLD=0.25 # Cosine similarity cutoff
```

### `frontend/.env` (optional)

The frontend uses hardcoded `http://localhost:5000/api` in `src/api/endpoints.js`. For a different backend URL, update that file directly.

---

## API Reference

All routes are prefixed with `/api`. Chat routes are registered under `/api/auth`.

### Authentication

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/send-otp` | Send 6-digit OTP to email | Public |
| `POST` | `/api/auth/verify-otp` | Verify OTP, receive JWT cookie | Public |
| `GET` | `/api/auth/me` | Get current user profile | Required |
| `PATCH` | `/api/auth/profile` | Update name or username | Required |
| `POST` | `/api/auth/logout` | Clear JWT cookie | Required |

### Chat Management

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/chats` | Create a new chat | Required |
| `GET` | `/api/auth/chats` | List all chats (pinned first, then recent) | Required |
| `GET` | `/api/auth/chats/:chatId` | Get single chat with full messages | Required |
| `DELETE` | `/api/auth/chats/:chatId` | Delete chat, files, and RAG chunks | Required |
| `PATCH` | `/api/auth/chats/:chatId/rename` | Rename chat title | Required |
| `PATCH` | `/api/auth/chats/:chatId/pin` | Toggle pinned status | Required |
| `POST` | `/api/auth/chats/:chatId/messages` | Send message and get AI reply | Required |

### File Management

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/chats/:chatId/files` | Upload up to 5 files (multipart) | Required |
| `DELETE` | `/api/auth/chats/:chatId/files/:fileId` | Delete a file | Required |
| `GET` | `/api/auth/chats/:chatId/files/:fileId/download` | Download or redirect to file | Required |

### Miscellaneous

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |

---

## Architecture

### Authentication Flow

```
User enters email
  → POST /api/auth/send-otp
  → HMAC-SHA256 OTP hash stored in MongoDB
  → OTP sent via Nodemailer/Gmail

User enters 6-digit code
  → POST /api/auth/verify-otp
  → Timing-safe hash comparison
  → JWT (HS256) set as httpOnly cookie (1-day expiry)

All subsequent requests
  → auth.middleware.js reads cookie, verifies JWT, attaches req.user
```

### RAG Pipeline

```
File Upload
  → Cloudinary stores the binary (cloud URL returned)
  → background job: extract text → chunk (1000 chars, 200 overlap)
  → embed each chunk with all-MiniLM-L6-v2 (384-dim vectors)
  → store DocumentChunk documents in MongoDB

Chat Message
  → embed user query with same model
  → cosine similarity against all chat's chunks
  → retrieve top-K chunks above threshold (0.25)
  → if chunks found:  build RAG system prompt with context + sources → Groq
  → if indexing in progress: return "still being indexed" message
  → if no chunks match: acknowledge + fallback general-knowledge answer
  → if no files: plain Groq completion with DEFAULT_SYSTEM_PROMPT
```

### Data Models

#### User

```
_id, email (unique), name, username,
isEmailVerified, otpHash*, otpExpiresAt*, otpAttempts*,
otpBlockedUntil*, otpLastSentAt*
(* select: false — never returned in API responses)
```

#### Chat

```
_id, user (→ User), title, pinned (Boolean, default false),
messages[{ role, content, createdAt, referencedFiles }],
files[{ originalName, storedName, mimeType, size, storagePath*, processingStatus, uploadedAt }],
lastMessageAt, createdAt, updatedAt
(storagePath is select: false)
```

#### DocumentChunk

```
_id, chatId (→ Chat), userId (→ User), fileId, fileName,
chunkIndex, pageNumber, text, embedding[384 × Number],
createdAt (TTL: auto-deleted after 30 days)
```

### Security Measures

- All cookies: `httpOnly: true`, `sameSite: "lax"`, `secure: true` in production
- OTP: HMAC-SHA256 hash, `crypto.timingSafeEqual` comparison
- Rate limiting: 300 req/15 min global; 5 OTP sends + 10 OTP verifies per 15 min
- Helmet.js with CORS policy
- `strict: "throw"` on Mongoose schemas — unexpected fields cause errors
- `storagePath` and all OTP fields use `select: false`
- All chat operations query `{ _id: chatId, user: req.user._id }` — cross-user access is impossible

---

## Scripts

### Backend

```bash
# Start server (development)
node server.js

# Syntax check a file
node --check services/rag.service.js
```

### Frontend

```bash
# Development server (Vite HMR)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

---

## Deployment

### Backend (e.g. Railway, Render, Fly.io)

1. Set all environment variables from `backend/.env` in the platform dashboard.
2. Set `NODE_ENV=production` and `CLIENT_URL=https://your-frontend-domain.com`.
3. Start command: `node server.js`.
4. The `@xenova/transformers` model (~22 MB) downloads on first startup — ensure your platform allows outbound internet access and has adequate startup timeout.

### Frontend (e.g. Vercel, Netlify)

1. Build command: `npm run build` in the `frontend/` directory.
2. Publish directory: `frontend/dist`.
3. Update `frontend/src/api/endpoints.js` `BASE_URL` to point at your deployed backend URL.

---

## Troubleshooting

### Backend won't start

- **`Missing required environment variable`** — check `backend/.env` for all required vars.
- **`JWT_SECRET and OTP_SECRET must be different`** — generate two separate 64-char hex strings.
- **`EADDRINUSE: port 5000`** — kill the process: `npx kill-port 5000` or `taskkill /F /IM node.exe`.

### Embedding model issues

- **First run is slow (~30 s)** — the model downloads from HuggingFace on first start. This is normal; a `[RAG] Embedding model ready.` log confirms success.
- **`[RAG] Embedding model warm-up failed`** — check outbound internet access from the server at startup.

### RAG not finding document content

- **"Still being indexed"** — the document was just uploaded. Wait a few seconds and retry.
- **File shows "Ready" but AI ignores it** — check server logs for `[RAG] Indexed "filename": N chunks stored.` If missing, look for `[RAG] Indexing failed for...` errors.
- **No relevant chunks found** — lower `RAG_SIMILARITY_THRESHOLD` (try `0.15`) or increase `RAG_TOP_K`.

### OTP email not received

- Confirm `EMAIL_USER` and `EMAIL_PASS` (App Password, not account password) are correct.
- Check spam/junk folder.
- Verify Gmail 2FA is enabled and the App Password is generated under **Google Account → Security → App passwords**.

### CORS errors in browser

- Ensure `CLIENT_URL` in `backend/.env` matches the exact frontend origin including protocol and port (e.g., `http://localhost:5173`).
- In production, both must use `https://`.

---

## License

This project was built by **Joydeep Paul**. All rights reserved.
