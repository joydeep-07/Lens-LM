import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import Chat from "../models/chat.model.js";
import { indexChatFile } from "../services/rag.service.js";

// ======================================================
// FILE UPLOAD CONFIGURATION & CONSTANTS
// ======================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 5;
const MAX_FILES_PER_CHAT = 20;

const UPLOAD_DIR = path.resolve("uploads");

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".txt",
  ".doc",
  ".docx",
  ".md",
  ".csv",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
  ".js",
  ".py",
  ".jsx",
  ".html",
  ".css",
]);

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "application/octet-stream",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "text/javascript",
  "application/javascript",
  "text/x-python",
  "text/html",
  "text/css",
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
      return callback(new Error("Unsupported file extension."));
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return callback(new Error("Unsupported MIME type."));
    }

    callback(null, true);
  },
});

// ======================================================
// 1. UPLOAD FILES TO CHAT
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

      const validPdf =
        extension === ".pdf" && file.mimetype === "application/pdf";
      const validDocx =
        extension === ".docx" && file.mimetype.includes("wordprocessingml");
      const validImage =
        [".jpg", ".jpeg", ".png"].includes(extension) &&
        file.mimetype.startsWith("image/");
      const validTextOrCode = [
        ".txt",
        ".md",
        ".csv",
        ".js",
        ".py",
        ".jsx",
        ".html",
        ".css",
        ".xls",
        ".xlsx",
        ".doc",
      ].includes(extension);

      if (!validPdf && !validDocx && !validImage && !validTextOrCode) {
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

    const newFileIds = new Set(
      chat.files.slice(-detectedFiles.length).map((f) => String(f._id)),
    );

    Chat.findOne({ _id: chat._id, user: req.user._id })
      .select("+files.storagePath")
      .then((chatWithPaths) => {
        if (!chatWithPaths) return;
        const filesToIndex = chatWithPaths.files.filter((f) =>
          newFileIds.has(String(f._id)),
        );
        for (const file of filesToIndex) {
          indexChatFile(chatWithPaths, file).catch((err) =>
            console.error("[RAG] Background indexing error:", err.message),
          );
        }
      })
      .catch((err) =>
        console.error("[RAG] Failed to fetch chat for indexing:", err.message),
      );

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
// 2. DELETE FILE FROM CHAT
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


// ======================================================
// 3. DOWNLOAD FILE FROM CHAT
// GET /api/auth/chats/:chatId/files/:fileId/download
// ======================================================

export const downloadChatFile = async (req, res) => {
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

    // Send the file for download using its original filename
    return res.download(file.storagePath, file.originalName, (err) => {
      if (err && !res.headersSent) {
        console.error("File download error:", err.message);
        return res.status(500).json({
          success: false,
          message: "Unable to download the file.",
        });
      }
    });
  } catch (error) {
    console.error("Download chat file error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process the file download.",
    });
  }
};