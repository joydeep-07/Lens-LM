import nodemailer from "nodemailer";
import axios from "axios";

const isProduction = process.env.NODE_ENV === "production";

// Safe email masking for logs (e.g. jo***@gmail.com)
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
 * Sends transactional email (OTP) with automatic cascading fallback across:
 * 1. Resend HTTP REST API (Port 443 HTTPS)
 * 2. Brevo HTTP REST API (Port 443 HTTPS - sends to any domain on free plan)
 * 3. Nodemailer SMTP (Gmail or custom SMTP)
 *
 * If Strategy 1 fails (e.g. Resend's test domain restriction that only allows
 * sending to the account owner), it seamlessly cascades to Strategy 2 and Strategy 3
 * so that all valid email addresses (Gmail, Outlook, Yahoo) can receive OTPs.
 *
 * @param {object} options
 * @param {string} options.to - Recipient email address
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

  const attempts = [];

  // ============================================================
  // STRATEGY 1: Resend HTTP REST API (HTTPS Port 443)
  // ============================================================
  if (resendApiKey) {
    try {
      console.log(`[Email] Attempting Resend HTTP API for ${maskedTo}...`);
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
          timeout: 8000,
        },
      );

      console.log(`[Email] Successfully delivered via Resend to ${maskedTo} (ID: ${response.data?.id})`);
      return { provider: "resend", id: response.data?.id };
    } catch (err) {
      const errorDetail = err.response?.data?.message || err.message;
      const statusCode = err.response?.status;
      console.warn(`[Email] Resend delivery failed for ${maskedTo} [${statusCode || "ERR"}]: ${errorDetail}`);
      attempts.push({ provider: "resend", error: errorDetail, status: statusCode });
    }
  }

  // ============================================================
  // STRATEGY 2: Brevo HTTP REST API (HTTPS Port 443)
  // Free 300 emails/day to ANY domain without custom domain DNS
  // ============================================================
  if (brevoApiKey) {
    try {
      console.log(`[Email] Attempting Brevo HTTP API for ${maskedTo}...`);
      const senderEmail = (process.env.BREVO_SENDER_EMAIL || emailUser || process.env.EMAIL_FROM || "noreply@lenslm.com").trim();

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
          timeout: 8000,
        },
      );

      console.log(`[Email] Successfully delivered via Brevo to ${maskedTo} (ID: ${response.data?.messageId})`);
      return { provider: "brevo", id: response.data?.messageId };
    } catch (err) {
      const errorDetail = err.response?.data?.message || err.message;
      const statusCode = err.response?.status;
      console.warn(`[Email] Brevo delivery failed for ${maskedTo} [${statusCode || "ERR"}]: ${errorDetail}`);
      attempts.push({ provider: "brevo", error: errorDetail, status: statusCode });
    }
  }

  // ============================================================
  // STRATEGY 3: Nodemailer SMTP (Gmail or custom SMTP)
  // Sends to ANY domain without restrictions.
  // ============================================================
  if (emailUser && emailPass) {
    try {
      console.log(`[Email] Attempting Nodemailer SMTP for ${maskedTo}...`);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      });

      const info = await transporter.sendMail({
        from: `"Lens LM" <${emailUser}>`,
        to,
        subject,
        text,
        html,
      });

      console.log(`[Email] Successfully delivered via SMTP to ${maskedTo} (ID: ${info.messageId})`);
      return { provider: "smtp", id: info.messageId };
    } catch (err) {
      const isTimeout =
        err.code === "ETIMEDOUT" ||
        err.code === "ECONNECTION" ||
        err.message?.toLowerCase().includes("timeout") ||
        err.message?.toLowerCase().includes("connect");

      const errorDetail = isTimeout
        ? `SMTP connection timed out (${err.code || "ETIMEDOUT"}). Host may block outbound ports 25, 465, 587.`
        : err.message;

      console.warn(`[Email] SMTP delivery failed for ${maskedTo}: ${errorDetail}`);
      attempts.push({ provider: "smtp", error: errorDetail, code: err.code });
    }
  }

  // If no providers are configured at all
  if (attempts.length === 0) {
    const error = new Error(
      "No email service configured. Please provide RESEND_API_KEY, BREVO_API_KEY, or EMAIL_USER and EMAIL_PASS.",
    );
    error.userFacingMessage = "Email delivery service is not configured. Please contact the administrator.";
    throw error;
  }

  // Format detailed diagnostic message
  const failureDetails = attempts.map((a) => `${a.provider.toUpperCase()}: ${a.error}`).join(" | ");

  const resendTestRestriction = attempts.find(
    (a) => a.provider === "resend" && /testing emails to your own email address/i.test(a.error),
  );

  let guidance = "";
  if (resendTestRestriction) {
    guidance =
      " Resend's test domain (onboarding@resend.dev) only delivers to the account owner. To send OTPs to any email address (Gmail, Outlook, Yahoo), please verify a custom domain at https://resend.com/domains or configure BREVO_API_KEY in Render.";
  }

  const finalError = new Error(`Email delivery failed. ${failureDetails}.${guidance}`);
  finalError.attempts = attempts;
  finalError.isResendTestDomainRestriction = Boolean(resendTestRestriction);
  finalError.userFacingMessage = resendTestRestriction
    ? "Email delivery failed: Resend's testing domain (onboarding@resend.dev) only permits sending to joydeeprnp8821@gmail.com. To allow all email addresses (Gmail, Outlook, Yahoo), please verify a domain in the Resend dashboard or add BREVO_API_KEY in Render."
    : `Email delivery failed: ${failureDetails}`;

  throw finalError;
};
