
import React from "react";
import { BadgeCheck, FileText, Plus, Sparkles } from "lucide-react";
import Logo from "../components/Logo";

const EmptySource = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-8 text-center">
      {/* Skeleton Preview */}
      <div className="relative mb-8 w-full max-w-74">
       

        {/* Document Skeleton */}
        <div className="rounded-2xl shadow-sm">
          
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
          <div className="mt-6 gap-2 pt-4">
            <h2 className="text-xl font-light text-[var(--text-main)]/80 font-heading">
              Add your sources
            </h2>
          </div>
        </div>

        {/* Floating Plus Icon */}
       
      </div>

      {/* Empty State Message */}
      <div className="max-w-sm">
        <p className="text-xs font-medium leading-5 text-[var(--text-muted)]">
          Upload documents, PDFs, or text files to give your AI the context it
          needs to answer your questions.
        </p>

        
      </div>
    </div>
  );
};

export default EmptySource;

