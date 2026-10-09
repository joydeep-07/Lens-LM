
import React, { useState } from "react";
import {
  CircleFadingPlus,
  Mic,
  Paperclip,
  ArrowUp,
} from "lucide-react";

import Source from "./Source";

const ChatBot = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    console.log("Message:", message);

    setMessage("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]">
      {/* Left Panel */}
      <div className="flex w-6/10 flex-col justify-between gap-3 p-3">
        {/* Navbar */}
        <nav className="flex items-center justify-between rounded-xl border border-[var(--border-light)] px-4 py-3">
          <h1 className="text-lg font-semibold tracking-tight">Lens LM</h1>

          <button
            type="button"
            title="New chat"
            aria-label="New chat"
            className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
          >
            <CircleFadingPlus size={19} strokeWidth={1.8} />
          </button>
        </nav>

        {/* Chat Messages */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
          <div className="m-auto max-w-sm text-center">
            <h2 className="mb-2 text-lg font-medium">
              Start a conversation
            </h2>

            <p className="text-sm leading-6 text-[var(--text-muted)]">
              Ask questions, explore your documents, and get answers based on
              your sources.
            </p>
          </div>
        </div>

        {/* Message Input */}
        <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-card)] p-3 transition-colors focus-within:border-[var(--accent-primary)]">
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
            className="w-full resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[var(--text-muted)]"
          />

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Attach files"
                aria-label="Attach files"
                className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
              >
                <Paperclip size={18} strokeWidth={1.8} />
              </button>

              <button
                type="button"
                title="Voice input"
                aria-label="Voice input"
                className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
              >
                <Mic size={18} strokeWidth={1.8} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim()}
              title="Send message"
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-white transition-all hover:opacity-85 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <Source />
    </div>
  );
};

export default ChatBot;

