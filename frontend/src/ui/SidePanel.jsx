import React from "react";
import {
  MessageSquare,
  Star,
  User,
  Settings,
  CircleFadingPlus,
  HistoryIcon,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import PopupModal from "../components/PopupModal";
import ChatHistory from "./ChatHistory";
import StarredChats from "./StarredChats";
import Settings69 from "./Settings";
import Profile from "./Profile";
const SidePanel = () => {
  return (
    <div className="w-12 h-full flex flex-col justify-between items-center py-4">
      {/* Top Section: New Chat & Main Navigation */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        {/* New Chat Button */}
        <button
          type="button"
          title="New chat"
          aria-label="New chat"
          className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors"
        >
          <CircleFadingPlus size={19} strokeWidth={1.8} />
        </button>

        <div className="w-8 h-[1px] bg-[var(--border-light)] my-1" />

        {/* Chat List / History Shortcuts */}
        <div className="flex flex-col gap-2 w-full items-center">
          <button
            type="button"
            title="Current Chat"
            aria-label="Current Chat"
            className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors"
          >
            <MessageSquare size={16} />
          </button>

          {/* Reusable Popup for Chat History */}
          <PopupModal
            icon={HistoryIcon}
            title="Chat History"
            ariaLabel="Chat History"
          >
            <ChatHistory />
          </PopupModal>

          {/* Reusable Popup for Starred (pass any other content component here) */}
          <PopupModal icon={Star} title="Starred" ariaLabel="Starred">
            <StarredChats />
          </PopupModal>
        </div>
      </div>

      {/* Bottom Section: Theme, Settings, Profile */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <ThemeToggle />

        {/* Reusable Popup for Settings */}
        <PopupModal icon={Settings} title="Settings" ariaLabel="Settings">
          <Settings69 />
        </PopupModal>

        {/* Reusable Popup for Profile */}
        <PopupModal icon={User} title="Profile" ariaLabel="Profile">
         <Profile/>
        </PopupModal>
      </div>
    </div>
  );
};

export default SidePanel;
