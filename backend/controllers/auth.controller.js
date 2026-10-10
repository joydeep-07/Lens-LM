import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileTypeFromBuffer } from "file-type";

import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";

// ======================================================
// CONFIGURATION
// ======================================================

const OTP_EXPIRES_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES || 5);

const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

const OTP_RESEND_SECONDS = Number(process.env.OTP_RESEND_SECONDS || 60);

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 5;
const MAX_FILES_PER_CHAT = 20;

const UPLOAD_DIR = path.resolve("uploads");

const ALLOWED_EXTENSIONS = new Set([".pdf", ".txt", ".docx"]);

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ======================================================
// EMAIL TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ======================================================
// AUTHENTICATION HELPERS
// ======================================================

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const hashOTP = (email, otp) =>
  crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`${email}:${otp}`)
    .digest("hex");

const safeCompare = (a, b) => {
  const first = Buffer.from(a, "hex");
  const second = Buffer.from(b, "hex");

  return (
    first.length === second.length && crypto.timingSafeEqual(first, second)
  );
};

const createToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      issuer: "ai-chatbot-api",
      audience: "ai-chatbot-client",
    },
  );

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(String(id || ""));

const sanitizeFilename = (filename) =>
  path
    .basename(filename)
    .replace(/[\r\n]/g, "")
    .slice(0, 255);

// ======================================================
// FILE UPLOAD CONFIGURATION
// ======================================================

const storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    try {
      await fs.mkdir(UPLOAD_DIR, {
        recursive: true,
        mode: 0o700,
      });

      callback(null, UPLOAD_DIR);
    } catch {
      callback(new Error("Unable to prepare private file storage."));
    }
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

export const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_REQUEST,
    fields: 2,
    parts: MAX_FILES_PER_REQUEST + 2,
  },

  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return callback(new Error("Only PDF, TXT, and DOCX files are allowed."));
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return callback(new Error("Unsupported file type."));
    }

    callback(null, true);
  },
});

// ======================================================
// 1. SEND EMAIL OTP
// POST /api/auth/send-otp
// ======================================================

export const sendOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email || email.length > 254 || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const now = new Date();

    let user = await User.findOne({ email }).select(
      "+otpHash +otpExpiresAt +otpAttempts +otpBlockedUntil +otpLastSentAt",
    );

    if (
      user?.otpBlockedUntil &&
      user.otpBlockedUntil.getTime() > now.getTime()
    ) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again later.",
      });
    }

    if (
      user?.otpLastSentAt &&
      now.getTime() - user.otpLastSentAt.getTime() < OTP_RESEND_SECONDS * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${OTP_RESEND_SECONDS} seconds before requesting another OTP.`,
      });
    }

    if (!user) {
      user = new User({ email });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.otpHash = hashOTP(email, otp);

    user.otpExpiresAt = new Date(
      now.getTime() + OTP_EXPIRES_MINUTES * 60 * 1000,
    );

    user.otpAttempts = 0;
    user.otpBlockedUntil = undefined;
    user.otpLastSentAt = now;

    await user.save();

    try {
      await transporter.sendMail({
        from: `"AI Chatbot" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your login verification code",

        text: `Your verification code is ${otp}. It expires in ${OTP_EXPIRES_MINUTES} minutes. If you did not request this code, ignore this email.`,

        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
            <h2>Verify your email</h2>
            <p>Use this code to sign in to your account.</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px">
              ${otp}
            </div>
            <p>This code expires in ${OTP_EXPIRES_MINUTES} minutes.</p>
            <p>If you did not request this code, ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpLastSentAt = undefined;

      await user.save();

      console.error("Email delivery failed:", error.message);

      return res.status(503).json({
        success: false,
        message:
          "Unable to send the verification email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "If the address is eligible, a verification code has been sent.",
      expiresIn: OTP_EXPIRES_MINUTES * 60,
      resendAfter: OTP_RESEND_SECONDS,
    });
  } catch (error) {
    console.error("Send OTP error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process the request.",
    });
  }
};

// ======================================================
// 2. VERIFY EMAIL OTP
// POST /api/auth/verify-otp
// ======================================================

export const verifyOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "");

    if (
      !email ||
      email.length > 254 ||
      !emailRegex.test(email) ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or verification code.",
      });
    }

    const user = await User.findOne({ email }).select(
      "+otpHash +otpExpiresAt +otpAttempts +otpBlockedUntil +otpLastSentAt",
    );

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    const now = new Date();

    if (
      user.otpBlockedUntil &&
      user.otpBlockedUntil.getTime() > now.getTime()
    ) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again later.",
      });
    }

    if (user.otpExpiresAt.getTime() <= now.getTime()) {
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Your verification code has expired. Request a new one.",
      });
    }

    const submittedHash = hashOTP(email, otp);

    if (!safeCompare(user.otpHash, submittedHash)) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;

      if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
        user.otpBlockedUntil = new Date(now.getTime() + 15 * 60 * 1000);

        user.otpHash = undefined;
        user.otpExpiresAt = undefined;
        user.otpAttempts = 0;
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    // Invalidate the OTP after successful verification.
    user.isEmailVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpBlockedUntil = undefined;
    user.otpLastSentAt = undefined;

    await user.save();

    const token = createToken(user);

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Authentication successful.",

      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify the code.",
    });
  }
};

