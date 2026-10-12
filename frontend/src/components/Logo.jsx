import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const Logo = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const circles = container.querySelectorAll(".circle");

      circles.forEach((circle, index) => {
        const randomDuration = 2 + index * 0.5;

        // Make movement responsive to the container's current size
        // We calculate movement relative to container width so it scales proportionally
        const baseWidth = container.offsetWidth || 160;
        const scaleFactor = baseWidth / 160; // normalized against original 40rem (160px)

        const randomX =
          (index % 2 === 0 ? 1 : -1) * (6 + index * 2) * scaleFactor;
        const randomY = (-8 - index * 3) * scaleFactor;

        // Continuous floating / bouncing effect
        gsap.to(circle, {
          x: randomX,
          y: randomY,
          duration: randomDuration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.2,
        });

        // Subtle pulsing scale effect
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

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      /* w-36 h-36 on mobile, scaling up to w-48 h-48 on large screens (or use w-full max-w-[...]) */
      className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center transition-all duration-300"
    >
      {/* Blue Circle (Large - Top Left) */}
      <div className="circle absolute w-[48%] h-[48%] bg-blue-500 rounded-full top-[4%] left-[10%]"></div>

      {/* Red Circle (Medium - Center/Right overlapping blue) */}
      <div className="circle absolute w-[24%] h-[24%] bg-red-500 rounded-full top-[40%] right-[20%] z-10"></div>

      {/* Yellow Circle (Medium - Bottom Center) */}
      <div className="circle absolute w-[24%] h-[24%] bg-amber-400 rounded-full bottom-[10%] right-[20%]"></div>

      {/* Green Circle (Small - Top Right) */}
      <div className="circle absolute w-[15%] h-[15%] bg-green-500 rounded-full top-[28%] right-[8%]"></div>
    </div>
  );
};

export default Logo;
