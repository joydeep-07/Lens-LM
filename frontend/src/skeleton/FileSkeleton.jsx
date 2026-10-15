import React from "react";

const FileSkeleton = ({ viewMode = "Grid" }) => {
  // Determine grid columns based on viewMode matching your main component
  const gridClassName =
    viewMode === "Grid"
      ? "grid grid-cols-1 md:grid-cols-3 gap-3"
      : "grid grid-cols-2 md:grid-cols-4 gap-3";

  // Generate an array of placeholder items (e.g., 6 items for loading state)
  const skeletons = Array.from({ length: 6 });

  return (
    <div className={gridClassName}>
      {skeletons.map((_, index) => (
        <div key={index} className="flex flex-col justify-between">
          {viewMode === "Tiles" ? (
            /* TILES VIEW SKELETON (Card block layout) */
            <div className="h-full flex flex-col justify-between gap-3 rounded-sm border border-[var(--border-light)]/20 bg-[var(--bg-card)]/40 p-4 animate-pulse">
              <div className="flex items-start justify-between">
                {/* File Icon placeholder */}
                <div className="h-10 w-8 bg-[var(--border-light)]/30 rounded" />
                {/* Action buttons placeholder */}
                <div className="flex items-center gap-1">
                  <div className="h-5 w-5 bg-[var(--border-light)]/30 rounded" />
                  <div className="h-5 w-5 bg-[var(--border-light)]/30 rounded" />
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                {/* File name placeholder */}
                <div className="h-3.5 bg-[var(--border-light)]/30 rounded w-3/4" />
                <div className="flex justify-between items-center pt-1">
                  {/* Upload date placeholder */}
                  <div className="h-3 bg-[var(--border-light)]/20 rounded w-1/3" />
                  {/* File size placeholder */}
                  <div className="h-3 bg-[var(--border-light)]/20 rounded w-1/4" />
                </div>
              </div>
            </div>
          ) : (
            /* GRID VIEW SKELETON (Row list layout) */
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-light)]/20 bg-[var(--bg-card)]/40 p-3.5 w-full animate-pulse">
              <div className="flex items-center gap-3 min-w-0 w-full">
                {/* File Icon placeholder */}
                <div className="flex w-8 shrink-0 items-center justify-center">
                  <div className="h-8 w-8 bg-[var(--border-light)]/30 rounded" />
                </div>

                <div className="min-w-0 space-y-1.5 w-full">
                  {/* File name placeholder */}
                  <div className="h-3.5 bg-[var(--border-light)]/30 rounded w-2/3" />
                  {/* Metadata placeholder */}
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 bg-[var(--border-light)]/20 rounded w-12" />
                    <div className="h-2.5 bg-[var(--border-light)]/20 rounded w-16" />
                  </div>
                </div>
              </div>

              {/* Action buttons placeholder */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="h-6 w-6 bg-[var(--border-light)]/30 rounded" />
                <div className="h-6 w-6 bg-[var(--border-light)]/30 rounded" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileSkeleton;