// ======================================================
// 3. GET CURRENT USER
// GET /api/auth/me
// ======================================================

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// ======================================================
// 4. UPDATE USER PROFILE
// PATCH /api/auth/profile
// ======================================================

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "username"];
    const submittedFields = Object.keys(req.body || {});

    if (
      submittedFields.length === 0 ||
      submittedFields.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Only name and username can be updated.",
      });
    }

    const updates = {};

    if (Object.hasOwn(req.body, "name")) {
      if (typeof req.body.name !== "string" || req.body.name.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Invalid name.",
        });
      }

      updates.name = req.body.name.trim();
    }

    if (Object.hasOwn(req.body, "username")) {
      if (
        typeof req.body.username !== "string" ||
        req.body.username.length > 30 ||
        !/^[a-zA-Z0-9_.-]*$/.test(req.body.username.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid username.",
        });
      }

      updates.username = req.body.username.trim().toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    ).select("_id email name username isEmailVerified");

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update the profile.",
    });
  }
};

// ======================================================
// 5. LOGOUT
// POST /api/auth/logout
// ======================================================

export const logout = (req, res) => {
  clearAuthCookie(res);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// ======================================================
// 6. CREATE CHAT
// POST /api/auth/chats
// ======================================================

export const createChat = async (req, res) => {
  try {
    const title =
      typeof req.body?.title === "string" ? req.body.title.trim() : "New Chat";

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Chat title is too long.",
      });
    }

    const chat = await Chat.create({
      user: req.user._id,
      title: title || "New Chat",
      messages: [],
      files: [],
    });

    return res.status(201).json({
      success: true,

      chat: {
        id: chat._id,
        title: chat.title,
        messages: chat.messages,
        files: chat.files,
        createdAt: chat.createdAt,
      },
    });
  } catch (error) {
    console.error("Create chat error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create chat.",
    });
  }
};

// ======================================================
// 7. GET ALL USER CHATS
// GET /api/auth/chats
// ======================================================

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      user: req.user._id,
    })
      .select("title createdAt updatedAt lastMessageAt")
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("Get chats error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve chats.",
    });
  }
};

// ======================================================
// 8. GET SINGLE CHAT
// GET /api/auth/chats/:chatId
// ======================================================

export const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!isValidObjectId(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID.",
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user._id,
    })
      .select("-files.storagePath")
      .lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    return res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error("Get chat error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the chat.",
    });
  }
};

// ======================================================
// 9. DELETE CHAT
// DELETE /api/auth/chats/:chatId
// ======================================================

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!isValidObjectId(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID.",
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user._id,
    }).select("+files.storagePath");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    await Promise.all(
      chat.files.map(async (file) => {
        try {
          await fs.unlink(file.storagePath);
        } catch (error) {
          if (error.code !== "ENOENT") {
            console.error("File cleanup error:", error.message);
          }
        }
      }),
    );

    await chat.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully.",
    });
  } catch (error) {
    console.error("Delete chat error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the chat.",
    });
  }
};

// ======================================================
// 10. UPLOAD FILES TO CHAT
// POST /api/auth/chats/:chatId/files
// ======================================================

export const uploadChatFiles = async (req, res) => {
  const uploadedPaths = (req.files || []).map((file) => file.path);

  try {
    const { chatId } = req.params;

    if (!isValidObjectId(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID.",
      });
    }

    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one file.",
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user._id,
    }).select("+files.storagePath");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    if (chat.files.length + req.files.length > MAX_FILES_PER_CHAT) {
      return res.status(400).json({
        success: false,
        message: `A chat can contain at most ${MAX_FILES_PER_CHAT} files.`,
      });
    }

    const detectedFiles = [];

    for (const file of req.files) {
      const extension = path.extname(file.originalname).toLowerCase();

      const buffer = await fs.readFile(file.path);

      const detected = await fileTypeFromBuffer(buffer.subarray(0, 4100));

      const validPdf =
        extension === ".pdf" && detected?.mime === "application/pdf";

      const validDocx =
        extension === ".docx" && detected?.mime === "application/zip";

      // Plain text does not have a reliable binary signature.
      const validText =
        extension === ".txt" &&
        file.mimetype === "text/plain" &&
        !buffer.includes(0);

      if (!validPdf && !validDocx && !validText) {
        throw new Error(
          `Unsupported or invalid file format: ${sanitizeFilename(file.originalname)}`,
        );
      }

      detectedFiles.push({
        originalName: sanitizeFilename(file.originalname),
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        storagePath: file.path,
        processingStatus: "pending",
      });
    }

    chat.files.push(...detectedFiles);

    await chat.save();

    return res.status(201).json({
      success: true,
      message: "Files uploaded successfully.",

      files: chat.files.slice(-detectedFiles.length).map((file) => ({
        id: file._id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        processingStatus: file.processingStatus,
        uploadedAt: file.uploadedAt,
      })),
    });
  } catch (error) {
    await Promise.all(
      uploadedPaths.map(async (filePath) => {
        try {
          await fs.unlink(filePath);
        } catch {
          // Ignore cleanup failures.
        }
      }),
    );

    if (error.message.startsWith("Unsupported or invalid file format:")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Upload files error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to upload the files.",
    });
  }
};

// ======================================================
// 11. DELETE FILE FROM CHAT
// DELETE /api/auth/chats/:chatId/files/:fileId
// ======================================================

export const deleteChatFile = async (req, res) => {
  try {
    const { chatId, fileId } = req.params;

    if (!isValidObjectId(chatId) || !isValidObjectId(fileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat or file ID.",
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user._id,
    }).select("+files.storagePath");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    const file = chat.files.id(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    try {
      await fs.unlink(file.storagePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    file.deleteOne();

    await chat.save();

    return res.status(200).json({
      success: true,
      message: "File deleted successfully.",
    });
  } catch (error) {
    console.error("Delete chat file error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the file.",
    });
  }
};
