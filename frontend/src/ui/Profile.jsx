import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  CreditCard,
  Key,
  Camera,
  Mail,
  Building,
  MapPin,
  Globe,
  Bell,
  CheckCircle2,
  X,
  ChevronDown,
  Sparkles,
  Verified,
  BadgeCheck,
  User2,
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

const Profile = () => {
  const [activeTab, setActiveTab] = useState("public-profile");

  // State management
  const [fullName, setFullName] = useState("Joydeep Paul");
  const [username, setUsername] = useState("mr.paul_16");
  const [visibility, setVisibility] = useState("Public");
  const [activityStatus, setActivityStatus] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <div className="border border-[var(--border-light)]/50 flex overflow-hidden rounded-xl h-150 w-6xl bg-[var(--bg-main)] text-[var(--text-main)] shadow-2xl">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-[var(--border-light)]/30 flex flex-col bg-[var(--bg-sidebar,rgba(0,0,0,0.2))] select-none">
        <div className="px-4 pt-4 pb-2 text-sm uppercase tracking-wider text-[var(--text-main)] font-bold">
          Profile
        </div>

        {/* Scrollable Nav Links */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-6 text-xs font-medium">
          {/* Account Details */}
          <div className="space-y-0.5">
            {[
              { id: "public-profile", label: "Public profile", icon: User },
              {
                id: "account-security",
                label: "Account & Security",
                icon: Shield,
              },
              {
                id: "billing-subscriptions",
                label: "Billing & Plans",
                icon: CreditCard,
              },
              { id: "api-credentials", label: "Developer Keys", icon: Key },
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
                      layoutId="activeProfileSidebarTab"
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

          {/* Preferences Section */}
          <div className="space-y-0.5">
            <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-[var(--text-secondary)]/60 font-semibold">
              Preferences
            </div>
            {[
              { id: "notifications", label: "Notification feeds", icon: Bell },
              {
                id: "connected-apps",
                label: "Connected services",
                icon: Globe,
              },
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
                      layoutId="activeProfileSidebarTab"
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
        </div>
      </div>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <button className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-main)] p-1.5 rounded-md hover:bg-[var(--bg-hover,rgba(255,255,255,0.05))] transition-colors z-10">
          <X size={16} />
        </button>

        <div className="p-7 space-y-4 ">
          {/* Avatar & Header Section */}
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-[var(--text-main)]/50 text-xl font-bold border-2 border-[var(--border-light)]/40 shadow-inner">
                <User size={26} />
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[var(--bg-main)] text-[var(--text-main)]/50 border border-[var(--border-light)]/30 hover:scale-105 transition-transform shadow-md">
                <Camera size={12} />
              </button>
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                {fullName}
                <BadgeCheck size={14} className="text-blue-400" />
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                @{username} • Pro Member
              </p>
            </div>
          </div>

          <hr className="border-[var(--border-light)]/20" />

          {/* Section: Basic Information */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold tracking-wide text-[var(--text-main)]">
              Basic Information
            </h3>

            {/* Display Name */}
            <div className="flex items-start justify-between text-xs gap-4">
              <div className="w-1/3">
                <div className="text-[var(--text-main)] font-medium">
                  Display name
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Your name visible to collaborators.
                </div>
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-2/3 bg-[var(--bg-input,rgba(255,255,255,0.04))] border border-[var(--border-light)]/20 rounded-lg px-3 py-1.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Username */}
            <div className="flex items-start justify-between text-xs gap-4">
              <div className="w-1/3">
                <div className="text-[var(--text-main)] font-medium">
                  Username
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Unique handle for tags and URLs.
                </div>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-2/3 bg-[var(--bg-input,rgba(255,255,255,0.04))] border border-[var(--border-light)]/20 rounded-lg px-3 py-1.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

           
          </div>

          <hr className="border-[var(--border-light)]/20" />

          {/* Section: Privacy & Status */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold tracking-wide text-[var(--text-main)]">
              Privacy & Visibility
            </h3>

            {/* Profile Visibility */}
            <div className="flex items-start justify-between text-xs gap-4">
              <div>
                <div className="text-[var(--text-main)] font-medium">
                  Profile visibility
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Control who can view your activity and shared artifacts.
                </div>
              </div>
              <SegmentedControl
                options={["Public", "Team", "Private"]}
                value={visibility}
                onChange={setVisibility}
                layoutId="profileVisibilityPill"
              />
            </div>

            {/* Online Status Toggle */}
            <div className="flex items-start justify-between text-xs gap-6">
              <div>
                <div className="text-[var(--text-main)] font-medium">
                  Display online status
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Allow team members to see when you are active.
                </div>
              </div>
              <ToggleSwitch
                checked={activityStatus}
                onChange={setActivityStatus}
              />
            </div>

            {/* Email Digest Toggle */}
            <div className="flex items-start justify-between text-xs gap-6">
              <div>
                <div className="text-[var(--text-main)] font-medium">
                  Activity email summaries
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Receive a weekly summary of workspace changes and updates.
                </div>
              </div>
              <ToggleSwitch checked={emailAlerts} onChange={setEmailAlerts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
