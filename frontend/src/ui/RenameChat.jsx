import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Edit3, LoaderCircle } from "lucide-react";
import gsap from "gsap";
import api from "../api/axios";
import endpoints from "../api/endpoints";

export default function RenameChat({
  chatId,
  currentTitle = "",
  onChatRenamed,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);

  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

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
    if (!modalRef.current || !backdropRef.current) {
      setIsOpen(false);
      return;
    }

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

  const handleSave = async () => {
    if (!title.trim() || loading) return;

    try {
      setLoading(true);
      const response = await api.patch(endpoints.renameChat(chatId), {
        title: title.trim(),
      });

      if (response.data.success) {
        if (typeof onChatRenamed === "function") {
          onChatRenamed(chatId, title.trim());
        }
        handleClose();
      }
    } catch (error) {
      console.error("Failed to rename chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Rename button trigger */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setTitle(currentTitle);
          setIsOpen(true);
        }}
        aria-label="Rename conversation"
        title="Rename conversation"
        className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors hover:bg-[var(--bg-secondary)]"
      >
        <Edit3 size={13} strokeWidth={1.8} />
      </button>

      {/* Rename popup modal rendered via Portal */}
      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={backdropRef}
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
            style={{ opacity: 0 }}
          >
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="rename-modal-title"
              className="relative flex w-[370px] flex-col items-center rounded-sm border border-[var(--border-light)]/40 bg-[var(--bg-main)] px-5 py-6 shadow-2xl md:w-[460px]"
            >
              <div className="flex items-center justify-center rounded-full border border-[var(--border-light)]/40 bg-[var(--bg-card)]/40 p-4">
                <Edit3 className="text-[var(--google-blue)]" size={22} />
              </div>

              <h2
                id="rename-modal-title"
                className="mt-4 text-center text-md font-semibold tracking-wide text-[var(--text-main)]"
              >
                Rename Conversation
              </h2>

              <p className="mt-2 text-center text-xs leading-relaxed text-[var(--text-secondary)]/80">
                Enter a new title for your conversation below.
              </p>

              <div className="mt-4 w-full">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Conversation title..."
                  autoFocus
                  disabled={loading}
                  className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-light)]/40 rounded-sm px-3 py-2.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--google-blue)]/40 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="mt-5 flex w-full items-center justify-between border-t border-[var(--border-light)]/40 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="h-9 rounded-sm border border-[var(--border-light)]/40 px-4 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || !title.trim()}
                  className="h-9 rounded-sm bg-[var(--text-main)] px-5 text-xs font-medium text-[var(--bg-main)] transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading && (
                    <LoaderCircle size={13} className="animate-spin" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
