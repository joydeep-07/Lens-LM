import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Clock,
  ArrowRight,
  X,
  Share2,
} from "lucide-react";

// Reusable Segmented Control
const SegmentedControl = ({ options, value, onChange, layoutId }) => {
  return (
    <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-light)] shrink-0 relative">
      {options.map((option) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`relative px-3 py-1 text-xs transition-colors z-10 ${
              isActive
                ? "text-[var(--text-main)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-[var(--bg-card)] rounded-md shadow-sm z-[-1] border border-[var(--border-light)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {option}
          </button>
        );
      })}
    </div>
  );
};

const ChatHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("All");
  const [selectedChat, setSelectedChat] = useState(1);

  const [chats, setChats] = useState([
    {
      id: 1,
      title: "React Lens Lm Color State Fix",
      preview: "why the text Lens Lm is not changing its color when toggled...",
      category: "Today",
      date: "2 hours ago",
      pinned: true,
      messagesCount: 8,
      tags: ["React", "Tailwind"],
    },
    {
      id: 2,
      title: "Tailwind CSS Variable Overrides",
      preview:
        "How do I map custom theme variables cleanly across components...",
      category: "Today",
      date: "4 hours ago",
      pinned: false,
      messagesCount: 5,
      tags: ["CSS", "UI"],
    },
    {
      id: 3,
      title: "Framer Motion Layout ID Transition Bug",
      preview:
        "The sliding pill animation jitters when nested inside flex containers...",
      category: "Yesterday",
      date: "Yesterday",
      pinned: true,
      messagesCount: 12,
      tags: ["Animation", "React"],
    },
    {
      id: 4,
      title: "Node.js REST API Authentication",
      preview:
        "Setting up JWT middleware with HttpOnly cookies and refresh tokens...",
      category: "Previous 7 Days",
      date: "3 days ago",
      pinned: false,
      messagesCount: 15,
      tags: ["Backend", "Security"],
    },
    {
      id: 5,
      title: "MongoDB Atlas Aggregation Pipeline",
      preview:
        "Optimizing lookup stages for relational queries in MERN stack...",
      category: "Previous 7 Days",
      date: "5 days ago",
      pinned: false,
      messagesCount: 7,
      tags: ["Database", "MERN"],
    },
  ]);

  const togglePin = (id, e) => {
    e.stopPropagation();
    setChats(
      chats.map((chat) =>
        chat.id === id ? { ...chat, pinned: !chat.pinned } : chat,
      ),
    );
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    setChats(chats.filter((chat) => chat.id !== id));
    if (selectedChat === id) {
      const remaining = chats.filter((chat) => chat.id !== id);
      if (remaining.length > 0) setSelectedChat(remaining[0].id);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterTab === "Pinned") return matchesSearch && chat.pinned;
    return matchesSearch;
  });

  const activeChatData = chats.find((c) => c.id === selectedChat) || chats[0];

  return (
    <div className="border border-[var(--border-light)] flex overflow-hidden rounded-xl h-150 w-6xl bg-[var(--bg-main)] text-[var(--text-main)] shadow-2xl">
      {/* Sidebar Navigation */}
      <div className="w-80 border-r border-[var(--border-light)] flex flex-col bg-[var(--bg-secondary)] select-none">
        <div className="p-4 space-y-3 border-b border-[var(--border-light)]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-[var(--text-main)] ">
              Chat History
            </span>
            <SegmentedControl
              options={["All", "Pinned"]}
              value={filterTab}
              onChange={setFilterTab}
              layoutId="chatHistoryFilterPill"
            />
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-2.5 text-[var(--text-muted)]"
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--google-blue)] transition-colors"
            />
          </div>
        </div>

        {/* Scrollable Chat List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--text-muted)]">
              No conversations found
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = selectedChat === chat.id;
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
                  {isSelected && (
                    <motion.div
                      layoutId="activeChatSlideIndicator"
                      className="absolute inset-0 bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-light)] z-0"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Chat Item Content (Needs z-10 so it sits above the sliding motion background) */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-xs truncate font-medium text-[var(--text-main)] pr-12">
                      {chat.title}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2.5">
                      <button
                        onClick={(e) => togglePin(chat.id, e)}
                        className="p-1 rounded hover:bg-[var(--bg-secondary)]"
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
                        className="p-1 rounded hover:bg-[var(--bg-secondary)]"
                        style={{ color: "var(--google-red)" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <p className="relative z-10 text-[11px] truncate text-[var(--text-muted)]">
                    {chat.preview}
                  </p>

                  <div className="relative z-10 flex items-center justify-between pt-1 text-[10px] text-[var(--text-muted)]">
                    <span>{chat.date}</span>
                    <span>{chat.messagesCount} msgs</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-[var(--bg-main)]">
        {activeChatData ? (
          <div className="px-7 py-6 space-y-6 h-full flex flex-col justify-between">
            <div className="">
              {/* Header info */}
              <div className="space-y-2">
                <h2 className="text-base font-bold text-[var(--text-main)] ">
                  {activeChatData.title}
                </h2>
                <div className="flex gap-1.5 pt-1">
                  {activeChatData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-muted)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <hr className="border-[var(--border-light)]/50 my-4" />

              {/* Transcript Preview */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] ">
                  Transcript Preview ({activeChatData.messagesCount} messages)
                </h3>

                <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-main)",
                      }}
                    >
                      U
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-[var(--text-main)]">
                        You
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        {activeChatData.preview}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-3 border-t border-[var(--border-light)]">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--google-blue)",
                      }}
                    >
                      AI
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-[var(--text-main)]">
                        Assistant
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        Here is how you can address this issue by checking
                        component theme scope and variables...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Action Footer */}
            <div className="pt-4 flex items-center justify-between">
              <button className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors">
                <Share2 size={14} /> Export Transcript
              </button>
              <button
                className="flex text-white items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium shadow-md transition-colors"
                style={{
                  backgroundColor: "var(--google-blue)",
                }}
              >
                Resume Chat <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-2">
            <MessageSquare
              size={28}
              className="text-[var(--text-muted)] opacity-50"
            />
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              No conversation selected
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Choose a session from the sidebar to view its details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
