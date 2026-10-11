import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import User from "../models/user.model.js";

// ======================================================
// CONFIGURATION
// ======================================================

const OTP_EXPIRES_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES || 5);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_RESEND_SECONDS = Number(process.env.OTP_RESEND_SECONDS || 60);

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
