import React, { useState } from "react";
import {
  CircleFadingPlus,
  Mic,
  Paperclip,
  ArrowUp,
  EllipsisVertical,
} from "lucide-react";

import Source from "./Source";
import EmptyChat from "./EmptyChat";
import SidePanel from "./SidePanel";

const ChatBot = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    console.log("Message:", message);

    setMessage("");
  };

  return (
    <div className="flex gap-[4px] h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]">
      {/* Left Panel */}
      <div className="flex w-6/10 flex-col justify-between rounded-xl border-r border-[var(--border-light)]/50 gap-2 p-2">
        {/* Navbar */}
        <nav className="flex items-center justify-between rounded-xl px-3 py-2">
          <div className="flex gap-3 items-center">
            <img src="./logo.svg" className="h-8" alt="" />
            <h1 className="text-2xl font-light tracking-tight font-heading">
              Lens LM.
            </h1>
          </div>
          <button
            type="button"
            title="New chat"
            aria-label="New chat"
            className="rounded-lg p-2 text-[var(--text-secondary)] hover:text-[var(--text-main)]"
          >
            <CircleFadingPlus size={19} strokeWidth={1.8} />
          </button>
        </nav>

        <div className="flex h-full gap-2 w-full">
          {/* Side Navigation Panel */}
          <SidePanel />

          {/* Main Chat Area */}
          <div className="flex flex-1 flex-col h-full">
            {/* Chat Messages / Empty State Area */}
            <div className="flex-1 overflow-y-auto pb-2">
              <EmptyChat />
            </div>

            {/* Message Input Container */}
            <div className="bg-[var(--bg-main)]">
              <div className="w-full rounded-xl border border-[var(--border-light)] p-2.5 shadow-sm transition-all focus-within:border-[var(--accent-primary)]/60 focus-within:ring-[var(--accent-primary)]/10">
                <textarea
                  rows={2}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask anything..."
                  className="w-full resize-none bg-transparent px-2 py-1 text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)]"
                />

                <div className="mt-0 flex items-center justify-between pt-1">
                  {/* Left Action Buttons */}
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      title="Attach files"
                      aria-label="Attach files"
                      className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
                    >
                      <Paperclip size={18} strokeWidth={1.8} />
                    </button>

                    <button
                      type="button"
                      title="Voice input"
                      aria-label="Voice input"
                      className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
                    >
                      <Mic size={18} strokeWidth={1.8} />
                    </button>
                  </div>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!message.intent?.trim() && !message.trim()}
                    title="Send message"
                    aria-label="Send message"
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-main)] rotate-45 shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  >
                    <ArrowUp size={18} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <Source />
    </div>
  );
};

export default ChatBot;
