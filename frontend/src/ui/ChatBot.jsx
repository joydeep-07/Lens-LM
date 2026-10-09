import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  CircleFadingPlus,
  Mic,
  Plus,
  ArrowUp,
  Copy,
  RotateCw,
  Volume2,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import Source from "./Source";
import EmptyChat from "./EmptyChat";
import SidePanel from "./SidePanel";
import BlurCircle from "../components/BlurCircle";

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Model & Level state selectors
  const [selectedModel, setSelectedModel] = useState("Nova Mini");
  const [selectedLevel, setSelectedLevel] = useState("High");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);

  const models = ["Nova Mini", "Nova Pro", "Lens Ultra"];
  const levels = ["High", "Medium", "Low"];

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

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "We're unable to connect to the backend server at the moment. This may be due to a temporary server issue or an unstable connection. Please try again in a few moments. Once the connection is restored, you'll be able to continue using the service as usual.",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--main)] text-[var(--text-main)]">
      {/* Left Panel */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="flex flex-col justify-between bg-[var(--bg-main)]  rounded-xl border-r border-[var(--border-light)]/50 gap-2 p-2 shrink-0"
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
          <div className="relative flex flex-1 flex-col h-full overflow-hidden">
            {/* Google Color Glow — Consistent Background Positions */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <BlurCircle top="10%" left="15%" color="blue" />
              <BlurCircle top="30%" right="10%" color="red" />
              <BlurCircle bottom="10%" left="25%" color="yellow" />
              <BlurCircle bottom="15%" right="20%" color="green" />
            </div>

            {/* Chat Messages / Empty State Area */}
            <div className="flex-1 overflow-y-auto pb-2 px-2 z-10">
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

                  {/* Skeleton Loader */}
                  {isLoading && (
                    <div className="flex flex-col items-start">
                      <div className="max-w-[80%] px-4 py-2.5 text-sm w-full space-y-2">
                        <div className="h-2.5 w-32 animate-pulse rounded-full bg-[var(--border-light)]" />
                        <div className="h-2 w-24 animate-pulse rounded-full bg-[var(--bg-secondary)]" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message Input Container */}
            <div className="bg-[var(--bg-main)] rounded-2xl z-10">
              <div className="relative flex w-full flex-col justify-between rounded-2xl border border-[var(--border-light)]/50 bg-[var(--bg-card)]/10 p-3 shadow-sm transition-all focus-within:border-[var(--accent-primary)]/30">
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
                  placeholder="Ask anything"
                  className="w-full resize-none bg-transparent px-1 py-1 text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)]"
                />

                {/* Bottom Bar: Model Selector, Level Selector, Mic, Send */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    {/* Add / Attachment Button */}
                    <button
                      type="button"
                      title="Add content"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
                    >
                      <Plus size={16} strokeWidth={2} />
                    </button>

                    {/* Model Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsModelDropdownOpen(!isModelDropdownOpen);
                          setIsLevelDropdownOpen(false);
                        }}
                        className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-main)] hover:opacity-80"
                      >
                        <span>{selectedModel}</span>
                        <ChevronDown
                          size={14}
                          className="text-[var(--text-muted)]"
                        />
                      </button>

                      {isModelDropdownOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-36 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] p-1 shadow-lg z-20">
                          {models.map((mod) => (
                            <button
                              key={mod}
                              onClick={() => {
                                setSelectedModel(mod);
                                setIsModelDropdownOpen(false);
                              }}
                              className={`w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                                selectedModel === mod
                                  ? "bg-[var(--bg-secondary)] text-[var(--text-main)] font-semibold"
                                  : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
                              }`}
                            >
                              {mod}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Level Selector (High / Medium / Low) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsLevelDropdownOpen(!isLevelDropdownOpen);
                          setIsModelDropdownOpen(false);
                        }}
                        className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-main)] hover:opacity-80"
                      >
                        <Sparkles
                          size={13}
                          className="text-[var(--accent-primary)]"
                        />
                        <span>{selectedLevel}</span>
                      </button>

                      {isLevelDropdownOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-32 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] p-1 shadow-lg z-20">
                          {levels.map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => {
                                setSelectedLevel(lvl);
                                setIsLevelDropdownOpen(false);
                              }}
                              className={`w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                                selectedLevel === lvl
                                  ? "bg-[var(--bg-secondary)] text-[var(--text-main)] font-semibold"
                                  : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Icons: Mic & Send */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Voice input"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:text-[var(--text-main)]"
                    >
                      <Mic size={16} strokeWidth={1.8} />
                    </button>

                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!message.trim() || isLoading}
                      title="Send message"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-light)] shadow-sm transition-all hover:bg-[var(--accent-primary)] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowUp size={16} strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draggable Divider */}
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
