import { motion } from "framer-motion";

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

export default ToggleSwitch;