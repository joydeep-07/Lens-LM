// src/components/PopupModal.jsx
import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const PopupModal = ({
  icon: Icon,
  title = "Modal",
  ariaLabel = "Open modal",
  showName = false,
  hideNameOnLaptop = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  const closeModal = () => {
    if (!isOpen) return;
    setIsOpen(false);

    const tl = gsap.timeline({
      onComplete: () => {
        setShowModal(false);
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
      "-=0.15",
    );
  };

  const toggleModal = () => {
    if (isOpen) {
      closeModal();
    } else {
      setShowModal(true);
      setIsOpen(true);
    }
  };

  // Listen for external close modal events
  useEffect(() => {
    const handleExternalClose = () => {
      if (isOpen) {
        closeModal();
      }
    };

    window.addEventListener("close-popup-modal", handleExternalClose);
    return () => {
      window.removeEventListener("close-popup-modal", handleExternalClose);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
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

  return (
    <>
      <div className="w-full">
        <button
          type="button"
          onClick={toggleModal}
          title={title}
          aria-label={ariaLabel}
          className="w-full p-2.5 rounded-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors flex items-center justify-start md:justify-center gap-2"
        >
          {Icon && <Icon size={16} className="shrink-0" />}
          {showName && (
            <span
              className={`text-sm font-medium ${
                hideNameOnLaptop ? "lg:hidden" : "hidden lg:inline"
              }`}
            >
              {title}
            </span>
          )}
        </button>
      </div>

      {showModal && (
        <div
          ref={backdropRef}
          onClick={toggleModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          style={{ opacity: 0 }}
        >
          <div ref={modalRef} onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default PopupModal;
