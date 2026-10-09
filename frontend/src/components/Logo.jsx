import React from "react";
// import {asistant} from "../assets/animation/asistant.json"
const Logo = () => {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Blue Circle (Large - Top Left) */}
      <div className="absolute w-19.5 h-19.5 bg-blue-500 rounded-full top-1.5 left-4"></div>

      {/* Red Circle (Medium - Center/Right overlapping blue) */}
      <div className="absolute w-9.5 h-9.5 bg-red-500 rounded-full top-16 right-8 z-10"></div>

      {/* Yellow Circle (Medium - Bottom Center) */}
      <div className="absolute w-9.5 h-9.5 bg-amber-400 rounded-full bottom-4 right-8"></div>

      {/* Green Circle (Small - Top Right) */}
      <div className="absolute w-6 h-6 bg-green-500 rounded-full top-11 right-3"></div>
    </div>
  );
};

export default Logo;
