import nodemailer from "nodemailer";

// Safe email masking for logs (e.g. me*********@gmail.com)
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
 * Creates and verifies a Nodemailer transporter.
 * Supports port 465 (SSL) with automatic fallback to port 587 (TLS).
 */
const createTransporter = (port = 465, secure = true) => {
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port,
    secure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

/**
 * Sends transactional email (OTP) using Nodemailer.
 * Delivers directly to any valid email address (Gmail, Outlook, Yahoo, etc.).
 *
 * @param {object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<{ provider: string, id: string }>}
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
  const maskedTo = maskEmail(to);

  if (!emailUser || !emailPass) {
    const error = new Error(
      "Nodemailer is not configured. Please ensure EMAIL_USER and EMAIL_PASS are set in environment variables.",
    );
    error.userFacingMessage =
      "Email service credentials missing. Please check server configuration.";
    throw error;
  }

  console.log(`[Email] Sending OTP via Nodemailer (Gmail SMTP) to ${maskedTo}...`);

  // Attempt 1: Port 465 (SMTPS SSL)
  try {
    const transporter465 = createTransporter(465, true);

    const info = await transporter465.sendMail({
      from: `"Lens LM" <${emailUser}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(
      `[Email] Successfully delivered via Nodemailer (Port 465) to ${maskedTo} (Message ID: ${info.messageId})`,
    );

    return { provider: "nodemailer", id: info.messageId, port: 465 };
  } catch (err465) {
    console.warn(
      `[Email] Nodemailer Port 465 failed for ${maskedTo}: ${err465.message}. Retrying via Port 587...`,
    );

    // Attempt 2: Port 587 (STARTTLS)
    try {
      const transporter587 = createTransporter(587, false);

      const info = await transporter587.sendMail({
        from: `"Lens LM" <${emailUser}>`,
        to,
        subject,
        text,
        html,
      });

      console.log(
        `[Email] Successfully delivered via Nodemailer (Port 587) to ${maskedTo} (Message ID: ${info.messageId})`,
      );

      return { provider: "nodemailer", id: info.messageId, port: 587 };
    } catch (err587) {
      console.error(
        `[Email] Nodemailer delivery failed for ${maskedTo} on both ports 465 and 587:`,
        err587.message,
      );

      const isTimeout =
        err587.code === "ETIMEDOUT" ||
        err587.code === "ECONNECTION" ||
        err465.code === "ETIMEDOUT" ||
        err465.code === "ECONNECTION" ||
        err587.message?.toLowerCase().includes("timeout") ||
        err465.message?.toLowerCase().includes("timeout");

      const finalError = new Error(
        isTimeout
          ? `SMTP connection timed out on ports 465 and 587. Outbound SMTP may be blocked by your hosting provider's firewall.`
          : `Nodemailer delivery failed: ${err587.message}`,
      );

      finalError.code = err587.code || err465.code;
      finalError.userFacingMessage = isTimeout
        ? "Email delivery timed out. Your hosting platform (Render Free Tier) blocks outbound SMTP ports 25, 465, and 587."
        : `Email delivery failed: ${err587.message}`;

      throw finalError;
    }
  }
};
