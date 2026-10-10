import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import multer from "multer";

import authRoutes from "./routes/auth.route.js";

const app = express();

const PORT = Number(process.env.PORT || 5000);
const CLIENT_URL = process.env.CLIENT_URL;
const isProduction = process.env.NODE_ENV === "production";

// ----------------------------------------------------
// Validate environment variables.
// ----------------------------------------------------

const requiredEnvironmentVariables = [
  "MONGO_URI",
  "JWT_SECRET",
  "OTP_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "CLIENT_URL",
];

for (const variable of requiredEnvironmentVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
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

  if (
    !["http:", "https:"].includes(clientUrl.protocol) ||
    clientUrl.origin !== CLIENT_URL
  ) {
    throw new Error();
  }

  if (isProduction && clientUrl.protocol !== "https:") {
    throw new Error();
  }
} catch {
  throw new Error(
    "CLIENT_URL must be a valid origin, such as http://localhost:5173, and must use HTTPS in production.",
  );
}

// Configure only when the application is behind one
// correctly configured, trusted reverse proxy.
if (isProduction) {
  app.set("trust proxy", 1);
}

// ----------------------------------------------------
// General security.
// ----------------------------------------------------

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "same-site",
    },
  }),
);

// ----------------------------------------------------
// CORS.
// ----------------------------------------------------

app.use(
  cors({
    origin: CLIENT_URL,
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
// General API rate limit.
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

// ----------------------------------------------------
// OTP rate limits.
// ----------------------------------------------------

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
// Health check.
// ----------------------------------------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running.",
  });
});

// ----------------------------------------------------
// Authentication, profile, chat, and file routes.
// ----------------------------------------------------

app.use("/api/auth", authRoutes);

// ----------------------------------------------------
// Unknown routes.
// ----------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// ----------------------------------------------------
// Central error handler.
// ----------------------------------------------------

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // Request body exceeds express.json() limit.
  if (error.type === "entity.too.large" || error.status === 413) {
    return res.status(413).json({
      success: false,
      message: "Request payload is too large.",
    });
  }

  // Handle malformed JSON.
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  // Handle file upload errors from Multer.
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

  // Handle unsupported file types rejected by fileFilter.
  if (
    error.message === "Only PDF, TXT, and DOCX files are allowed." ||
    error.message === "Unsupported file type."
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Handle Mongoose validation errors.
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data.",
    });
  }

  // Avoid exposing internal errors to clients.
  console.error("Unhandled server error:", error);

  return res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
  });
});

// ----------------------------------------------------
// Connect MongoDB and start the server.
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
