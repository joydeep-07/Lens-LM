import React, { useState, useEffect, useRef } from "react";
import { Activity, CheckCircle2, AlertCircle, X } from "lucide-react";
import gsap from "gsap";
import api from "../api/axios";
import endpoints from "../api/endpoints";

const VERSION = "V2.0";

const StatusBadge = () => {
  const [isHealthy, setIsHealthy] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
   const checkHealth = async () => {
     try {
       const response = await api.get(endpoints.health);

       setIsHealthy(
         response.status >= 200 &&
           response.status < 300 &&
           response.data?.success !== false,
       );
     } catch (error) {
       console.error("Health check failed:", {
         message: error.message,
         url: error.config?.baseURL
           ? `${error.config.baseURL}${error.config.url || ""}`
           : error.config?.url,
         status: error.response?.status,
         data: error.response?.data,
       });

       setIsHealthy(false);
     }
   };

    checkHealth();

    // Optional: Periodically check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle ESC key and scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Animate popup entrance
  useEffect(() => {
    if (!isOpen) return;

    const ctx = gsap.context(() => {
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
    });

    return () => ctx.revert();
  }, [isOpen]);

  // Animate popup exit
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

  // Determine badge styling based on health status
  const getBadgeConfig = () => {
    if (isHealthy === null) {
      return {
        dotColor: "bg-[var(--google-yellow)]",
        text: "Checking...",
        pulse: "animate-pulse",
      };
    }
    if (isHealthy) {
      return {
        dotColor: "bg-[var(--google-green)]",
        text: `${VERSION} Live`,
        pulse: "animate-pulse",
      };
    }
    return {
      dotColor: "bg-[var(--google-red)]",
      text: `${VERSION} Offline`,
      pulse: "animate-pulse",
    };
  };

  const { dotColor, text, pulse } = getBadgeConfig();

  return (
    <>
      <div>
        <div className="flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="View system status details"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)]/50 border border-[var(--border-light)]/50 text-[10px] font-medium text-[var(--text-secondary)] hover:border-[var(--border-light)] transition-colors cursor-pointer"
          >
            <span className={`h-2 w-2 rounded-full ${dotColor} ${pulse}`} />
            <span className="tracking-wider font-medium">{text}</span>
          </button>
        </div>
      </div>

      {/* Status details popup */}
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
            aria-labelledby="status-modal-title"
            className="relative flex w-[370px] flex-col items-center rounded-sm border border-[var(--border-light)]/40 bg-[var(--bg-main)] px-5 py-6 shadow-md md:w-[460px]"
          >
            {/* Status icon */}
            <div
              className={`flex items-center justify-center rounded-full border p-4 ${
                isHealthy === null
                  ? "border-[var(--google-yellow)]/20 bg-[var(--google-yellow)]/10"
                  : "border-[var(--border-light)]/20 bg-[var(--bg-card)]/40"
              }`}
            >
              {isHealthy === null ? (
                <Activity
                  className="text-[var(--google-yellow)] animate-pulse"
                  size={22}
                />
              ) : isHealthy ? (
                <CheckCircle2
                  className="text-[var(--google-green)]"
                  size={22}
                />
              ) : (
                <AlertCircle className="text-[var(--google-red)]" size={22} />
              )}
            </div>

            {/* Status title */}
            <h2
              id="status-modal-title"
              className="mt-4 text-center font-heading text-lg font-medi tracking-wider text-[var(--text-main)]"
            >
              {isHealthy === null
                ? "Checking system status..."
                : isHealthy
                  ? `Version ${VERSION} is fully operational`
                  : `Version ${VERSION} is experiencing issues`}
            </h2>

            {/* Status description */}
            <p className="mt-2 text-center text-xs leading-relaxed text-[var(--text-secondary)]/80">
              {isHealthy === null
                ? "Connecting to the server to verify the current application health status. Please wait a moment."
                : isHealthy
                  ? "All backend endpoints and services are responding normally. You are running the latest stable release."
                  : "Unable to reach the health check endpoint or services are down. Some features may not function correctly."}
            </p>

            {/* Status indicator footer */}
            <div className="mt-5 flex w-full items-center justify-between border-t border-[var(--border-light)]/40 pt-4">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isHealthy === null
                      ? "bg-[var(--google-yellow)]"
                      : isHealthy
                        ? "bg-[var(--google-green)]"
                        : "bg-[var(--google-red)]"
                  }`}
                />

                <span className="text-xs text-[var(--text-secondary)]">
                  {isHealthy === null
                    ? "Checking"
                    : isHealthy
                      ? "Operational"
                      : "Offline / Error"}
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
};

export default StatusBadge;
