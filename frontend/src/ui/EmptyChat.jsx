import React from "react";
import GradientText from "../components/GradientText";
import BlurCircle from "../components/BlurCircle";

const EmptyChat = () => {
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
      {/* Google Color Glow — Random Positions */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <BlurCircle top="15%" left="20%" color="blue" />
        <BlurCircle top="25%" right="15%" color="red" />
        <BlurCircle bottom="15%" left="35%" color="yellow" />
        <BlurCircle bottom="20%" right="25%" color="green" />
      </div>

      {/* Greeting */}
      <div className="relative z-10">
        <GradientText
          colors={["#4285F4", "#EA4335", "#FBBC04", "#34A853"]}
          animationSpeed={8}
          variant="linear"
          glow={0}
        >
          <h1 className="mb-1.5 font-heading text-6xl font-light tracking-tight text-[var(--text-main)]">
            Hello There!
          </h1>
        </GradientText>

        <p className="max-w-sm text-sm font-light leading-relaxed tracking-wide text-[var(--text-secondary)]">
          Upload documents, ask questions, and get intelligent answers, concise
          summaries, and clear explanations.
        </p>
      </div>

      {/* Suggestion Pills */}
      <div className="relative z-10 flex max-w-2xl flex-wrap items-center gap-2">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            className="
              flex w-fit max-w-full shrink-0 items-center
              rounded-full
              border border-[var(--border-light)]
              bg-[var(--bg-secondary)]
              px-4 py-3
              text-left
              transition-all duration-200
              hover:bg-[var(--bg-card)]
              active:scale-[0.99]
            "
          >
            <span className="mr-2 text-xs font-semibold text-[var(--text-main)]">
              {item.title}
            </span>

            <span className="text-xs font-normal text-[var(--text-main)] opacity-50">
              {item.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyChat;
