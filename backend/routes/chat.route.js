import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createChat,
  getChats,
  getChat,
  deleteChat,
  uploadChatFiles,
  deleteChatFile,
  upload,
} from "../controllers/chat.controller.js";
import { sendChatMessage } from "../controllers/chat.controller.js";

const router = express.Router();

// =============================================
// CHAT MANAGEMENT
// =============================================

router.post("/chats", authMiddleware, createChat);
router.get("/chats", authMiddleware, getChats);
router.get("/chats/:chatId", authMiddleware, getChat);
router.delete("/chats/:chatId", authMiddleware, deleteChat);

router.post("/chats/:chatId/messages", authMiddleware, sendChatMessage);

// =============================================
// FILE MANAGEMENT
// =============================================

router.post(
  "/chats/:chatId/files",
  authMiddleware,
  upload.array("files", 5),
  uploadChatFiles,
);

router.delete("/chats/:chatId/files/:fileId", authMiddleware, deleteChatFile);

export default router;
