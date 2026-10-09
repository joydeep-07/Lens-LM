import React from "react";

const BlurCircle = ({
  top = "auto",
  left = "auto",
  right = "auto",
  bottom = "auto",
  color = "blue",
}) => {
  const googleColors = {
    blue: "var(--google-blue)",
    red: "var(--google-red)",
    yellow: "var(--google-yellow)",
    green: "var(--google-green)",
  };

  return (
    <div
      className="absolute -z-50 h-58 w-58 aspect-square rounded-full blur-3xl"
      style={{
        top,
        left,
        right,
        bottom,
        backgroundColor: googleColors[color] || googleColors.blue,
        opacity: 0.1,
      }}
    />
  );
};

export default BlurCircle;
