import { CircleFadingPlus } from "lucide-react";
import React from "react";

const NewChatButton = ({ onClick }) => {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        title="New chat"
        aria-label="New chat"
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors hover:bg-[var(--bg-secondary)]"
      >
        <CircleFadingPlus size={19} strokeWidth={1.8} />
      </button>
    </div>
  );
};

export default NewChatButton;
