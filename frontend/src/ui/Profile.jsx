import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  CreditCard,
  Key,
  Camera,
  Mail,
  Bell,
  Globe,
  X,
  BadgeCheck,
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import Logout from "./Logout";
import api from "../api/axios";
import endpoints from "../api/endpoints";
import { updateUser } from "../redux/authSlice";

// Segmented Control
const SegmentedControl = ({ options, value, onChange, layoutId }) => {
  return (
    <div className="relative flex shrink-0 rounded-lg border border-[var(--border-light)]/20 bg-[var(--bg-input,rgba(255,255,255,0.04))] p-1">
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            type="button"
            key={option}
            onClick={() => onChange(option)}
            className={`relative z-10 rounded-md px-3 py-1 text-xs transition-colors ${
              isActive
                ? "font-semibold text-[var(--text-main)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-md bg-[var(--bg-active,rgba(255,255,255,0.12))] shadow-sm"
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

// Toggle Switch
const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked
          ? "bg-green-600"
          : "border border-[var(--border-light)]/20 bg-[var(--bg-input,rgba(255,255,255,0.1))]"
      }`}
    >
      <motion.div
        className="h-4 w-4 rounded-full bg-white shadow-md"
        animate={{ x: checked ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
};

// Generate a default name and username from the email address.
const getDefaultProfile = (email) => {
  const emailPrefix = email?.split("@")[0]?.trim() || "";

  return {
    name: emailPrefix,
    username: emailPrefix,
  };
};

const Profile = () => {
  const dispatch = useDispatch();

  const storedUser = useSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState("public-profile");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  const [visibility, setVisibility] = useState("Public");
  const [activityStatus, setActivityStatus] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Keep track of original values to detect changes
  const initialValuesRef = useRef({
    fullName: "",
    username: "",
    visibility: "Public",
    activityStatus: true,
    emailAlerts: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if current form values differ from initial values
  const hasChanges =
    !loading &&
    (fullName !== initialValuesRef.current.fullName ||
      username !== initialValuesRef.current.username ||
      visibility !== initialValuesRef.current.visibility ||
      activityStatus !== initialValuesRef.current.activityStatus ||
      emailAlerts !== initialValuesRef.current.emailAlerts);

  // Fetch the authenticated user's profile.
  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(endpoints.getMe);

        // Support common response formats:
        // { user: {...} } or { ...user }
        const user = response.data?.user ?? response.data;

        if (!user || !user.email) {
          throw new Error(
            "The server did not return the authenticated user's email.",
          );
        }

        if (cancelled) return;

        const normalizedEmail = user.email.trim().toLowerCase();
        const defaults = getDefaultProfile(normalizedEmail);

        const loadedName = user.name || user.fullName || defaults.name;
        const loadedUsername = user.username || defaults.username;

        setEmail(normalizedEmail);
        setFullName(loadedName);
        setUsername(loadedUsername);

        // Store initial values for change detection
        initialValuesRef.current = {
          fullName: loadedName,
          username: loadedUsername,
          visibility: "Public",
          activityStatus: true,
          emailAlerts: true,
        };

        // Populate Redux and localStorage with the fetched profile.
        dispatch(
          updateUser({
            ...user,
            email: normalizedEmail,
            name: loadedName,
            username: loadedUsername,
          }),
        );
      } catch (err) {
        if (cancelled) return;

        // Use existing Redux data if the request fails.
        if (storedUser?.email) {
          const normalizedEmail = storedUser.email.trim().toLowerCase();
          const defaults = getDefaultProfile(normalizedEmail);

          const loadedName =
            storedUser.name || storedUser.fullName || defaults.name;
          const loadedUsername = storedUser.username || defaults.username;

          setEmail(normalizedEmail);
          setFullName(loadedName);
          setUsername(loadedUsername);

          initialValuesRef.current = {
            fullName: loadedName,
            username: loadedUsername,
            visibility: "Public",
            activityStatus: true,
            emailAlerts: true,
          };

          setError(
            "Unable to refresh your profile. Showing your saved information.",
          );
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load your profile.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [dispatch]); // Fetch once when the component mounts.

  // Save profile changes to the backend.
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = fullName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (!trimmedUsername) {
      setError("Please enter a username.");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(trimmedUsername)) {
      setError(
        "Username must be 3–30 characters and contain only letters, numbers, and underscores.",
      );
      return;
    }

    setSaving(true);

    try {
      // Assumes your backend updates profiles using PATCH /auth/profile.
      const response = await api.patch(endpoints.updateProfile, {
        name: trimmedName,
        username: trimmedUsername,
      });

      const updatedUser =
        response.data?.user ?? response.data?.profile ?? response.data;

      // Update Redux and localStorage immediately.
      dispatch(
        updateUser({
          ...updatedUser,
          name: updatedUser.name || trimmedName,
          username: updatedUser.username || trimmedUsername,
          email: updatedUser.email || email,
        }),
      );

      const savedName = updatedUser.name || trimmedName;
      const savedUsername = updatedUser.username || trimmedUsername;

      setFullName(savedName);
      setUsername(savedUsername);

      // Reset initial values reference after successful save
      initialValuesRef.current = {
        fullName: savedName,
        username: savedUsername,
        visibility,
        activityStatus,
        emailAlerts,
      };

      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const navigationGroups = [
    {
      items: [
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

  return (
    <div className="flex h-150  w-6xl overflow-hidden rounded-xl border border-[var(--border-light)]/50 bg-[var(--bg-main)] text-[var(--text-main)] shadow-2xl">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--border-light)]/30 bg-[var(--bg-sidebar,rgba(0,0,0,0.2))]">
        <div className="px-4 pb-2 pt-4 text-sm font-bold uppercase tracking-wider">
          Profile
        </div>

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
                    className={`relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "font-semibold text-[var(--text-main)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover,rgba(255,255,255,0.04))] hover:text-[var(--text-main)]"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeProfileSidebarTab"
                        className="absolute inset-0 z-0 rounded-lg bg-[var(--bg-active,rgba(255,255,255,0.08))]"
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

        <Logout />
      </aside>

      {/* Main Content */}
      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
        {activeTab === "public-profile" ? (
          <form onSubmit={handleSaveProfile} className="space-y-5 p-7">
            {/* Header with Conditional Save Button at the top */}
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-5 min-w-0">
                <div className="group relative shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--border-light)]/40 text-[var(--text-main)]/50 shadow-inner">
                    <User size={26} />
                  </div>

                  <button
                    type="button"
                    title="Profile photo upload is not configured"
                    className="absolute bottom-0 right-0 rounded-full border border-[var(--border-light)]/30 bg-[var(--bg-main)] p-1.5 text-[var(--text-main)]/50 shadow-md transition-transform hover:scale-105"
                  >
                    <Camera size={12} />
                  </button>
                </div>

                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-base font-bold">
                    <span className="truncate">{fullName || "Your name"}</span>
                    <BadgeCheck size={14} className="shrink-0 text-green-500" />
                  </h2>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <span className="truncate">
                      {email || "Loading email..."}
                    </span>
                  </p>
                </div>
              </div>

              {/* Top Save Button (Only displays when changes are made) */}
              {hasChanges && (
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {saving ? "Saving changes..." : "Save changes"}
                </button>
              )}
            </div>

            <hr className="border-[var(--border-light)]/20" />

            {/* Feedback */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-xs text-green-500">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--text-secondary)]">
                <LoaderCircle size={18} className="animate-spin" />
                Loading your profile...
              </div>
            ) : (
              <>
                {/* Basic Information */}
                <section className="space-y-5">
                  <h3 className="text-sm font-bold tracking-wide">
                    Basic Information
                  </h3>

                  {/* Email */}
                  <div className="flex items-start justify-between gap-4 text-xs">
                    <div className="w-1/3 shrink-0">
                      <div className="font-medium">Email address</div>
                      <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        Your registered email address.
                      </div>
                    </div>

                    <input
                      type="email"
                      value={email}
                      readOnly
                      disabled
                      className="w-2/3 cursor-not-allowed rounded-lg border border-[var(--border-light)]/20 bg-[var(--bg-input,rgba(255,255,255,0.04))] px-3 py-2 text-xs text-[var(--text-secondary)] opacity-80 outline-none"
                    />
                  </div>

                  {/* Display Name */}
                  <div className="flex items-start justify-between gap-4 text-xs">
                    <div className="w-1/3 shrink-0">
                      <div className="font-medium">Name</div>
                      <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        The name displayed on your profile.
                      </div>
                    </div>

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setSuccess("");
                      }}
                      maxLength={80}
                      placeholder="Enter your name"
                      autoComplete="name"
                      className="w-2/3 rounded-lg border border-[var(--border-light)]/20 bg-[var(--bg-input,rgba(255,255,255,0.04))] px-3 py-2 text-xs transition-colors focus:border-green-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Username */}
                  <div className="flex items-start justify-between gap-4 text-xs">
                    <div className="w-1/3 shrink-0">
                      <div className="font-medium">Username</div>
                      <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        3–30 letters, numbers, or underscores.
                      </div>
                    </div>

                    <div className="w-2/3">
                      <div className="flex items-center rounded-lg border border-[var(--border-light)]/20 bg-[var(--bg-input,rgba(255,255,255,0.04))] px-3 focus-within:border-green-500/50">
                        <span className="text-xs text-[var(--text-secondary)]">
                          @
                        </span>

                        <input
                          type="text"
                          value={username}
                          onChange={(e) => {
                            setUsername(
                              e.target.value
                                .replace(/[^a-zA-Z0-9_]/g, "")
                                .slice(0, 30),
                            );
                            setSuccess("");
                          }}
                          minLength={3}
                          maxLength={30}
                          autoComplete="username"
                          placeholder="your_username"
                          className="min-w-0 flex-1 bg-transparent px-1.5 py-2 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-[var(--border-light)]/20" />

                {/* Privacy & Visibility */}
                <section className="space-y-5">
                  <h3 className="text-sm font-bold tracking-wide">
                    Privacy & Visibility
                  </h3>

                  <div className="flex items-start justify-between gap-4 text-xs">
                    <div>
                      <div className="font-medium">Profile visibility</div>
                      <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        Control who can view your activity and shared artifacts.
                      </div>
                    </div>

                    <SegmentedControl
                      options={["Public", "Team", "Private"]}
                      value={visibility}
                      onChange={(val) => {
                        setVisibility(val);
                        setSuccess("");
                      }}
                      layoutId="profileVisibilityPill"
                    />
                  </div>

                  <div className="flex items-start justify-between gap-6 text-xs">
                    <div>
                      <div className="font-medium">Display online status</div>
                      <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        Allow team members to see when you are active.
                      </div>
                    </div>

                    <ToggleSwitch
                      checked={activityStatus}
                      onChange={(val) => {
                        setActivityStatus(val);
                        setSuccess("");
                      }}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-6 text-xs">
                    <div>
                      <div className="font-medium">
                        Activity email summaries
                      </div>
                      <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        Receive a weekly summary of workspace changes and
                        updates.
                      </div>
                    </div>

                    <ToggleSwitch
                      checked={emailAlerts}
                      onChange={(val) => {
                        setEmailAlerts(val);
                        setSuccess("");
                      }}
                    />
                  </div>
                </section>
              </>
            )}
          </form>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 rounded-xl border border-[var(--border-light)]/30 p-4">
              <Shield size={24} className="text-[var(--text-secondary)]" />
            </div>

            <h3 className="text-sm font-semibold">
              {navigationGroups
                .flatMap((group) => group.items)
                .find((item) => item.id === activeTab)?.label || "Settings"}
            </h3>

            <p className="mt-2 max-w-xs text-xs leading-relaxed text-[var(--text-secondary)]">
              These settings are not configured yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
