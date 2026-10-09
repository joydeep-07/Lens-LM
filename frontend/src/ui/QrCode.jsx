import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Coffee } from "lucide-react";

const QrCode = ({ onClose }) => {
  const upiId = "joydeeprnp8821@okicici";
  const payeeName = "Joydeep";

  const [copied, setCopied] = useState(false);

  const upiString = `upi://pay?pa=${encodeURIComponent(
    upiId,
  )}&pn=${encodeURIComponent(payeeName)}&cu=INR`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = upiId;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.select();

      const success = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (!success) return;
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = () => {
    window.location.href = upiString;
  };

  return (
    <div
      className="relative mx-auto flex h-150 w-2xl flex-col items-center overflow-hidden rounded-xl border border-[var(--border-light)] px-8 text-[var(--text-main)] shadow-2xl transition-colors duration-500"
      style={{
        backgroundColor: "var(--bg-card)",
        // Slightly increased radial gradient opacity for a soft, balanced glow
        backgroundImage: `
          radial-gradient(circle at 15% 15%, color-mix(in srgb, var(--google-red) 10%, transparent) 0%, transparent 50%),
          radial-gradient(circle at 85% 85%, color-mix(in srgb, var(--google-green) 10%, transparent) 0%, transparent 50%),
          radial-gradient(circle at 85% 15%, color-mix(in srgb, var(--google-yellow) 5%, transparent) 0%, transparent 40%),
          radial-gradient(circle at 15% 85%, color-mix(in srgb, var(--google-blue) 5%, transparent) 0%, transparent 40%),
          linear-gradient(145deg, var(--bg-card) 0%, var(--bg-secondary) 100%)
        `,
      }}
    >
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close payment dialog"
          className="absolute right-7 top-7 flex h-8 w-8 items-center justify-center text-[var(--text-secondary)] transition hover:text-[var(--google-red)]"
        >
          <X size={20} strokeWidth={2} />
        </button>
      )}

      {/* Heading */}
      <div className="mt-10 w-full max-w-lg text-center">
        <h2 className="flex items-center justify-center gap-4 text-sm font-bold uppercase tracking-[0.22em] text-[var(--text-main)]">
          Buy me a Chai{" "}
          <span>
            {/* Coffee icon uses green accent */}
            <Coffee
              size={18}
              className="text-[var(--google-green)]"
              strokeWidth={2.5}
            />
          </span>
        </h2>

        <p className="mx-auto text-xs mt-4 max-w-sm leading-[1.8] text-[var(--text-secondary)]">
          If this AI chatbot made your day a little easier, you know what to do.
          One cup of chai keeps the ideas flowing and the code adda!
        </p>
      </div>

      {/* QR Code */}
      <div className="mt-7 flex items-center justify-center rounded-[22px] border border-[var(--border-light)] bg-[var(--bg-secondary)] p-4 shadow-xl">
        <QRCodeSVG
          value={upiString}
          size={248}
          level="H"
          marginSize={2}
          bgColor="transparent"
          // QR code itself takes on main text color, defined by theme
          fgColor="currentColor"
          title="Scan to pay Joydeep using UPI"
          className="block h-auto w-full max-w-[248px] text-[var(--text-main)]"
        />
      </div>

      {/* Scan Instruction */}
      <p className="mt-4 text-xs font-medium tracking-wide text-[var(--text-muted)]">
        Scan with any UPI app
      </p>

      {/* UPI ID Copy Pill */}
      <div className="mt-5 flex max-w-full items-center gap-3 rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)] py-1.5 pl-5 pr-2 shadow-inner">
        <span className="max-w-[220px] truncate text-sm font-medium text-[var(--text-main)]">
          {upiId}
        </span>

        <button
          onClick={handleCopy}
          aria-label={copied ? "UPI ID copied" : "Copy UPI ID"}
          // Button hover states now utilize red and green accents
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2 text-[10px] font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--google-green)] hover:text-[var(--google-green)] active:scale-95"
        >
          {copied ? (
            <>
              <Check
                size={12}
                className="text-[var(--google-green)]"
                strokeWidth={3}
              />
              COPIED
            </>
          ) : (
            <>
              <Copy size={12} />
              COPY
            </>
          )}
        </button>
      </div>

      {/* Direct UPI Payment */}
      <button
        onClick={handlePay}
        // Text link hover uses red accent
        className="mt-4 rounded-full px-5 py-2 text-xs text-[var(--text-muted)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--google-red)]"
      >
        Open UPI app ↗
      </button>
    </div>
  );
};

export default QrCode;
