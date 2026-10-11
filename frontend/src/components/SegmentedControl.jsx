import React from "react";
import { motion } from "framer-motion";

const SegmentedControl = ({ options, value, onChange, layoutId }) => {
  return (
    <div className="relative flex shrink-0 rounded-xs border border-[var(--border-light)]/20 bg-[var(--bg-input,rgba(255,255,255,0.04))] p-1">
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            type="button"
            key={option}
            onClick={() => onChange(option)}
            className={`relative z-10 rounded-md px-3 py-1 text-xs transition-colors capitalize ${
              isActive
                ? "font-semibold text-[var(--text-main)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-xs bg-[var(--bg-active,rgba(255,255,255,0.12))] shadow-sm"
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

export default SegmentedControl;
