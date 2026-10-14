import React from "react";
import { easeInOut, motion } from "framer-motion";
import { useSelector } from "react-redux";
import GradientText from "../components/GradientText";

const EmptyChat = () => {
  const user = useSelector((state) => state.auth.user);

  // Determine greeting based on current time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) {
      return "Good Morning";
    } else if (hour < 16) {
      return "What's up";
    } else {
      return "Good Evening";
    }
  };

  // Get user name and randomly display last name, first name, or full name
  const getDisplayName = () => {
    const fullName = user?.name || user?.fullName || "";
    if (!fullName) return "";

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : firstName;

    const randomChoice = Math.random();
    if (randomChoice < 0.33) {
      return firstName; // Sometimes first name
    } else {
      return firstName; // you can dsplay last name
    } 
  };

  const greeting = getGreeting();
  const displayName = getDisplayName();
  const headingText = displayName
    ? `${greeting}, ${displayName}`
    : `${greeting}`;

  const suggestions = [
    {
      title: "Summarize",
      description: "Get a clear overview of the uploaded PDF",
    },
    {
      title: "Explain in simple terms",
      description: "Break down complex sections",
    },
    {
      title: "Find specific information",
      description: "Ask about any detail from the uploaded source",
    },
  ];

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden px-8 py-10">
      {/* Greeting */}
      <div className="relative z-10">
        <GradientText
          colors={["#4285F4", "#EA4335", "#FBBC04", "#34A853"]}
          animationSpeed={8}
          variant="linear"
          glow={0}
        >
          <h1 className="mb-4 font-heading text-5xl font-light tracking-tight text-[var(--text-main)]">
            {headingText}{" "}!
          </h1>
        </GradientText>

        <p className="max-w-lg text-xs font-normal leading-relaxed tracking-wide text-[var(--text-secondary)]">
          Upload documents, ask questions, and get intelligent answers, concise
          summaries, and clear explanations.
        </p>
      </div>

      {/* Suggestion Pills */}
      <div className="relative z-10 flex max-w-2xl flex-wrap items-center gap-2">
        {suggestions.map((item, idx) => (
          <motion.button
            key={idx}
            layout
            transition={{ duration: 0.3, ease: easeInOut }}
            whileHover={{ scale: 1 }}
            whileTap={{ scale: 0.99 }}
            className="
              flex w-fit max-w-full shrink-0 items-center
              rounded-full
              border border-[var(--border-light)]/50
              bg-[var(--bg-secondary)]/50
              px-4 py-3
              text-left
              transition-colors duration-200
              hover:bg-[var(--bg-card)]/50
            "
          >
            <span className="mr-2 text-xs font-semibold text-[var(--text-main)]">
              {item.title}
            </span>

            <span className="text-xs font-normal text-[var(--text-main)] opacity-50">
              {item.description}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default EmptyChat;
