import React, { useRef, useState } from "react";
import { FileText, Plus, File, X, Upload, Coffee, Dot } from "lucide-react";
import EmptySource from "./EmptySource";
import QrCode from "./QrCode";
import PopupModal from "../components/PopupModal";
const Source = () => {
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border-l border-[var(--border-light)]/50 p-2 h-full overflow-hidden bg-[var(--bg-main)]">
      {/* Sources Navbar */}
      <nav className="flex items-center justify-between rounded-xl px-4 py-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
         <img src="./icons.svg" className="w-10" alt="" />
          <h2 className="text-xl font-light font-heading"> Sources</h2>

          {files.length > 0 && (
            <span className="rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
              {files.length}
            </span>
          )}
        </div>

        <PopupModal
          icon={Coffee}
          title="Buy me a chai"
          ariaLabel="Buy me a chai"
        >
          <QrCode />
        </PopupModal>
      </nav>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.doc,.docx,.md,.csv,.jpg,.png"
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {/* Sources Content Area */}
      <div className="flex flex-1 flex-col justify-between gap-4 overflow-hidden">
        {/* Top Section: Empty State or Added Files */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {files.length === 0 ? (
            <EmptySource />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Added files
                </h3>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
                >
                  Clear all
                </button>
              </div>

              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center gap-3 rounded-sm border border-[var(--border-light)]/10 bg-[var(--bg-card)]/30 p-3 transition-all hover:border-[var(--border-light)]/50"
                >
                  <div className="flex w-7 shrink-0 items-center justify-cente">
                    {/* <File
                      size={20}
                      strokeWidth={1.7}
                      className="text-[var(--text-secondary)]"
                    /> */}

                    <img src="./word.svg" className="h-8.5" alt="" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      title={file.name}
                      className="truncate text-sm font-medium tracking-tight text-[var(--text-primary)]"
                    >
                      {file.name}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>{(file.size / 1024).toFixed(1)} KB</span>

                      <span className="h-1 w-1 rounded-full bg-[var(--text-muted)]/50" />

                      <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]/80 ">
                        Ready
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    title={`Remove ${file.name}`}
                    aria-label={`Remove ${file.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile(index);
                    }}
                    className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
                  >
                    <X size={16} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section: Drag and Drop Area */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group shrink-0 mt-auto flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 text-center transition-all duration-200 ${
            isDragging
              ? "border-[var(--accent-primary)] bg-[var(--bg-secondary)] scale-[0.99]"
              : "border-[var(--border-light)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-secondary)]/50"
          }`}
        >
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">
            <Upload size={16} strokeWidth={1.8} />
          </div>

          <h3 className="text-sm font-light tracking-tight text-[var(--text-main)]">
            {isDragging ? "Drop to upload" : "Drag files here or browse"}
          </h3>

          {/* Supported File Types */}
          <div className="mt-2.5 flex flex-wrap justify-center items-center gap-1">
            {["PDF", "TXT", "DOCX", "MD", "JPG", "PNG"].map((type) => (
              <span
                key={type}
                className="rounded border border-[var(--border-light)] px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-[var(--text-muted)] bg-[var(--bg-secondary)]/30"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Source;
