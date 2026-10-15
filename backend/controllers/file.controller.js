// controllers/file.controller.js
import path from "path";
import Chat from "../models/chat.model.js";
import { indexChatFile } from "../services/rag.service.js";
import { deleteFromCloudinary } from "../services/cloudinary.service.js";

const MAX_FILES_PER_CHAT = 20;
const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(String(id || ""));

const sanitizeFilename = (filename) =>
  path
    .basename(filename)
    .replace(/[\r\n]/g, "")
    .slice(0, 255);

export const uploadChatFiles = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    const { chatId } = req.params;

    if (!isValidObjectId(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID.",
      });
    }

    if (!uploadedFiles.length) {
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

    if (chat.files.length + uploadedFiles.length > MAX_FILES_PER_CHAT) {
      return res.status(400).json({
        success: false,
        message: `A chat can contain at most ${MAX_FILES_PER_CHAT} files.`,
      });
    }

    const detectedFiles = [];

    for (const file of uploadedFiles) {
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
    console.error("Upload files error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to upload the files.",
    });
  }
};

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

    await deleteFromCloudinary(file.storedName);

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

    return res.redirect(file.storagePath);
  } catch (error) {
    console.error("Download chat file error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to process the file download.",
    });
  }
};
