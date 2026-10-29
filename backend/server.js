import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import multer from "multer";

import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";

const app = express();

const PORT = Number(process.env.PORT || 5000);
const rawClientUrl = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.trim().replace(/\/+$/, "")
  : "";
const CLIENT_URL = rawClientUrl;
const isProduction = process.env.NODE_ENV === "production";

// ----------------------------------------------------
// Validate environment variables.
// ----------------------------------------------------

const requiredEnvironmentVariables = [
  "MONGO_URI",
  "JWT_SECRET",
  "OTP_SECRET",
  "CLIENT_URL",
];

for (const variable of requiredEnvironmentVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

const hasEmailConfig =
  Boolean(process.env.RESEND_API_KEY) ||
  Boolean(process.env.BREVO_API_KEY) ||
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

if (!hasEmailConfig) {
  console.warn(
    "[Email] Warning: No email provider configured. Please provide RESEND_API_KEY (recommended on Render Free Tier), BREVO_API_KEY, or EMAIL_USER and EMAIL_PASS.",
  );
}

if (
  process.env.JWT_SECRET.length < 32 ||
  process.env.OTP_SECRET.length < 32 ||
  process.env.JWT_SECRET === process.env.OTP_SECRET
) {
  throw new Error(
    "JWT_SECRET and OTP_SECRET must be different secrets of at least 32 characters.",
  );
}

try {
  const clientUrl = new URL(CLIENT_URL);

  if (!["http:", "https:"].includes(clientUrl.protocol)) {
    console.warn(`[Config] Unusual CLIENT_URL protocol: ${clientUrl.protocol}`);
  }

  if (isProduction && clientUrl.protocol !== "https:") {
    console.warn(
      `[Config] Notice: CLIENT_URL (${CLIENT_URL}) does not use HTTPS in production. Consider updating it to https://lenslm.netlify.app`,
    );
  }
} catch {
  console.warn(
    `[Config] Notice: Could not parse CLIENT_URL (${CLIENT_URL}) as URL. CORS will fall back to allowed list.`,
  );
}

if (isProduction) {
  app.set("trust proxy", 1);
}

// ----------------------------------------------------
// General security & CORS.
// ----------------------------------------------------

app.disable("x-powered-by");

// Allow cross-origin requests from the Netlify frontend to read API resources
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

const allowedOrigins = new Set(
  [
    CLIENT_URL,
    "https://lenslm.netlify.app",
    "http://localhost:5173",
  ].filter(Boolean),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.has(origin) ||
        /^https:\/\/[a-zA-Z0-9_-]+\.netlify\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS] Rejected request from origin: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  }),
);

// ----------------------------------------------------
// Request parsing.
// ----------------------------------------------------

app.use(
  express.json({
    limit: "100kb",
  }),
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "20kb",
  }),
);

app.use(cookieParser());

// ----------------------------------------------------
// Rate limits.
// ----------------------------------------------------

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again later.",
  },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Please try again later.",
  },
});

app.use("/api/auth/send-otp", otpRequestLimiter);
app.use("/api/auth/verify-otp", otpVerifyLimiter);

// ----------------------------------------------------
// Health check & Diagnostic endpoints.
// ----------------------------------------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running.",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/auth/email-status", (req, res) => {
  const provider = process.env.RESEND_API_KEY
    ? "resend"
    : process.env.BREVO_API_KEY
      ? "brevo"
      : process.env.EMAIL_USER
        ? "smtp"
        : "none";

  res.status(200).json({
    success: true,
    activeProvider: provider,
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    brevoConfigured: Boolean(process.env.BREVO_API_KEY),
    smtpConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    notice:
      isProduction && provider === "smtp"
        ? "Render Free Tier blocks outbound SMTP ports (25, 465, 587). Please configure RESEND_API_KEY in the Render dashboard to deliver emails via HTTPS."
        : "Email provider configured.",
  });
});

// ----------------------------------------------------
// Routes.
// ----------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/auth", chatRoutes);

// ----------------------------------------------------
// Unknown routes & error handling.
// ----------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.too.large" || error.status === 413) {
    return res.status(413).json({
      success: false,
      message: "Request payload is too large.",
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  if (error instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "Each file must be 10 MB or smaller.",
      LIMIT_FILE_COUNT: "You can upload a maximum of 5 files per request.",
      LIMIT_UNEXPECTED_FILE:
        "Unexpected file field. Use the field name 'files'.",
      LIMIT_PART_COUNT: "Too many multipart form parts.",
      LIMIT_FIELD_COUNT: "Too many form fields.",
      LIMIT_FIELD_VALUE: "A form field exceeds the allowed size.",
    };

    return res.status(400).json({
      success: false,
      message:
        messages[error.code] ||
        "The uploaded request exceeds the allowed limits.",
    });
  }

  if (
    error.message === "Only PDF, TXT, and DOCX files are allowed." ||
    error.message === "Unsupported file type."
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data.",
    });
  }

  console.error("Unhandled server error:", error);

  return res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
  });
});

// ----------------------------------------------------
// Connect MongoDB and start server.
// ----------------------------------------------------

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    await mongoose.connection.db.command({
      ping: 1,
    });

    console.log("MongoDB connected successfully.");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Allowed CORS origins:`, Array.from(allowedOrigins).join(", "));
    });

    server.on("error", (error) => {
      console.error("HTTP server error:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
