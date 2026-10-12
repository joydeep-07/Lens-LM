
import React, { useEffect, useRef, useState } from "react";
import { WifiIcon, WifiLow, WifiOff, X } from "lucide-react";
import gsap from "gsap";

export default function Wifi() {
  const [isOpen, setIsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("online");

  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  // Detect network status.
  useEffect(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const checkConnection = () => {
      if (!navigator.onLine) {
        setConnectionStatus("offline");
        return;
      }

      if (connection) {
        const { effectiveType, downlink, rtt } = connection;

        if (
          effectiveType === "slow-2g" ||
          effectiveType === "2g" ||
          (downlink !== undefined && downlink < 0.15) ||
          (rtt !== undefined && rtt > 2000)
        ) {
          setConnectionStatus("slow");
          return;
        }
      }

      setConnectionStatus("online");
    };

    checkConnection();

    window.addEventListener("online", checkConnection);
    window.addEventListener("offline", checkConnection);
    connection?.addEventListener("change", checkConnection);

    return () => {
      window.removeEventListener("online", checkConnection);
      window.removeEventListener("offline", checkConnection);
      connection?.removeEventListener("change", checkConnection);
    };
  }, []);

  // Animate popup entrance.
  useEffect(() => {
    if (!isOpen) return;

    gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: "power1.out" },
    );

    gsap.fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.97, y: 4 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
      },
    );
  }, [isOpen]);

  // Animate popup exit.
  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: () => setIsOpen(false),
    });

    tl.to(modalRef.current, {
      opacity: 0,
      scale: 0.97,
      y: 4,
      duration: 0.2,
      ease: "power2.in",
    }).to(
      backdropRef.current,
      {
        opacity: 0,
        duration: 0.15,
        ease: "power1.in",
      },
      "-=0.15",
    );
  };

  const isOffline = connectionStatus === "offline";
  const isSlow = connectionStatus === "slow";

  return (
    <>
      {/* Wi-Fi button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Check internet connection"
        title="Internet connection"
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors hover:bg-[var(--bg-secondary)]"
      >
        {isOffline ? (
          <WifiOff size={19} strokeWidth={1.8} />
        ) : isSlow ? (
          <WifiLow size={19} strokeWidth={1.8} />
        ) : (
          <WifiIcon size={19} strokeWidth={1.8} />
        )}
      </button>

      {/* Connection status popup */}
      {isOpen && (
        <div
          ref={backdropRef}
          onClick={handleClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          style={{ opacity: 0 }}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wifi-modal-title"
            className="relative flex w-[370px] flex-col items-center rounded-sm border border-[var(--border-light)]/40 bg-[var(--bg-main)] px-5 py-6 shadow-md md:w-[460px]"
          >
            {/* Close button */}
            {/* <button
              type="button"
              onClick={handleClose}
              aria-label="Close popup"
              className="absolute right-3 top-3 rounded-sm p-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
            >
              <X size={17} strokeWidth={1.8} />
            </button> */}

            {/* Status icon */}
            <div
              className={`flex items-center justify-center rounded-full border p-4 ${
                isOffline
                  ? "border-red-500/20 bg-red-500/10"
                  : isSlow
                    ? "border-[var(--google-yellow)]/20 bg-[var(--google-yellow)]/10"
                    : "border-[var(--google-green)]/20 bg-[var(--google-green)]/10"
              }`}
            >
              {isOffline ? (
                <WifiOff className="text-red-500" size={22} />
              ) : isSlow ? (
                <WifiLow className="text-[var(--google-yellow)]" size={22} />
              ) : (
                <WifiIcon className="text-[var(--google-green)]" size={22} />
              )}
            </div>

            {/* Status title */}
            <h2
              id="wifi-modal-title"
              className="mt-4 text-center text-md font-semibold tracking-wide text-[var(--text-main)]"
            >
              {isOffline
                ? "You are offline"
                : isSlow
                  ? "Poor internet connection"
                  : "Internet connection is stable"}
            </h2>

            {/* Status description */}
            <p className="mt-2 text-center text-xs leading-relaxed text-[var(--text-secondary)]/80">
              {isOffline
                ? "Your device appears to be disconnected from the internet. Check your Wi-Fi or mobile data connection and try again."
                : isSlow
                  ? "Your internet connection is slower than expected. Some features may take longer to load or respond."
                  : "Your device appears to be connected to the internet. You can continue using the application normally."}
            </p>

            {/* Status indicator */}
            <div className="mt-5 flex w-full items-center justify-between border-t border-[var(--border-light)]/40 pt-4">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isOffline
                      ? "bg-red-500"
                      : isSlow
                        ? "bg-[var(--google-yellow)]"
                        : "bg-[var(--google-green)]"
                  }`}
                />

                <span className="text-xs text-[var(--text-secondary)]">
                  {isOffline
                    ? "Disconnected"
                    : isSlow
                      ? "Unstable connection"
                      : "Connected"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="h-9 rounded-sm bg-[var(--text-main)] px-5 text-sm font-medium text-[var(--bg-main)] transition-opacity hover:opacity-80"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

