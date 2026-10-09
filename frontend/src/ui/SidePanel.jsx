import React from "react";
import {
  Plus,
  MessageSquare,
  History,
  Star,
  User,
  Settings,
  Sun,
  CircleFadingPlus,
} from "lucide-react";

const SidePanel = () => {
  return (
    <div className="w-12 h-full border-r border-[var(--border-light)] flex flex-col justify-between items-center py-4">
      {/* Top Section: New Chat & Main Navigation */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        {/* New Chat Button */}
        <button
          type="button"
          title="New chat"
          aria-label="New chat"
          className="rounded-lg p-2 text-[var(--text-secondary)] hover:text-[var(--text-main)]"
        >
          <CircleFadingPlus size={19} strokeWidth={1.8} />
        </button>

        <div className="w-8 h-[1px] bg-[var(--border-light)] my-1" />

        {/* Chat List / History Shortcuts */}
        <div className="flex flex-col gap-2 w-full items-center">
          <button
            title="Current Chat"
            className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors"
          >
            <MessageSquare size={16} />
          </button>
          <button
            title="Chat History"
            className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors"
          >
            <History size={16} />
          </button>
          <button
            title="Starred"
            className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors"
          >
            <Star size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Section: Theme, Settings, Profile */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <button
          title="Theme"
          className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors"
        >
          <Sun size={16} />
        </button>
        <button
          title="Settings"
          className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors"
        >
          <Settings size={16} />
        </button>
        <button
          title="Profile"
          className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors"
        >
          <User size={16} />
        </button>
      </div>
    </div>
  );
};

export default SidePanel;
