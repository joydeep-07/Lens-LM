import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const Logo = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Select all circle elements inside the container
      const circles = containerRef.current.querySelectorAll(".circle");

      circles.forEach((circle, index) => {
        // Randomize values slightly for each circle so they don't move in sync
        const randomDuration = 2 + index * 0.5; // e.g., 2s, 2.5s, 3s, 3.5s
        const randomX = (index % 2 === 0 ? 1 : -1) * (6 + index * 2);
        const randomY = -8 - index * 3;

        // Continuous floating / bouncing effect
        gsap.to(circle, {
          x: randomX,
          y: randomY,
          duration: randomDuration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.2, // Stagger start times
        });

        // Subtle pulsing scale effect for a bouncy feel
        gsap.to(circle, {
          scale: 1.08,
          duration: randomDuration * 0.8,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: index * 0.15,
        });
      });
    }, containerRef);

    return () => ctx.revert(); // Clean up animations on unmount
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-40 h-40 flex items-center justify-center"
    >
      {/* Blue Circle (Large - Top Left) */}
      <div className="circle absolute w-19.5 h-19.5 bg-blue-500 rounded-full top-1.5 left-4"></div>

      {/* Red Circle (Medium - Center/Right overlapping blue) */}
      <div className="circle absolute w-9.5 h-9.5 bg-red-500 rounded-full top-16 right-8 z-10"></div>

      {/* Yellow Circle (Medium - Bottom Center) */}
      <div className="circle absolute w-9.5 h-9.5 bg-amber-400 rounded-full bottom-4 right-8"></div>

      {/* Green Circle (Small - Top Right) */}
      <div className="circle absolute w-6 h-6 bg-green-500 rounded-full top-11 right-3"></div>
    </div>
  );
};

export default Logo;
