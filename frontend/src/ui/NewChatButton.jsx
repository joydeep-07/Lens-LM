// src/ui/NewChatButton.jsx
import { CircleFadingPlus } from "lucide-react";
import React from "react";

const NewChatButton = ({
  onClick,
  showName = true,
  hideNameOnLaptop = false,
}) => {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onClick}
        title="New chat"
        aria-label="New chat"
        className="w-full rounded-lg p-2.5 text-[var(--text-secondary)] flex items-center justify-start md:justify-center gap-2 hover:text-[var(--text-main)] transition-colors hover:bg-[var(--bg-card)]"
      >
        <CircleFadingPlus size={16} strokeWidth={1.8} className="shrink-0" />
        {showName && (
          <span
            className={`text-sm font-medium ${
              hideNameOnLaptop ? "lg:hidden" : "hidden lg:inline"
            }`}
          >
            New Chat
          </span>
        )}
      </button>
    </div>
  );
};

export default NewChatButton;
