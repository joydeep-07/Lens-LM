import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  sendOTP,
  verifyOTP,
  getMe,
  updateProfile,
  logout,
  createChat,
  getChats,
  getChat,
  deleteChat,
  uploadChatFiles,
  deleteChatFile,
  upload,
} from "../controllers/auth.controller.js";

const router = express.Router();

// =============================================
// AUTHENTICATION
// =============================================

// Send email OTP
router.post("/send-otp", sendOTP);

// Verify OTP and authenticate the user
router.post("/verify-otp", verifyOTP);

// =============================================
// USER PROFILE
// =============================================

// Get authenticated user
router.get("/me", authMiddleware, getMe);

// Update name and username
router.patch("/profile", authMiddleware, updateProfile);

// Logout
router.post("/logout", authMiddleware, logout);

// =============================================
// CHAT MANAGEMENT
// =============================================

// Create a new chat
router.post("/chats", authMiddleware, createChat);

// Get all chats belonging to the authenticated user
router.get("/chats", authMiddleware, getChats);

// Get a specific chat
router.get("/chats/:chatId", authMiddleware, getChat);

// Delete a specific chat
router.delete("/chats/:chatId", authMiddleware, deleteChat);

// =============================================
// FILE MANAGEMENT
// =============================================

// Upload multiple files to a chat
router.post(
  "/chats/:chatId/files",
  authMiddleware,
  upload.array("files", 5),
  uploadChatFiles,
);

// Delete a file from a chat
router.delete("/chats/:chatId/files/:fileId", authMiddleware, deleteChatFile);

export default router;
