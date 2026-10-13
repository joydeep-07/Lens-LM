import React from "react";

const variants = {
  text: "h-4 w-full",
  title: "h-6 w-3/4",
  paragraph: "h-3 w-full",
  avatar: "h-10 w-10",
  image: "aspect-video w-full",
  card: "h-32 w-full",
  button: "h-10 w-28",
  circle: "aspect-square",
  custom: "",
};

const rounding = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

/**
 * Reusable skeleton block.
 */
const SkeletonBlock = ({
  className = "",
  variant = "text",
  width,
  height,
  rounded = "md",
  animate = true,
}) => {
  const skeletonClasses = [
    "relative isolate overflow-hidden",
    "bg-[var(--bg-secondary)]",
    variants[variant] ?? variants.custom,
    rounding[rounded] ?? rounding.md,
    animate ? "before:absolute before:inset-0 before:-z-10" : "",
    animate
      ? "after:absolute after:inset-0 after:-translate-x-full after:animate-[skeleton-shimmer_1.6s_infinite]"
      : "",
    animate
      ? "after:bg-gradient-to-r after:from-transparent after:via-[var(--text-main)]/[0.06] after:to-transparent"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={skeletonClasses}
      style={{
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      }}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton component with reusable variants.
 *
 * Available variants:
 * text, title, paragraph, avatar, image, card,
 * button, circle, custom, profileSettings
 */
const Skeleton = ({
  className = "",
  variant = "text",
  width,
  height,
  count = 1,
  rounded = "md",
  animate = true,
}) => {
  // Profile Settings Skeleton
  if (variant === "profileSettings") {
    return (
      <>
        <style>
          {`
            @keyframes skeleton-shimmer {
              100% {
                transform: translateX(100%);
              }
            }
          `}
        </style>

        <div
          className={`space-y-6 w-full h-full p-2 ${className}`}
          aria-busy="true"
          aria-label="Loading profile settings"
        >
          {/* Profile Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <SkeletonBlock
                variant="avatar"
                className="h-16 w-16 shrink-0"
                rounded="full"
                animate={animate}
              />

              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock variant="text" width="140px" animate={animate} />

                <SkeletonBlock
                  variant="text"
                  width="190px"
                  height="12px"
                  animate={animate}
                />
              </div>
            </div>

            {/* Save Button */}
            <SkeletonBlock
              variant="button"
              width="120px"
              height="34px"
              rounded="md"
              className="shrink-0"
              animate={animate}
            />
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-[var(--border-light)]/20" />

          {/* Basic Information */}
          <section className="space-y-5">
            <SkeletonBlock variant="title" width="160px" animate={animate} />

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-start justify-between gap-4"
              >
                {/* Field Label and Description */}
                <div className="w-1/3 shrink-0 space-y-2">
                  <SkeletonBlock variant="text" width="85%" animate={animate} />

                  <SkeletonBlock
                    variant="paragraph"
                    width="95%"
                    animate={animate}
                  />

                  <SkeletonBlock
                    variant="paragraph"
                    width="65%"
                    animate={animate}
                  />
                </div>

                {/* Input Field */}
                <SkeletonBlock
                  variant="custom"
                  className="w-2/3"
                  height="36px"
                  rounded="sm"
                  animate={animate}
                />
              </div>
            ))}
          </section>

          {/* Divider */}
          <div className="h-px w-full bg-[var(--border-light)]/20" />

          {/* Privacy and Visibility */}
          <section className="space-y-6">
            <SkeletonBlock variant="title" width="190px" animate={animate} />

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-5"
              >
                {/* Setting Label and Description */}
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock
                    variant="text"
                    width="150px"
                    animate={animate}
                  />

                  <SkeletonBlock
                    variant="paragraph"
                    width="90%"
                    animate={animate}
                  />

                  <SkeletonBlock
                    variant="paragraph"
                    width="65%"
                    animate={animate}
                  />
                </div>

                {/* Visibility Selector / Toggle */}
                <SkeletonBlock
                  variant="custom"
                  width={item === 1 ? "120px" : "42px"}
                  height={item === 1 ? "32px" : "22px"}
                  rounded={item === 1 ? "md" : "full"}
                  className="shrink-0"
                  animate={animate}
                />
              </div>
            ))}
          </section>
        </div>
      </>
    );
  }

  // Default Skeleton Variants
  return (
    <>
      <style>
        {`
          @keyframes skeleton-shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>

      <div
        className="flex flex-col gap-3"
        aria-busy="true"
        aria-label="Loading"
      >
        {Array.from({ length: Math.max(0, count) }).map((_, index) => (
          <SkeletonBlock
            key={index}
            variant={variant}
            width={width}
            height={height}
            rounded={rounded}
            animate={animate}
            className={className}
          />
        ))}
      </div>
    </>
  );
};

export default Skeleton;
