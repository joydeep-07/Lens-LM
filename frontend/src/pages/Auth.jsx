import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowUpRight,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Lock,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import { FaMeta } from "react-icons/fa6";
import { useDispatch } from "react-redux";

import Logo from "../components/Logo";
import axios from "../api/axios";
import endpoints from "../api/endpoints";
import { loginSuccess } from "../redux/authSlice";

const Auth = ({ className = "" }) => {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Send OTP to the user's email.
  const handleSendOTP = async (e) => {
    e?.preventDefault();

    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(endpoints.sendOTP, {
        email: normalizedEmail,
      });

      setEmail(normalizedEmail);
      setOtp("");

      setMessage(
        response.data?.message ||
          "OTP sent successfully. Please check your email.",
      );

      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and save the authenticated user in Redux.
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const normalizedOTP = otp.trim();

    if (!/^\d{6}$/.test(normalizedOTP)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(endpoints.verifyOTP, {
        email: email.trim().toLowerCase(),
        otp: normalizedOTP,
      });

      // Expect the backend to return the authenticated user.
      const user = response.data?.user;

      if (!user) {
        throw new Error(
          "Login response did not contain user information. Check your backend response.",
        );
      }

      // Redux updates its state and persists the profile to localStorage.
      dispatch(loginSuccess(user));

      setMessage(response.data?.message || "Login successful.");

      // Redirect after successful authentication.
      window.location.assign("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "OTP verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Return to the email entry step.
  const handleChangeEmail = () => {
    setStep(1);
    setOtp("");
    setError("");
    setMessage("");
  };

  // Social login placeholders until OAuth is configured.
  const handleSocialLogin = (provider) => {
    setError("");
    setMessage(
      `${provider} authentication is not configured yet. Please use email OTP.`,
    );
  };

  return (
    <div
      className={`flex flex-col justify-between min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] ${className}`}
    >
      {/* NAVBAR */}
      <nav className="w-full backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="w-full mx-auto grid grid-cols-[1fr_auto_1fr] items-center">
          {/* LOGO AND TITLE */}
          <div className="flex items-center gap-3 justify-start">
            <div className="flex h-12 w-12 items-center justify-center">
              <img
                src="/logo.svg"
                alt="Logo"
                className="w-9 h-9 object-contain"
              />
            </div>

            <div>
              <span className="font-heading text-xl font-light tracking-tight text-[var(--text-main)] block leading-none">
                Lens LM
              </span>

              <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-secondary)] font-medium">
                Retrieval Augmented Generation Model
              </span>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <div className="hidden sm:flex items-center gap-6 text-xs text-[var(--text-secondary)] justify-center">
            <a
              href="#docs"
              className="hover:text-[var(--google-blue)] transition-colors"
            >
              Documentation
            </a>

            <a
              href="#support"
              className="hover:text-[var(--google-blue)] transition-colors"
            >
              Support
            </a>

            <a
              href="#privacy"
              className="hover:text-[var(--google-blue)] transition-colors"
            >
              Privacy
            </a>
          </div>

          {/* STATUS BADGE */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-light)] text-[10px] font-medium text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--google-green)] animate-pulse" />
              <span>v2.4 Live</span>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-6xl min-h-[150px] overflow-hidden rounded-2xl border border-[var(--border-light)] border-t-[3px] border-t-[var(--google-blue)] bg-[var(--bg-main)] shadow-2xl backdrop-blur-xl">
          <div className="grid md:grid-cols-[0.8fr_1.2fr]">
            {/* LEFT COLUMN */}
            <div className="relative flex md:min-h-[500px] flex-col justify-between border-b border-[var(--border-light)] bg-[var(--bg-secondary)] p-7 sm:p-9 md:border-b-0 md:border-r">
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--google-blue)] shadow-sm">
                    <ShieldCheck size={14} />
                  </span>

                  <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-[var(--text-secondary)]">
                    Secure Gateway
                  </span>
                </div>

                <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[var(--google-blue)] font-semibold">
                  01 / Account Access
                </p>

                <h2 className="text-[var(--text-main)] font-heading text-3xl md:text-4xl mb-4 tracking-tight">
                  Lens LM.
                </h2>

                <p className="text-xs leading-relaxed text-[var(--text-secondary)] max-w-xs">
                  Access your intelligent visual workspace securely with
                  advanced end-to-end encryption and fast authentication
                  protocols.
                </p>
              </div>

              <div className="flex justify-center my-6">
                <Logo />
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border-light)]">
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                    <Sparkles
                      size={12}
                      className="text-[var(--google-yellow)]"
                    />
                    <span>Fast & Secure</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                    <Lock size={12} className="text-[var(--google-green)]" />
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>

              {/* DECORATIVE WATERMARK */}
              <span className="pointer-events-none absolute bottom-4 right-6 select-none opacity-5 text-[100px] font-bold leading-none text-[var(--text-main)]/[0.03]">
                01
              </span>
            </div>

            {/* RIGHT COLUMN */}
            <div className="p-7 sm:p-9 md:p-10 bg-[var(--bg-card)] flex flex-col justify-between">
              <div>
                {/* FORM HEADER */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-[var(--text-secondary)]">
                      {step === 1 ? "Sign In / Register" : "Security Check"}
                    </p>

                    <ArrowUpRight
                      size={14}
                      className="text-[var(--text-muted)]"
                    />
                  </div>

                  <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                    {step === 1
                      ? "Enter your email address to log in or create your account instantly using a secure OTP."
                      : `Enter the 6-digit verification code sent to ${email}.`}
                  </p>
                </div>

                {/* AUTHENTICATION FORM */}
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.form
                      key="step-1"
                      onSubmit={handleSendOTP}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-5"
                    >
                      {/* EMAIL INPUT */}
                      <div>
                        <label
                          htmlFor="user-email"
                          className="mb-2 block text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--text-secondary)]"
                        >
                          Email Address
                        </label>

                        <div className="group relative">
                          <Mail
                            size={14}
                            className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors duration-300 group-focus-within:text-[var(--google-blue)]"
                          />

                          <input
                            id="user-email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setError("");
                              setMessage("");
                            }}
                            placeholder="name@example.com"
                            autoComplete="email"
                            required
                            disabled={loading}
                            className="w-full border-b border-[var(--border-light)] bg-transparent py-3 pl-7 pr-2 text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-300 focus:border-[var(--google-blue)]"
                          />
                        </div>
                      </div>

                      {/* SEND OTP BUTTON */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative mt-1 flex w-full items-center justify-between overflow-hidden rounded-sm bg-gradient-to-r from-[var(--google-blue)] to-[#1a73e8] px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-md shadow-[var(--google-blue)]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--google-blue)]/30 hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {loading && (
                            <LoaderCircle size={14} className="animate-spin" />
                          )}

                          {loading ? "Sending OTP..." : "Continue with OTP"}
                        </span>

                        {!loading && (
                          <ArrowUpRight
                            size={15}
                            className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        )}

                        <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="step-2"
                      onSubmit={handleVerifyOTP}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      {/* OTP INPUT */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label
                            htmlFor="user-otp"
                            className="block text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--text-secondary)]"
                          >
                            Verification Code
                          </label>

                          <button
                            type="button"
                            onClick={handleChangeEmail}
                            disabled={loading}
                            className="text-[9px] uppercase tracking-[0.15em] text-[var(--google-blue)] hover:underline font-medium disabled:opacity-50"
                          >
                            Change Email
                          </button>
                        </div>

                        <div className="group relative">
                          <KeyRound
                            size={14}
                            className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors duration-300 group-focus-within:text-[var(--google-blue)]"
                          />

                          <input
                            id="user-otp"
                            name="otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {
                              setOtp(
                                e.target.value.replace(/\D/g, "").slice(0, 6),
                              );
                              setError("");
                              setMessage("");
                            }}
                            placeholder="••••••"
                            required
                            disabled={loading}
                            className="w-full border-b border-[var(--border-light)] bg-transparent py-3 pl-7 pr-2 text-sm tracking-widest font-mono text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] placeholder:font-sans placeholder:tracking-normal transition-all duration-300 focus:border-[var(--google-blue)]"
                          />
                        </div>
                      </div>

                      {/* VERIFY OTP BUTTON */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative mt-2 flex w-full items-center justify-between overflow-hidden rounded-sm bg-gradient-to-r from-[var(--google-blue)] to-[#1a73e8] px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-md shadow-[var(--google-blue)]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--google-blue)]/30 hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {loading && (
                            <LoaderCircle size={14} className="animate-spin" />
                          )}

                          {loading ? "Verifying..." : "Verify OTP"}
                        </span>

                        {!loading && (
                          <ArrowUpRight
                            size={15}
                            className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        )}

                        <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </button>

                      {/* RESEND OTP */}
                      <button
                        type="button"
                        onClick={() => handleSendOTP()}
                        disabled={loading}
                        className="w-full text-center text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:text-[var(--google-blue)] transition-colors disabled:opacity-50"
                      >
                        {loading ? "Please wait..." : "Resend OTP"}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* SUCCESS MESSAGE */}
                {message && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="mt-4 text-xs leading-relaxed text-[var(--google-green)]"
                  >
                    {message}
                  </p>
                )}

                {/* ERROR MESSAGE */}
                {error && (
                  <p
                    role="alert"
                    aria-live="assertive"
                    className="mt-4 text-xs leading-relaxed text-red-500"
                  >
                    {error}
                  </p>
                )}
              </div>

              {/* SOCIAL LOGIN AND CARD FOOTER */}
              <div className="space-y-4 pt-6">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[var(--border-light)]" />

                  <span className="flex-shrink mx-4 text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Or continue with
                  </span>

                  <div className="flex-grow border-t border-[var(--border-light)]" />
                </div>

                {/* SOCIAL LOGIN BUTTONS */}
                <div className="grid grid-cols-4 gap-2.5">
                  {/* GOOGLE */}
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Google")}
                    className="group flex items-center justify-center gap-2 rounded-sm border border-[var(--border-light)] bg-[var(--bg-secondary)] py-2.5 px-2 shadow-xs transition-all duration-300 hover:border-[var(--google-blue)] hover:bg-[var(--bg-main)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    title="Google"
                  >
                    <FcGoogle
                      size={16}
                      className="shrink-0 transition-transform duration-300 group-hover:scale-110"
                    />

                    <span className="text-[10px] font-medium text-[var(--text-main)] truncate">
                      Google
                    </span>
                  </button>

                  {/* APPLE */}
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Apple")}
                    className="group flex items-center justify-center gap-2 rounded-sm border border-[var(--border-light)] bg-[var(--bg-secondary)] py-2.5 px-2 shadow-xs transition-all duration-300 hover:border-[var(--text-main)] hover:bg-[var(--bg-main)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    title="Apple"
                  >
                    <FaApple
                      size={16}
                      className="shrink-0 text-[var(--text-main)] transition-transform duration-300 group-hover:scale-110"
                    />

                    <span className="text-[10px] font-medium text-[var(--text-main)] truncate">
                      Apple
                    </span>
                  </button>

                  {/* FACEBOOK */}
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Facebook")}
                    className="group flex items-center justify-center gap-2 rounded-sm border border-[var(--border-light)] bg-[var(--bg-secondary)] py-2.5 px-2 shadow-xs transition-all duration-300 hover:border-[#1877F2]/50 hover:bg-[var(--bg-main)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    title="Facebook"
                  >
                    <FaFacebook
                      size={16}
                      className="shrink-0 text-[#1877F2] transition-transform duration-300 group-hover:scale-110"
                    />

                    <span className="text-[10px] font-medium text-[var(--text-main)] truncate">
                      Facebook
                    </span>
                  </button>

                  {/* META */}
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Meta")}
                    className="group flex items-center justify-center gap-2 rounded-sm border border-[var(--border-light)] bg-[var(--bg-secondary)] py-2.5 px-2 shadow-xs transition-all duration-300 hover:border-[var(--google-blue)]/50 hover:bg-[var(--bg-main)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    title="Meta"
                  >
                    <FaMeta
                      size={16}
                      className="shrink-0 text-[#0081FB] transition-transform duration-300 group-hover:scale-110"
                    />

                    <span className="text-[10px] font-medium text-[var(--text-main)] truncate">
                      Meta
                    </span>
                  </button>
                </div>

                {/* SECURITY STATUS */}
                <div className="flex items-center justify-between border-t border-[var(--border-light)] pt-4">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                    Secure Authentication
                  </span>

                  <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--google-green)] animate-pulse" />

                    {loading ? "Processing" : "Ready"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full py-6 px-6 text-xs text-[var(--text-secondary)]">
        <div className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[var(--google-green)]" />

            <span>
              © {new Date().getFullYear()} Lens LM Inc. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <a
              href="#terms"
              className="hover:text-[var(--google-blue)] transition-colors"
            >
              Terms of Service
            </a>

            <a
              href="#privacy"
              className="hover:text-[var(--google-blue)] transition-colors"
            >
              Privacy Policy
            </a>

            <a
              href="#security"
              className="hover:text-[var(--google-blue)] transition-colors"
            >
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
