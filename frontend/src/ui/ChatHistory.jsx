import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Clock,
  ArrowRight,
  Share2,
  Copy,
  RotateCw,
  Volume2,
} from "lucide-react";

import SegmentedControl from "../components/SegmentedControl";
import chatsData from "../assets/dummyChats";

const ChatHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("All");

  const [chats, setChats] = useState(() =>
    chatsData.map((chat) => ({
      ...chat,
      pinned: chat.pinned ?? false,
    })),
  );

  const [selectedChat, setSelectedChat] = useState(chatsData[0]?.id ?? null);

  // Toggle pin
  const togglePin = (id, e) => {
    e.stopPropagation();

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === id ? { ...chat, pinned: !chat.pinned } : chat,
      ),
    );
  };

  // Delete chat
  const deleteChat = (id, e) => {
    e.stopPropagation();

    setChats((prevChats) => {
      const remaining = prevChats.filter((chat) => chat.id !== id);

      if (selectedChat === id) {
        setSelectedChat(remaining[0]?.id ?? null);
      }

      return remaining;
    });
  };

  // Search by title or any message
  const filteredChats = chats.filter((chat) => {
    const query = searchQuery.toLowerCase().trim();

    const matchesTitle = chat.title.toLowerCase().includes(query);

    const matchesMessages = chat.messages.some((message) =>
      message.content.toLowerCase().includes(query),
    );

    const matchesSearch = matchesTitle || matchesMessages;

    if (filterTab === "Pinned") {
      return matchesSearch && chat.pinned;
    }

    return matchesSearch;
  });

  // Selected conversation
  const activeChatData = chats.find((chat) => chat.id === selectedChat);

  // Get the first user message for the sidebar preview
  const getFirstUserMessage = (chat) => {
    return (
      chat.messages.find((message) => message.role === "user")?.content ??
      "No messages yet"
    );
  };

  // Export complete conversation
  const exportTranscript = () => {
    if (!activeChatData) return;

    const transcript = activeChatData.messages
      .map((message) => {
        const sender = message.role === "user" ? "You" : "Assistant";

        return `[${message.time ?? ""}] ${sender}:\n${message.content}`;
      })
      .join("\n\n");

    const blob = new Blob([transcript], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${activeChatData.title
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()}-transcript.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-[var(--border-light)]/50 flex overflow-hidden rounded-xl h-150 w-6xl bg-[var(--bg-main)] text-[var(--text-main)] shadow-2xl">
      {/* LEFT PANEL */}
      <aside className="w-80 shrink-0 border-r border-[var(--border-light)]/30 flex flex-col bg-[var(--bg-secondary)]/50 select-none min-h-0">
        {/* Header */}
        <div className="p-2 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-[var(--text-main)]">
              Chat History
            </span>

            <SegmentedControl
              options={["All", "Pinned"]}
              value={filterTab}
              onChange={setFilterTab}
              layoutId="chatHistoryFilterPill"
            />
          </div>

          {/* Search */}
          <div className="">
            <div className="flex items-center gap-2 bg-[var(--bg-card)]/50 px-2 py-2 rounded-xs text-xs text-[var(--text-secondary)] border border-[var(--border-light)]/20">
              <Search size={14} className="opacity-50 shrink-0" />
              <input
                type="text"
                placeholder="Search chats..."
                className="bg-transparent border-none outline-none w-full text-[var(--text-main)] placeholder:text-[var(--text-secondary)]/50 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--text-muted)]">
              No conversations found
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = selectedChat === chat.id;

              const firstUserMessage = getFirstUserMessage(chat);

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`group relative p-2.5 rounded-lg cursor-pointer text-left flex flex-col gap-1 transition-colors ${
                    isSelected
                      ? "text-[var(--text-main)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {/* Selected Background */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeChatSlideIndicator"
                      className="absolute inset-0 bg-[var(--bg-card)]/50 rounded-xs z-0"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Title and Actions */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-xs truncate font-medium text-[var(--text-main)] pr-2">
                      {chat.title}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => togglePin(chat.id, e)}
                        title={
                          chat.pinned
                            ? "Unpin conversation"
                            : "Pin conversation"
                        }
                        aria-label={
                          chat.pinned
                            ? "Unpin conversation"
                            : "Pin conversation"
                        }
                        className={`p-1 rounded hover:bg-[var(--bg-secondary)] transition-opacity ${
                          chat.pinned
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                        style={{
                          color: chat.pinned
                            ? "var(--google-yellow)"
                            : "var(--text-muted)",
                        }}
                      >
                        <Pin size={12} />
                      </button>

                      <button
                        onClick={(e) => deleteChat(chat.id, e)}
                        title="Delete conversation"
                        aria-label="Delete conversation"
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-secondary)] transition-opacity"
                        style={{
                          color: "var(--google-red)",
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* First User Message */}
                  <p className="relative z-10 text-[11px] truncate text-[var(--text-muted)]">
                    {firstUserMessage}
                  </p>

                  {/* Date and Message Count */}
                  <div className="relative z-10 flex items-center justify-between pt-1 text-[10px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {chat.date ?? chat.category}
                    </span>

                    <span>{chat.messages.length} msgs</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className="flex-1 min-w-0 min-h-0 flex flex-col relative bg-[var(--bg-main)]">
        {activeChatData ? (
          <>
            {/* Conversation Header */}
            <header className="shrink-0 px-6 py-5 flex items-center gap-4 border-b border-[var(--border-light)]/40">
              <img src="./logo.svg" className="h-6 w-6" alt="" />
              <h2 className="text-md font-medium text-[var(--text-main)]/80">
                {activeChatData.title}
              </h2>
            </header>

            {/* COMPLETE CHAT HISTORY */}
            <section className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-4 py-2">
                {activeChatData.messages.map((message, index) => {
                  const isUser = message.role === "user";

                  return (
                    <motion.div
                      key={message.id ?? `${activeChatData.id}-${index}`}
                      initial={{
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className={`flex flex-col ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2.5 text-xs ${
                          isUser
                            ? "bg-[var(--bg-secondary)] text-justify rounded-tl-xl rounded-tr-none rounded-bl-xl rounded-br-xl text-[var(--text-main)]/80 leading-5.5 tracking-wide border border-[var(--border-light)]"
                            : "text-[var(--text-main)] w-full text-[var(--text-main)]/80 leading-5.5 tracking-wide"
                        }`}
                      >
                        {message.content}

                        {/* Action Icons Below Bot Reply */}
                        {!isUser && (
                          <div className="mt-3 flex items-center gap-3 text-[var(--text-muted)]">
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(message.content)
                              }
                              className="transition-colors hover:text-[var(--text-main)]"
                              title="Copy"
                              aria-label="Copy message text"
                            >
                              <Copy size={15} strokeWidth={1.8} />
                            </button>
                            <button
                              className="transition-colors hover:text-[var(--text-main)]"
                              title="Regenerate"
                              aria-label="Regenerate response"
                            >
                              <RotateCw size={15} strokeWidth={1.8} />
                            </button>
                            <button
                              className="transition-colors hover:text-[var(--text-main)]"
                              title="Listen"
                              aria-label="Listen to message"
                            >
                              <Volume2 size={15} strokeWidth={1.8} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Footer */}
            <footer className="shrink-0 px-6 py-4 border-t border-[var(--border-light)]/40 flex items-center justify-between gap-3">
              <button
                onClick={exportTranscript}
                className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
              >
                <Share2 size={14} />
                Export Transcript
              </button>

              <button
                onClick={() => {
                  console.log("Resume chat:", activeChatData.id);
                }}
                className="flex shrink-0 text-white items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium shadow-md transition-colors hover:opacity-90"
                style={{
                  backgroundColor: "var(--google-blue)",
                }}
              >
                Resume Chat
                <ArrowRight size={14} />
              </button>
            </footer>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-2">
            <MessageSquare
              size={28}
              className="text-[var(--text-muted)] opacity-50"
            />

            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              No conversation selected
            </h3>

            <p className="text-xs text-[var(--text-muted)]">
              Choose a conversation from the sidebar to view its complete
              history.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatHistory;
