import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  CircleFadingPlus,
  Mic,
  Paperclip,
  ArrowUp,
  Copy,
  RotateCw,
  Volume2,
} from "lucide-react";

import Source from "./Source";
import EmptyChat from "./EmptyChat";
import SidePanel from "./SidePanel";

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize state from sessionStorage if available, default to 60
  const [leftWidth, setLeftWidth] = useState(() => {
    const savedWidth = sessionStorage.getItem("chatLeftWidth");
    return savedWidth ? parseFloat(savedWidth) : 60;
  });

  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;

    if (newWidth >= 60 && newWidth <= 80) {
      setLeftWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";

      // Save the current width to session storage when dragging ends
      setLeftWidth((currentWidth) => {
        sessionStorage.setItem("chatLeftWidth", currentWidth);
        return currentWidth;
      });
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
    if (!message.trim() || isLoading) return;

    const userMessage = { sender: "user", text: message };

    // Add user message, clear input, and set loading state
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    // Simulate backend response after a short delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "We're unable to connect to the backend server at the moment. This may be due to a temporary server issue or an unstable connection. Please try again in a few moments. Once the connection is restored, you'll be able to continue using the service as usual." },
      ]);
      setIsLoading(false);
    }, 1000);
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
            <div className="flex-1 overflow-y-auto pb-2 px-2">
              {messages.length === 0 ? (
                <EmptyChat />
              ) : (
                <div className="flex flex-col gap-4 py-2">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2.5 text-sm ${
                          msg.sender === "user"
                            ? "bg-[var(--bg-secondary)] rounded-tl-xl rounded-tr-none rounded-bl-xl rounded-br-xl text-[var(--text-main)] border border-[var(--border-light)]"
                            : "text-[var(--text-main)] w-full"
                        }`}
                      >
                        {msg.text}

                        {/* Action Icons Below Bot Reply */}
                        {msg.sender === "bot" && (
                          <div className="mt-3 flex items-center gap-3 text-[var(--text-muted)]">
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(msg.text)
                              }
                              className="transition-colors hover:text-[var(--text-main)]"
                              title="Copy"
                            >
                              <Copy size={15} strokeWidth={1.8} />
                            </button>
                            <button
                              className="transition-colors hover:text-[var(--text-main)]"
                              title="Regenerate"
                            >
                              <RotateCw size={15} strokeWidth={1.8} />
                            </button>
                            <button
                              className="transition-colors hover:text-[var(--text-main)]"
                              title="Listen"
                            >
                              <Volume2 size={15} strokeWidth={1.8} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Skeleton Loader while waiting for reply */}
                  {isLoading && (
                    <div className="flex flex-col items-start">
                      <div className="max-w-[80%] px-4 py-2.5 text-sm w-full space-y-2">
                        <div className="h-3 w-56 animate-pulse rounded-full bg-[var(--border-light)]" />
                        <div className="h-3 w-34 animate-pulse rounded-full bg-[var(--bg-secondary)]" />
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                    disabled={!message.trim() || isLoading}
                    title="Send message"
                    aria-label="Send message"
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-main)] rotate-45 shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none bg-[var(--accent-primary)]"
                  >
                    <ArrowUp
                      size={18}
                      strokeWidth={2.4}
                      className="-rotate-45"
                    />
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
