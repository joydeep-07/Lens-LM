import React, { useState } from "react";
import {
  User,
  Shield,
  CreditCard,
  Key,
  Bell,
  Globe,
  ChevronRight,
  ArrowLeft,
  BadgeCheck,
  LogOut,
  Settings as SettingsIcon,
  Cpu,
  Database,
  Clock,
  Code,
  Monitor,
  Sliders,
  Terminal,
  Zap,
  ChevronLeft,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProfileSettings from "../settings/ProfileSettings";
import GeneralSettings from "../settings/General";
import Logout from "../ui/Logout";

const MobileProfile = () => {
  const storedUser = useSelector((state) => state.auth.user);
  const [activeView, setActiveView] = useState("menu");

  const email = storedUser?.email || "";
  const fullName =
    storedUser?.name ||
    storedUser?.fullName ||
    email.split("@")[0] ||
    "Your name";

  // Navigation Groups with all desktop tabs (excluding 'Account')
  const navigationGroups = [
    {
      heading: "Settings",
      items: [
        { id: "public-profile", label: "Profile", icon: User },
        { id: "general", label: "General", icon: SettingsIcon },
        { id: "privacy", label: "Privacy", icon: Shield },
        {
          id: "billing-subscriptions",
          label: "Billing & Plans",
          icon: CreditCard,
        },
        { id: "capabilities", label: "Capabilities", icon: Cpu },
        { id: "memory", label: "Memory", icon: Database },
        { id: "time-focus", label: "Time and focus", icon: Clock },
        { id: "claude-code", label: "Claude Code", icon: Code },
      ],
    },
    {
      heading: "This computer",
      items: [
        { id: "system", label: "System", icon: Monitor },
        { id: "extensions", label: "Extensions", icon: Sliders },
        { id: "developer", label: "Developer", icon: Terminal },
      ],
    },
    {
      heading: "Customize",
      items: [
        { id: "skills", label: "Skills", icon: Zap },
        { id: "connectors", label: "Connectors", icon: Database },
        { id: "plugins", label: "Plugins", icon: Sliders },
      ],
    },
    {
      heading: "Preferences & Platform",
      items: [
        { id: "notifications", label: "Notification feeds", icon: Bell },
        { id: "connected-apps", label: "Connected services", icon: Globe },
        { id: "api-credentials", label: "API Keys", icon: Key },
      ],
    },
  ];

  // Map active view keys directly to components
  const VIEW_COMPONENTS = {
    "public-profile": <ProfileSettings />,
    general: <GeneralSettings />,
  };

  const getActiveLabel = () => {
    return (
      navigationGroups
        .flatMap((group) => group.items)
        .find((item) => item.id === activeView)?.label || "Settings"
    );
  };

  return (
    <div className="flex h-full p-3 mb-10 flex-col w-full md:w-100 bg-[var(--bg-main)] overflow-hidden text-[var(--text-main)]">
      {/* Mobile Top Navigation Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--border-light)]/20 px-4 py-3">
        {activeView !== "menu" ? (
          <button
            onClick={() => setActiveView("menu")}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:text-[var(--text-secondary)]"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
        ) : (
          <>
            <Link to={"/"} >
              <div className="flex items-center gap-4">
                <ChevronLeft size={18} />
                <h1 className="text-md font-light font-heading tracking-wide">
                  Settings
                </h1>
              </div>
            </Link>
          </>
        )}

        <div className="text-xs font-medium text-[var(--text-secondary)]">
          {activeView !== "menu" ? getActiveLabel() : ""}
        </div>

        <div className="w-10" />
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto">
        {activeView === "menu" ? (
          <div className="space-y-6">
            {/* Profile Card Summary Header */}
            <div
              onClick={() => setActiveView("public-profile")}
              className="flex items-center gap-3.5 rounded-sm border border-[var(--border-light)]/20 bg-[var(--bg-input,rgba(255,255,255,0.02))] p-4 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
            >
              <div className="relative shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-light)]/40 text-[var(--text-main)]/50 bg-[var(--bg-main)]">
                  <User size={22} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="truncate">{fullName}</span>
                  <BadgeCheck
                    size={13}
                    className="shrink-0 text-[var(--google-blue)]"
                  />
                </h2>
                <p className="mt-0.5 truncate text-[11px] text-[var(--text-secondary)]">
                  {email || "Loading email..."}
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-[var(--text-secondary)] shrink-0"
              />
            </div>

            {/* Navigation Group Lists */}
            <div className="space-y-5">
              {navigationGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-2">
                  {group.heading && (
                    <h3 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      {group.heading}
                    </h3>
                  )}
                  <div className="overflow-hidden rounded-sm border border-[var(--border-light)]/20 bg-[var(--bg-input,rgba(255,255,255,0.01))] divide-y divide-[var(--border-light)]/10">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveView(item.id)}
                          className="flex w-full items-center justify-between p-3.5 text-left text-xs transition-colors hover:bg-[var(--border-light)]/5 active:bg-[var(--border-light)]/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--border-light)]/10 text-[var(--text-main)]/80">
                              <Icon size={15} />
                            </div>
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <ChevronRight
                            size={15}
                            className="text-[var(--text-secondary)]"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Logout Option */}
            <div className="w-full">
              <Logout />
            </div>
          </div>
        ) : VIEW_COMPONENTS[activeView] ? (
          <div className="h-full">{VIEW_COMPONENTS[activeView]}</div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center h-full min-h-[50vh]">
            <div className="p-4 rounded-full bg-[var(--border-light)]/10 mb-3">
              <Shield size={24} className="text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-main)]/80">
              {getActiveLabel()}
            </h3>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-[var(--text-secondary)]">
              These settings are not configured yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MobileProfile;
