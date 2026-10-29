import nodemailer from "nodemailer";
import axios from "axios";

const isProduction = process.env.NODE_ENV === "production";

// Safe email masking for logs
export const maskEmail = (email) => {
  if (!email || typeof email !== "string") return "***";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal =
    local.length <= 2
      ? local[0] + "*"
      : local.slice(0, 2) + "*".repeat(Math.max(1, local.length - 2));
  return `${maskedLocal}@${domain}`;
};

/**
 * Sends transactional email (OTP) supporting both:
 * 1. HTTP-based APIs (Resend, Brevo) over HTTPS port 443 — REQUIRED on Render Free Tier
 *    because Render blocks standard outbound SMTP ports (25, 465, 587).
 * 2. Nodemailer SMTP (Gmail or custom SMTP) for local development or unblocked hosts.
 *
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<{ provider: string, id: string }>}
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const maskedTo = maskEmail(to);
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const brevoApiKey = process.env.BREVO_API_KEY?.trim();
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  // ============================================================
  // STRATEGY 1: Resend HTTP REST API (HTTPS Port 443)
  // Recommended on Render Free Tier — standard HTTPS is never blocked.
  // ============================================================
  if (resendApiKey) {
    try {
      console.log(`[Email] Delivering via Resend HTTP API to ${maskedTo}...`);
      const from = process.env.EMAIL_FROM?.trim() || "Lens LM <onboarding@resend.dev>";

      const response = await axios.post(
        "https://api.resend.com/emails",
        {
          from,
          to: [to],
          subject,
          text,
          html,
        },
        {
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      console.log(`[Email] Successfully delivered via Resend to ${maskedTo} (ID: ${response.data?.id})`);
      return { provider: "resend", id: response.data?.id };
    } catch (err) {
      const errorDetail = err.response?.data?.message || err.message;
      console.error(`[Email] Resend delivery failed for ${maskedTo}:`, errorDetail);
      throw new Error(`Email provider error: ${errorDetail}`);
    }
  }

  // ============================================================
  // STRATEGY 2: Brevo HTTP REST API (HTTPS Port 443)
  // Alternative HTTP option (free 300 emails/day, no port blocks).
  // ============================================================
  if (brevoApiKey) {
    try {
      console.log(`[Email] Delivering via Brevo HTTP API to ${maskedTo}...`);
      const senderEmail = emailUser || process.env.EMAIL_FROM || "noreply@lenslm.com";

      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "Lens LM", email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        },
        {
          headers: {
            "api-key": brevoApiKey,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      console.log(`[Email] Successfully delivered via Brevo to ${maskedTo}`);
      return { provider: "brevo", id: response.data?.messageId };
    } catch (err) {
      const errorDetail = err.response?.data?.message || err.message;
      console.error(`[Email] Brevo delivery failed for ${maskedTo}:`, errorDetail);
      throw new Error(`Email provider error: ${errorDetail}`);
    }
  }

  // ============================================================
  // STRATEGY 3: Nodemailer SMTP (Gmail or custom SMTP)
  // Default for local development or paid cloud instances where SMTP is open.
  // ============================================================
  if (!emailUser || !emailPass) {
    throw new Error(
      "No email service configured. Set EMAIL_USER and EMAIL_PASS (or RESEND_API_KEY / BREVO_API_KEY) in environment variables.",
    );
  }

  try {
    console.log(`[Email] Delivering via SMTP to ${maskedTo}...`);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const info = await transporter.sendMail({
      from: `"Lens LM" <${emailUser}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[Email] Successfully delivered via SMTP to ${maskedTo}`);
    return { provider: "smtp", id: info.messageId };
  } catch (err) {
    // Detect Render Free Tier SMTP port blocking (connection timeout)
    const isTimeout =
      err.code === "ETIMEDOUT" ||
      err.code === "ECONNECTION" ||
      err.message?.includes("timeout");

    if (isTimeout && isProduction) {
      console.error(
        `[Email] CRITICAL: SMTP connection timed out while sending to ${maskedTo}. ` +
        `Render's Free Tier blocks standard SMTP ports (25, 465, 587). ` +
        `To resolve this on Render Free Tier, add a RESEND_API_KEY (from https://resend.com) ` +
        `to your Render environment variables to send via HTTPS (port 443).`,
      );
    } else {
      console.error(
        `[Email] SMTP delivery failed for ${maskedTo}:`,
        err.code ? `[${err.code}] ${err.message}` : err.message,
      );
    }

    throw err;
  }
};
