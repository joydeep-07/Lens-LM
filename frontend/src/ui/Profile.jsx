import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  CreditCard,
  Key,
  Bell,
  Globe,
  FolderKanban,
} from "lucide-react";

import Logout from "./Logout";
import ProfileSettings from "../settings/ProfileSettings";
// Import other component views here as you create them:
// import AccountSecurity from "../settings/AccountSecurity";
// import BillingPlans from "../settings/BillingPlans";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("public-profile");

  const navigationGroups = [
    {
      items: [
        { id: "public-profile", label: "Profile", icon: User },
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
      ],
    },
    {
      heading: "Preferences",
      items: [
        { id: "notifications", label: "Notification feeds", icon: Bell },
        { id: "connected-apps", label: "Connected services", icon: Globe },
      ],
    },
  ];

  // Flatten all navigation items into a single list for easy lookup
  const allTabs = navigationGroups.flatMap((group) => group.items);

  // Map active tab keys directly to component views
  const TAB_COMPONENTS = {
    "public-profile": <ProfileSettings />,
    // "account-security": <AccountSecurity />,
    // "billing-subscriptions": <BillingPlans />,
  };

  // Active tab helper data for placeholder rendering
  const activeTabItem = allTabs.find((tab) => tab.id === activeTab);
  const ActiveIcon = activeTabItem?.icon || FolderKanban;
  const tabLabel = activeTabItem?.label || activeTab.replace("-", " ");

  return (
    <div className="flex h-150 w-6xl overflow-hidden rounded-xl border border-[var(--border-light)]/50 bg-[var(--bg-main)] text-[var(--text-main)] shadow-2xl">
      {/* Sidebar Navigation */}
      <aside className="flex w-64 shrink-0 select-none flex-col border-r border-[var(--border-light)]/30 bg-[var(--bg-secondary)]/50">
        <div className="px-4 pb-2 pt-4 text-sm font-bold uppercase tracking-wider text-[var(--text-main)]/80">
          Profile
        </div>

        {/* Scrollable Nav Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-2 text-xs font-medium">
          {navigationGroups.map((group, index) => (
            <div key={index} className="space-y-0.5">
              {group.heading && (
                <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]/60">
                  {group.heading}
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex w-full items-center gap-2.5 rounded-xs px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "font-semibold text-[var(--text-main)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover,rgba(255,255,255,0.04))] hover:text-[var(--text-main)]"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeProfileSidebarTab"
                        className="absolute inset-0 z-0 rounded-xs bg-[var(--bg-card)]/50"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 35,
                        }}
                      />
                    )}

                    <Icon
                      size={15}
                      className={`z-10 shrink-0 ${
                        isActive ? "opacity-100" : "opacity-60"
                      }`}
                    />

                    <span className="z-10 truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-2">
          <Logout />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
        {TAB_COMPONENTS[activeTab] ? (
          TAB_COMPONENTS[activeTab]
        ) : (
          <div className="relative flex flex-1 select-none flex-col items-center justify-center p-8 text-center">
            <div className="relative z-10 flex max-w-sm flex-col items-center">
              {/* Dynamic Icon Container */}
              <div className="group relative mb-2 flex h-12 w-12 items-center justify-center rounded-2xl">
                <div className="absolute inset-0 opacity-50 transition-opacity group-hover:opacity-100" />
                <ActiveIcon className="relative z-10 h-7 w-7 text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-main)]" />
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold tracking-tight text-[var(--text-main)]">
                {tabLabel} Settings
              </h4>

              {/* Subtitle */}
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-[var(--text-secondary)] opacity-70">
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
      </main>
    </div>
  );
};

export default Profile;
