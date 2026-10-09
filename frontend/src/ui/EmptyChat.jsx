import React from "react";

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
    <div className="flex h-full flex-col justify-between px-8 py-10">
      {/* Greeting */}
      <div>
        <h1 className="mb-1.5 font-heading text-5xl font-light tracking-tight text-[var(--text-main)]">
          Hi There!
        </h1>
        <p className="text-[17px] text-[var(--text-muted)]">
          How can I help you today?
        </p>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap max-w-2xl items-center gap-2">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            className="
              flex w-fit max-w-full shrink-0
              items-center
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
