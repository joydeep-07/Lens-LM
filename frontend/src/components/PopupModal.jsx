import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const PopupModal = ({
  icon: Icon,
  title = "Modal",
  ariaLabel = "Open modal",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      // Subtle minimal entrance animation
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
      <div>
        <button
          type="button"
          onClick={toggleModal}
          title={title}
          aria-label={ariaLabel}
          className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors"
        >
          {Icon && <Icon size={16} />}
        </button>
      </div>

      {isOpen && (
        <div
          ref={backdropRef}
          onClick={toggleModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
        >
          {/* Stop propagation so clicking inside the modal doesn't close it */}
          <div ref={modalRef} onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default PopupModal;
