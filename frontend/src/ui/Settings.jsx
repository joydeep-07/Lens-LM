import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Settings as SettingsIcon,
  User,
  Shield,
  CreditCard,
  Cpu,
  Database,
  Sparkles,
  Clock,
  Code,
  Monitor,
  Sliders,
  Terminal,
  Zap,
  Key,
  X,
  ChevronDown,
} from "lucide-react";

// Reusable Segmented Control with sliding background pill
const SegmentedControl = ({ options, value, onChange, layoutId }) => {
  return (
    <div className="flex bg-[var(--bg-input,rgba(255,255,255,0.04))] p-1 rounded-lg border border-[var(--border-light)]/20 shrink-0 relative">
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
                className="absolute inset-0 bg-[var(--bg-active,rgba(255,255,255,0.12))] rounded-md shadow-sm z-[-1]"
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

// Reusable Animated Toggle Switch
const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 mt-0.5 cursor-pointer ${
        checked
          ? "bg-blue-600"
          : "bg-[var(--bg-input,rgba(255,255,255,0.1))] border border-[var(--border-light)]/20"
      }`}
    >
      <motion.div
        className="bg-white w-4 h-4 rounded-full shadow-md"
        animate={{ x: checked ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  // Interactive UI states
  const [transcriptSize, setTranscriptSize] = useState("Medium");
  const [transcriptWidth, setTranscriptWidth] = useState("Medium");
  const [motionSetting, setMotionSetting] = useState("System");
  const [responseCompletions, setResponseCompletions] = useState(false);
  const [mentions, setMentions] = useState(true);
  const [comments, setComments] = useState(true);
  const [sharedArtifacts, setSharedArtifacts] = useState(true);

  return (
    <div className="border border-[var(--border-light)]/50 flex overflow-hidden rounded-xl h-150 w-6xl bg-[var(--bg-main)] text-[var(--text-main)] shadow-2xl">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-[var(--border-light)]/30 flex flex-col bg-[var(--bg-sidebar,rgba(0,0,0,0.2))] select-none">
        <div className="px-4 pt-4 pb-2 text-sm uppercase tracking-wider text-[var(--text-main)] font-bold">
          Settings
        </div>

        {/* Scrollable Nav Links */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-6 text-xs font-medium">
          {/* Settings Section */}
          <div className="space-y-0.5">
            <div className="px-1 pb-3">
              <div className="flex items-center gap-2 bg-[var(--bg-input,rgba(255,255,255,0.05))] px-3 py-1.5 rounded-md text-xs text-[var(--text-secondary)] border border-[var(--border-light)]/20">
                <Search size={14} className="opacity-50 shrink-0" />
                <input
                  type="text"
                  placeholder="Search settings..."
                  className="bg-transparent border-none outline-none w-full text-[var(--text-main)] placeholder:text-[var(--text-secondary)]/50 text-xs"
                />
              </div>
            </div>

            {[
              { id: "general", label: "General", icon: SettingsIcon },
              { id: "account", label: "Account", icon: User },
              { id: "privacy", label: "Privacy", icon: Shield },
              { id: "billing", label: "Billing", icon: CreditCard },
              { id: "capabilities", label: "Capabilities", icon: Cpu },
              { id: "memory", label: "Memory", icon: Database },
              { id: "reflect", label: "Reflect", icon: Sparkles },
              { id: "time-focus", label: "Time and focus", icon: Clock },
              { id: "claude-code", label: "Claude Code", icon: Code },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left relative ${
                    isActive
                      ? "text-[var(--text-main)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover,rgba(255,255,255,0.04))]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarTab"
                      className="absolute inset-0 bg-[var(--bg-active,rgba(255,255,255,0.08))] rounded-lg z-0"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                    />
                  )}
                  <Icon
                    size={15}
                    className={`z-10 ${isActive ? "opacity-100 shrink-0" : "opacity-60 shrink-0"}`}
                  />
                  <span className="truncate z-10">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* This Computer Section */}
          <div className="space-y-0.5">
            <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-[var(--text-secondary)]/60 font-semibold">
              This computer
            </div>
            {[
              { id: "system", label: "System", icon: Monitor },
              { id: "extensions", label: "Extensions", icon: Sliders },
              { id: "developer", label: "Developer", icon: Terminal },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left relative ${
                    isActive
                      ? "text-[var(--text-main)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover,rgba(255,255,255,0.04))]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarTab"
                      className="absolute inset-0 bg-[var(--bg-active,rgba(255,255,255,0.08))] rounded-lg z-0"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                    />
                  )}
                  <Icon
                    size={15}
                    className={`z-10 ${isActive ? "opacity-100 shrink-0" : "opacity-60 shrink-0"}`}
                  />
                  <span className="truncate z-10">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Customize Section */}
          <div className="space-y-0.5">
            <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-[var(--text-secondary)]/60 font-semibold">
              Customize
            </div>
            {[
              { id: "skills", label: "Skills", icon: Zap },
              { id: "connectors", label: "Connectors", icon: Database },
              { id: "plugins", label: "Plugins", icon: Sliders },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left relative ${
                    isActive
                      ? "text-[var(--text-main)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover,rgba(255,255,255,0.04))]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarTab"
                      className="absolute inset-0 bg-[var(--bg-active,rgba(255,255,255,0.08))] rounded-lg z-0"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                    />
                  )}
                  <Icon
                    size={15}
                    className={`z-10 ${isActive ? "opacity-100 shrink-0" : "opacity-60 shrink-0"}`}
                  />
                  <span className="truncate z-10">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Platform Section */}
          <div className="space-y-0.5 pb-4">
            <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-[var(--text-secondary)]/60 font-semibold">
              Platform
            </div>
            <button
              onClick={() => setActiveTab("api-keys")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left relative ${
                activeTab === "api-keys"
                  ? "text-[var(--text-main)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover,rgba(255,255,255,0.04))]"
              }`}
            >
              {activeTab === "api-keys" && (
                <motion.div
                  layoutId="activeSidebarTab"
                  className="absolute inset-0 bg-[var(--bg-active,rgba(255,255,255,0.08))] rounded-lg z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <div className="flex items-center gap-2.5 truncate z-10">
                <Key size={15} className="opacity-60 shrink-0" />
                <span className="truncate">API keys</span>
              </div>
              <span className="text-[10px] opacity-40 shrink-0 z-10">↗</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <button className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-main)] p-1.5 rounded-md hover:bg-[var(--bg-hover,rgba(255,255,255,0.05))] transition-colors z-10">
          <X size={16} />
        </button>

        <div className="p-7 space-y-4 ">
          {/* Section: Appearance */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold tracking-wide text-[var(--text-main)]">
              Appearance
            </h3>

            {/* Chat Font Option */}
            <div className="flex items-center justify-between text-xs gap-4">
              <span className="text-[var(--text-main)] font-medium">
                Chat font
              </span>
              <button className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-[var(--bg-input,rgba(255,255,255,0.04))] border border-[var(--border-light)]/20 text-[var(--text-main)] font-medium hover:bg-[var(--bg-hover,rgba(255,255,255,0.08))] transition-colors">
                Anthropic Serif <ChevronDown size={12} className="opacity-50" />
              </button>
            </div>

            {/* Transcript Text Size */}
            <div className="flex items-start justify-between text-xs gap-4">
              <div>
                <div className="text-[var(--text-main)] font-medium">
                  Transcript text size
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Size of the conversation transcript text.
                </div>
              </div>
              <SegmentedControl
                options={["Small", "Medium", "Large"]}
                value={transcriptSize}
                onChange={setTranscriptSize}
                layoutId="transcriptSizePill"
              />
            </div>

            {/* Transcript Width */}
            <div className="flex items-start justify-between text-xs gap-4">
              <div>
                <div className="text-[var(--text-main)] font-medium">
                  Transcript width
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Maximum width of the transcript and composer columns.
                </div>
              </div>
              <SegmentedControl
                options={["Narrow", "Medium", "Wide"]}
                value={transcriptWidth}
                onChange={setTranscriptWidth}
                layoutId="transcriptWidthPill"
              />
            </div>

            {/* Motion */}
            <div className="flex items-start justify-between text-xs gap-4">
              <div>
                <div className="text-[var(--text-main)] font-medium">
                  Motion
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Reduce animation in streaming responses and other interface
                  elements.
                </div>
              </div>
              <SegmentedControl
                options={["System", "Reduced"]}
                value={motionSetting}
                onChange={setMotionSetting}
                layoutId="motionSettingPill"
              />
            </div>
          </div>

          <hr className="border-[var(--border-light)]/20" />

          {/* Section: Notifications */}
          <div className="space-y-5 pb-6">
            <h3 className="text-sm font-bold tracking-wide text-[var(--text-main)]">
              Notifications
            </h3>

            {/* Toggle Item 1 */}
            <div className="flex items-start justify-between text-xs gap-6">
              <div>
                <div className="text-[var(--text-main)] font-medium">
                  Response completions
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Get notified when Claude has finished a response. Useful for
                  long-running tasks.
                </div>
              </div>
              <ToggleSwitch
                checked={responseCompletions}
                onChange={setResponseCompletions}
              />
            </div>

            {/* Toggle Item 2 */}
            <div className="flex items-start justify-between text-xs gap-6">
              <div>
                <div className="text-[var(--text-main)] font-medium">
                  Mentions and replies
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Get an email when someone @mentions you on an artifact, or
                  replies in a comment thread you're part of.
                </div>
              </div>
              <ToggleSwitch checked={mentions} onChange={setMentions} />
            </div>

            {/* Toggle Item 3 */}
            <div className="flex items-start justify-between text-xs gap-6">
              <div>
                <div className="text-[var(--text-main)] font-medium">
                  Comments on your artifacts
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Get an email when someone comments on an artifact you own,
                  even when you're not mentioned.
                </div>
              </div>
              <ToggleSwitch checked={comments} onChange={setComments} />
            </div>

            {/* Toggle Item 4 */}
            <div className="flex items-start justify-between text-xs gap-6">
              <div>
                <div className="text-[var(--text-main)] font-medium">
                  Artifacts shared with you
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Get an email when someone shares an artifact with you.
                </div>
              </div>
              <ToggleSwitch
                checked={sharedArtifacts}
                onChange={setSharedArtifacts}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
