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
  FolderKanban,
} from "lucide-react";

import GeneralSettings from "../settings/General";
import ProfileSettings from "../settings/ProfileSettings";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "account", label: "Account", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    // { id: "billing", label: "Billing", icon: CreditCard },
    { id: "capabilities", label: "Capabilities", icon: Cpu },
    { id: "memory", label: "Memory", icon: Database },
    { id: "time-focus", label: "Time and focus", icon: Clock },
    { id: "claude-code", label: "Claude Code", icon: Code },
  ];

  const thisComputerTabs = [
    { id: "system", label: "System", icon: Monitor },
    { id: "extensions", label: "Extensions", icon: Sliders },
    { id: "developer", label: "Developer", icon: Terminal },
  ];

  const customizeTabs = [
    { id: "skills", label: "Skills", icon: Zap },
    { id: "connectors", label: "Connectors", icon: Database },
    { id: "plugins", label: "Plugins", icon: Sliders },
  ];

  const platformTabs = [{ id: "api-keys", label: "API keys", icon: Key }];

  // Combine all items to easily lookup icon & label for the active tab
  const allTabs = [
    ...tabs,
    ...thisComputerTabs,
    ...customizeTabs,
    ...platformTabs,
  ];

  // Map active tab keys directly to components
  const TAB_COMPONENTS = {
    general: <GeneralSettings />,
    account: <ProfileSettings />,
    // billing: <BillingSettings />,
    // privacy: <PrivacySettings />,
  };

  // Active tab helper data
  const activeTabItem = allTabs.find((tab) => tab.id === activeTab);
  const ActiveIcon = activeTabItem?.icon || FolderKanban;
  const tabLabel = activeTabItem?.label || activeTab.replace("-", " ");

  return (
    <div className="border border-[var(--border-light)]/50 flex overflow-hidden rounded-xl h-150 w-6xl bg-[var(--bg-main)] text-[var(--text-main)] shadow-2xl">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-[var(--border-light)]/30 flex flex-col bg-[var(--bg-secondary)]/50 select-none">
        <div className="px-4 pt-4 pb-2 text-sm uppercase tracking-wider text-[var(--text-main)]/80 font-medium">
          {activeTab === "general" ? <>Settings</> : <> {activeTab} </>}
        </div>

        {/* Scrollable Nav Links */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-6 text-xs font-medium">
          {/* Settings Section */}
          <div className="space-y-0.5">
            <div className=" pb-3">
              <div className="flex items-center gap-2 bg-[var(--bg-card)] px-2 py-2 rounded-xs text-xs text-[var(--text-secondary)] border border-[var(--border-light)]/20">
                <Search size={14} className="opacity-50 shrink-0" />
                <input
                  type="text"
                  placeholder="Search settings..."
                  className="bg-transparent border-none outline-none w-full text-[var(--text-main)] placeholder:text-[var(--text-secondary)]/50 text-xs"
                />
              </div>
            </div>

            {tabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xs transition-colors text-left relative ${
                    isActive
                      ? "text-[var(--text-main)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover,rgba(255,255,255,0.04))]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarTab"
                      className="absolute inset-0 bg-[var(--bg-card)]/50 rounded-xs z-0"
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
            {thisComputerTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xs transition-colors text-left relative ${
                    isActive
                      ? "text-[var(--text-main)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover,rgba(255,255,255,0.04))]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarTab"
                      className="absolute inset-0 bg-[var(--bg-card)]/50 rounded-xs z-0"
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
            {customizeTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xs transition-colors text-left relative ${
                    isActive
                      ? "text-[var(--text-main)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover,rgba(255,255,255,0.04))]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarTab"
                      className="absolute inset-0 bg-[var(--bg-card)]/50 rounded-xs z-0"
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xs transition-colors text-left relative ${
                activeTab === "api-keys"
                  ? "text-[var(--text-main)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover,rgba(255,255,255,0.04))]"
              }`}
            >
              {activeTab === "api-keys" && (
                <motion.div
                  layoutId="activeSidebarTab"
                  className="absolute inset-0 bg-[var(--bg-card)]/50 rounded-xs z-0"
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
        {TAB_COMPONENTS[activeTab] ? (
          TAB_COMPONENTS[activeTab]
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative select-none">
            {/* Soft Ambient Glow */}
            <div className="absolute w-48 h-48 bg-[(--bg-main)] rounded-full blur-3xl pointer-events-none -z-0" />

            <div className="relative z-10 flex flex-col items-center max-w-sm">
              {/* Dynamic Icon Container */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 relative group">
                <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                <ActiveIcon className="w-7 h-7 text-[var(--text-secondary)] group-hover:text-[var(--text-main)] transition-colors relative z-10" />
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold text-[var(--text-main)] tracking-tight mb-1">
                {tabLabel} Settings
              </h4>

              {/* Subtitle */}
              <p className="text-xs max-w-xs mt-2 text-[var(--text-secondary)] leading-relaxed opacity-70">
                Options for{" "}
                <span className="font-medium text-[var(--text-main)]">
                  {tabLabel}
                </span>{" "}
                are currently being developed and will be available in an
                upcoming update.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
