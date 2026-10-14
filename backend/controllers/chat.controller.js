import fs from "fs/promises";
import { getGroqChatCompletion } from "../services/ai.service.js";
import { getRagAnswer, deleteChatChunks } from "../services/rag.service.js";

import Chat from "../models/chat.model.js";

const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(String(id || ""));

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

    await deleteChatChunks(chat._id);

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
// 5. SEND MESSAGE & GET AI RESPONSE
// POST /api/auth/chats/:chatId/messages
// ======================================================

export const sendChatMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message, model } = req.body;

    if (!isValidObjectId(chatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chat ID." });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message content is required." });
    }

    const chat = await Chat.findOne({ _id: chatId, user: req.user._id });

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found." });
    }

    chat.messages.push({
      role: "user",
      content: message.trim(),
    });

    const modelMap = {
      "Nova Mini": "openai/gpt-oss-20b",
      "Nova Pro": "openai/gpt-oss-120b",
      "Lens Ultra": "openai/gpt-oss-120b",
    };
    const selectedGroqModel = modelMap[model] || "openai/gpt-oss-20b";

    const aiResponseText = await getRagAnswer(
      chat,
      message.trim(),
      selectedGroqModel,
    );

    chat.messages.push({
      role: "assistant",
      content: aiResponseText,
    });

    chat.lastMessageAt = new Date();
    await chat.save();

    return res.status(200).json({
      success: true,
      message: aiResponseText,
      messages: chat.messages,
    });
  } catch (error) {
    console.error("Chat message error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to process the AI response.",
    });
  }
};

export const renameChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid chat title.",
      });
    }

    // Find the chat and ensure it belongs to the authenticated user
    const chat = await Chat.findOne({ _id: chatId, user: req.user._id });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    chat.title = title.trim();
    await chat.save();

    return res.status(200).json({
      success: true,
      message: "Chat renamed successfully.",
      chat,
    });
  } catch (error) {
    console.error("Rename chat error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to rename the chat.",
    });
  }
};