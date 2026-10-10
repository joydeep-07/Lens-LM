import React from "react";
import { Plus, Mic, ArrowUp, ChevronDown, CircleSmall } from "lucide-react";

const ChatInput = ({
  message,
  setMessage,
  handleSend,
  isLoading,
  selectedModel,
  setSelectedModel,
  selectedLevel,
  setSelectedLevel,
  isModelDropdownOpen,
  setIsModelDropdownOpen,
  isLevelDropdownOpen,
  setIsLevelDropdownOpen,
  models,
  levels,
}) => {
  return (
    <div className="bg-[var(--bg-main)] rounded-2xl z-10">
      <div className="relative flex w-full h-32 flex-col justify-between rounded-2xl border border-[var(--border-light)]/50 bg-[var(--bg-card)]/10 p-3 shadow-sm transition-all focus-within:border-[var(--accent-primary)]/30">
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
                <ChevronDown size={14} className="text-[var(--text-muted)]" />
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
                <CircleSmall
                  size={16}
                  strokeWidth={1.75}
                  className="text-[var(--text-muted)]"
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
  );
};

export default ChatInput;
