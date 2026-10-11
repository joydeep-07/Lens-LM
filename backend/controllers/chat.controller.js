import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileTypeFromBuffer } from "file-type";

import Chat from "../models/chat.model.js";

// ======================================================
// FILE UPLOAD CONFIGURATION & CONSTANTS
// ======================================================

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

const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(String(id || ""));

const sanitizeFilename = (filename) =>
  path
    .basename(filename)
    .replace(/[\r\n]/g, "")
    .slice(0, 255);

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
// 1. CREATE CHAT
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
// 2. GET ALL USER CHATS
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
// 3. GET SINGLE CHAT
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
// 4. DELETE CHAT
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
// 5. UPLOAD FILES TO CHAT
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
// 6. DELETE FILE FROM CHAT
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
