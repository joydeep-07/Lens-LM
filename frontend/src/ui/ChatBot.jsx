import React, { useState, useRef, useEffect, useCallback } from "react";
import { CircleFadingPlus, Mic, Paperclip, ArrowUp } from "lucide-react";

import Source from "./Source";
import EmptyChat from "./EmptyChat";
import SidePanel from "./SidePanel";

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [leftWidth, setLeftWidth] = useState(60); // Percentage width of the left panel
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;

    // Left panel bounds:
    // Minimum 60% -> Caps the right Source panel at a maximum of 40vw
    // Maximum 80% -> Allows the right Source panel to contract below 40vw
    if (newWidth >= 60 && newWidth <= 80) {
      setLeftWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Message:", message);
    setMessage("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]">
      {/* Left Panel */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="flex flex-col justify-between rounded-xl border-r border-[var(--border-light)]/50 gap-2 p-2 shrink-0"
      >
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

        <div className="flex h-full gap-2 w-full overflow-hidden">
          {/* Side Navigation Panel */}
          <SidePanel />

          {/* Main Chat Area */}
          <div className="flex flex-1 flex-col h-full overflow-hidden">
            {/* Chat Messages / Empty State Area */}
            <div className="flex-1 overflow-y-auto pb-2">
              <EmptyChat />
            </div>

            {/* Message Input Container */}
            <div className="bg-[var(--bg-main)]">
              <div className="flex w-full flex-col justify-between rounded-xl min-h-[128px] border border-[var(--border-light)] p-3 shadow-sm transition-all focus-within:border-[var(--accent-primary)]/60 focus-within:ring-[var(--accent-primary)]/10">
                {/* Textarea */}
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

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-2">
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
                    disabled={!message.trim()}
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

      {/* Draggable Divider / Border */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1.5 cursor-col-resize transition-colors bg-transparent flex items-center justify-center shrink-0"
        title="Drag to resize panels"
      >
        <div className="h-8 w-0.5 rounded-full bg-[var(--border-light)]" />
      </div>

      {/* Right Panel */}
      <div className="flex-1 h-full overflow-hidden">
        <Source />
      </div>
    </div>
  );
};

export default ChatBot;
