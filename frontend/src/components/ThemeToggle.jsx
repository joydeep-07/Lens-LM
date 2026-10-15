// src/components/ThemeToggle.jsx
import React from "react";
import { Sun, Moon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/themeSlice";
import { motion } from "framer-motion";

const ThemeToggle = ({ showName = true, hideNameOnLaptop = true }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => dispatch(toggleTheme())}
        title="Toggle theme"
        aria-label="Toggle theme"
        className="w-full p-2.5 rounded-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors flex items-center justify-start md:justify-center gap-2"
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="shrink-0"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </motion.div>
        {showName && (
          <span
            className={`text-sm font-medium ${
              hideNameOnLaptop ? "lg:hidden" : "hidden lg:inline"
            }`}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
