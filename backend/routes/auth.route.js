import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  sendOTP,
  verifyOTP,
  getMe,
  updateProfile,
  logout,
} from "../controllers/auth.controller.js";

const router = express.Router();

// =============================================
// AUTHENTICATION
// =============================================

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// =============================================
// USER PROFILE
// =============================================

router.get("/me", authMiddleware, getMe);
router.patch("/profile", authMiddleware, updateProfile);
router.post("/logout", authMiddleware, logout);

export default router;
