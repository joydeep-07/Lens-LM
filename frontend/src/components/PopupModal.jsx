import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const PopupModal = ({
  icon: Icon,
  title = "Modal",
  ariaLabel = "Open modal",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  const toggleModal = () => {
    if (isOpen) {
      // Trigger close animation
      setIsOpen(false);

      const tl = gsap.timeline({
        onComplete: () => {
          setShowModal(false); // Unmount after animation finishes
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
        "-=0.15", // Overlap slightly for a smoother fade out
      );
    } else {
      // Open modal and trigger entrance animation
      setShowModal(true);
      setIsOpen(true);
    }
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

      {showModal && (
        <div
          ref={backdropRef}
          onClick={toggleModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          style={{ opacity: 0 }} // Start at 0 to avoid a flash before GSAP kicks in
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
