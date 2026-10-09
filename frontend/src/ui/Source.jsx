import React, { useRef, useState } from "react";
import { FileText, Plus, File, X, Upload } from "lucide-react";

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
    <div className="hidden w-4/10 flex-col gap-3 border-l border-[var(--border-light)] p-3 md:flex h-full">
      {/* Sources Navbar */}
      <nav className="flex items-center justify-between rounded-xl border border-[var(--border-light)] px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText
            size={18}
            strokeWidth={1.8}
            className="text-[var(--text-secondary)]"
          />

          <h2 className="text-base font-medium">Sources</h2>

          {files.length > 0 && (
            <span className="rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
              {files.length}
            </span>
          )}
        </div>

        <button
          type="button"
          title="Add sources"
          aria-label="Add sources"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
        >
          <Plus size={19} strokeWidth={1.8} />
        </button>
      </nav>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.doc,.docx,.md,.csv"
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {/* Sources Content */}
      <div className="flex flex-1 flex-col justify-between gap-4 overflow-y-auto">
        {/* Top Section: Selected Files & Empty State */}
        <div className="flex flex-col gap-4">
          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Added files</h3>

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
                  className="flex items-center gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-secondary)]">
                    <File
                      size={19}
                      strokeWidth={1.7}
                      className="text-[var(--text-secondary)]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>

                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
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

          {/* Empty State */}
          {files.length === 0 && (
            <div className="px-4 py-3 text-center">
              <p className="text-xs leading-5 text-[var(--text-muted)]">
                Your added documents will appear here. Upload sources to start
                asking questions about their content.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Section: Redesigned Drag and Drop Area */}
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
          className={`mt-auto flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed  border-[var(--border-light)] bg-[var(--bg-card)] px-4 py-4 text-center transition-all focus-within:border-[var(--accent-primary)] hover:border-[var(--accent-primary)] shadow-sm h-32 ${
            isDragging
              ? "border-[var(--accent-primary)] bg-[var(--bg-secondary)]"
              : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
              <Upload size={16} strokeWidth={1.8} />
            </div>
            <h3 className="text-sm font-medium">
              {isDragging ? "Drop your files here" : "Add your sources"}
            </h3>
          </div>

          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            PDF, TXT, DOC, DOCX, MD, CSV
          </p>
        </div>
      </div>
    </div>
  );
};

export default Source;
