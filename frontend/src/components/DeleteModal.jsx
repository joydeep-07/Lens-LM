import React, { useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import gsap from "gsap";

export default function DeleteModal({ isOpen, onCancel, onConfirm }) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Entrance animation - matching PopupModal
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power1.out" },
      );
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.97, y: 4 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power2.out" },
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    // Exit animation - matching PopupModal
    const tl = gsap.timeline({
      onComplete: () => {
        onCancel(); // Trigger parent close state after animation
      },
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
      "-=0.15", // Overlap slightly
    );
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      style={{ opacity: 0 }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center bg-[var(--bg-main)] shadow-md rounded-sm py-6 px-5 md:w-[460px] w-[370px] border border-[var(--border-light)]/40"
      >
        <div className="flex items-center justify-center p-4 bg-red-500/10 border border-red-500/20 rounded-full">
          <Trash2 className="text-red-500" size={21} />
        </div>

        <h2 className="text-[var(--text-main)] font-semibold tracking-wide mt-4 text-md">
          Do you want to delete ?
        </h2>

        <p className="text-xs text-[var(--text-secondary)]/70 mt-2 text-center">
          Are you sure you want to delete this item?
          <br />
          This action cannot be undone.
        </p>

        <div className="flex items-center justify-center gap-4 mt-5 w-full">
          <button
            onClick={handleClose}
            className="w-full cursor-pointer md:w-36 h-10 rounded-sm border border-[var(--border-light)] bg-[var(--text-main)] text-[var(--bg-main)] font-medium text-sm"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            className="w-full cursor-pointer md:w-36 h-10 rounded-sm text-white bg-red-500 font-medium text-sm hover:bg-red-600 transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
