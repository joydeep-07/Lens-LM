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
| Authentication | JWT (HS256) + OTP (Resend HTTP API for Render Free Tier, or Nodemailer/Gmail) |
| Speech | Microsoft Cognitive Services Speech SDK |

---

## Installation

### Prerequisites

- Node.js 22+
- A MongoDB Atlas cluster (free tier works)
- Cloudinary account (free tier works)
- Groq API key — [console.groq.com](https://console.groq.com)
- Email Provider:
  - **For Render Free Tier:** A free [Resend](https://resend.com) API key (sends over HTTPS port 443; Render Free Tier blocks SMTP ports 25, 465, 587).
  - **For Local Development:** Gmail account with an App Password.

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
npm start
```

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

# ── MongoDB ─────────────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>

# ── Authentication ───────────────────────────────────
# Both secrets must be ≥ 32 characters and must differ from each other
JWT_SECRET=<min-32-char-random-secret>
JWT_EXPIRES_IN=1d
OTP_SECRET=<different-min-32-char-random-secret>

# ── OTP Configuration ───────────────────────────────
OTP_EXPIRES_MINUTES=5         # OTP validity window
OTP_MAX_ATTEMPTS=5            # Failed attempts before lockout
OTP_RESEND_SECONDS=60         # Cooldown between OTP requests

# ── Email Delivery ───────────────────────────────────
# Option A: Resend HTTP API (RECOMMENDED for Render Free Tier)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Lens LM <onboarding@resend.dev>

# Option B: Gmail SMTP (For local development or paid cloud instances)
EMAIL_USER=you@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # 16-character Gmail App Password

# ── Cloudinary ──────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=000000000000000
CLOUDINARY_API_SECRET=your-api-secret

# ── AI / Groq ────────────────────────────────────────
GROQ_API_KEY=gsk_...

# ── RAG (all optional — defaults shown) ─────────────
RAG_EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
RAG_CHUNK_SIZE=1000           # Characters per chunk
RAG_CHUNK_OVERLAP=200         # Overlap between adjacent chunks
RAG_TOP_K=6                   # Chunks retrieved per query
RAG_SIMILARITY_THRESHOLD=0.25 # Cosine similarity cutoff
```

### `frontend/.env` (Netlify)

```env
VITE_API_URL=https://lens-lm.onrender.com/api
```

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
  → OTP sent via Resend HTTPS API (port 443) or Nodemailer/Gmail (SMTP)

User enters 6-digit code
  → POST /api/auth/verify-otp
  → Timing-safe hash comparison
  → JWT (HS256) set as httpOnly cookie (SameSite=None, Secure=true in prod)

All subsequent requests
  → auth.middleware.js reads cookie, verifies JWT, attaches req.user
```

### Security Measures

- All cookies: `httpOnly: true`, `sameSite: "none"` (cross-site in production), `secure: true` in production
- OTP: HMAC-SHA256 hash, `crypto.timingSafeEqual` comparison
- Rate limiting: 300 req/15 min global; 5 OTP sends + 10 OTP verifies per 15 min
- Helmet.js with cross-origin resource policy
- `strict: "throw"` on Mongoose schemas — unexpected fields cause errors
- `storagePath` and all OTP fields use `select: false`
- All chat operations query `{ _id: chatId, user: req.user._id }` — cross-user access is impossible

---

## Troubleshooting

### OTP Email Delivery Failure (503 Service Unavailable on Render)

- **Render Free Tier SMTP Restriction**: Render blocks outbound network traffic on standard SMTP ports (`25`, `465`, `587`) on free web services to prevent spam.
- **Solution**: Set `RESEND_API_KEY` in your Render Web Service environment variables. Resend uses standard HTTPS (port `443`), which is never blocked by Render.
- Get a free key in 1 minute at [resend.com](https://resend.com) (free 3,000 emails/month, no credit card required) and set:
  - `RESEND_API_KEY=re_...`
  - `EMAIL_FROM=Lens LM <onboarding@resend.dev>`

### Backend won't start

- **`Missing required environment variable`** — check Render/local environment variables.
- **`JWT_SECRET and OTP_SECRET must be different`** — generate two separate 64-char hex strings.
- **`EADDRINUSE: port 5000`** — kill the process: `npx kill-port 5000` or `taskkill /F /IM node.exe`.

### CORS errors in browser

- Ensure `CLIENT_URL` in Render matches the exact frontend origin without a trailing slash (`https://lenslm.netlify.app`).

---

## License

This project was built by **Joydeep Paul**. All rights reserved.
