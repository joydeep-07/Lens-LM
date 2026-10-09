
import React from "react";
import { BadgeCheck, FileText, Plus, Sparkles } from "lucide-react";
import Logo from "../components/Logo";

const EmptySource = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-8 text-center">
      {/* Skeleton Preview */}
      <div className="relative mb-8 w-full max-w-74">
        {/* Floating File Icon */}
        <div className="absolute -right-2 -top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] shadow-sm">
          <BadgeCheck size={19} strokeWidth={1.9} className="text-sky-600" />
        </div>

        {/* Document Skeleton */}
        <div className="rounded-2xl border border-[var(--border-light)] p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-34 animate-pulse rounded-full bg-[var(--border-light)]" />
              <div className="h-2 w-26 animate-pulse rounded-full bg-[var(--bg-secondary)]" />
            </div>
          </div>
          <div className="space-y-3">
            {" "}
            <div className="flex items-center justify-center">
              {" "}
              {/* <img
                src="/logo.png"
                className="h-24 w-24 object-contain"
                alt="Logo"
              />{" "} */}
              <Logo />
            </div>{" "}
          </div>
          {/* Bottom Skeleton */}
          <div className="mt-6 gap-2 border-t border-[var(--border-light)] pt-4">
            <h2 className="text-xl font-heading text-center font-light tracking-wide">
              Add your sources
            </h2>
          </div>
        </div>

        {/* Floating Plus Icon */}
        <div className="absolute -bottom-3 -left-3 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] shadow-sm">
          <Plus
            size={18}
            strokeWidth={1.8}
            className="text-[var(--accent-primary)]"
          />
        </div>
      </div>

      {/* Empty State Message */}
      <div className="max-w-sm">
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          Upload documents, PDFs, or text files to give your AI the context it
          needs to answer your questions.
        </p>

        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Your answers will be grounded in your sources.
        </p>
      </div>
    </div>
  );
};

export default EmptySource;

