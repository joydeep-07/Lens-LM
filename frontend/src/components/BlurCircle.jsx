import React from "react";

const BlurCircle = ({
  top = "auto",
  left = "auto",
  right = "auto",
  bottom = "auto",
  color = "blue",
  size = "w-85 h-85", // Default size for ambient light
  opacity = 0.15, // Adjustable opacity
}) => {
  const googleColors = {
    blue: "var(--google-blue)",
    red: "var(--google-red)",
    yellow: "var(--google-yellow)",
    green: "var(--google-green)",
  };

  const selectedColor = googleColors[color] || googleColors.blue;

  return (
    <div
      className={`pointer-events-none absolute -z-10 rounded-full ${size}`}
      style={{
        top,
        left,
        right,
        bottom,
        opacity : 0.1,
        // Smooth radial gradient fading from 100% center opacity to completely transparent at the outer edge
        background: `radial-gradient(circle, ${selectedColor} 0%, transparent 70%)`,
      }}
    />
  );
};

export default BlurCircle;
