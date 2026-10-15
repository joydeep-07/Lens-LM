// src/ui/Source.jsx
import React, { useRef, useState } from "react";
import {
  FileText,
  Plus,
  File,
  X,
  Upload,
  Coffee,
  Logs,
  Loader2,
} from "lucide-react";
import EmptySource from "./EmptySource";
import QrCode from "./QrCode";
import PopupModal from "../components/PopupModal";
import api from "../api/axios";
import endpoints from "../api/endpoints";

const Source = ({ chatId, onChatCreated, files, setFiles }) => {
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (selectedFiles) => {
    const newFilesArray = Array.from(selectedFiles);
    if (newFilesArray.length === 0) return;

    try {
      setIsUploading(true);
      let activeChatId = chatId;

      if (!activeChatId) {
        const createRes = await api.post(endpoints.createChat, {
          title: newFilesArray[0].name.slice(0, 30),
        });
        activeChatId = createRes.data.chat.id;
        if (onChatCreated) {
          onChatCreated(activeChatId);
        }
      }

      const formData = new FormData();
      newFilesArray.forEach((file) => {
        formData.append("files", file);
      });

      const response = await api.post(
        endpoints.uploadFiles(activeChatId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const uploadedFiles = response.data.files || newFilesArray;
      setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    } catch (error) {
      console.error("Failed to upload files:", error);
      alert(
        error.response?.data?.message ||
          "Failed to upload files. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const removeFile = async (fileId, indexToRemove) => {
    try {
      if (fileId && chatId) {
        await api.delete(endpoints.deleteFile(chatId, fileId));
      }
      setFiles((prevFiles) =>
        prevFiles.filter((_, index) => index !== indexToRemove),
      );
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Failed to delete file from server.");
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "./icons.svg";
    const extension = fileName.split(".").pop().toLowerCase();

    if (["doc", "docx"].includes(extension)) return "./word.svg";
    if (["pdf"].includes(extension)) return "./pdf.svg";
    if (["xls", "xlsx", "csv"].includes(extension)) return "./excel.svg";
    if (["jpg", "png", "jpeg"].includes(extension)) return "./image.svg";
    if (["js", "jsx", "py", "html", "css"].includes(extension))
      return "./code.svg";

    return "./icons.svg";
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border-l border-[var(--border-light)]/50 p-3 h-full overflow-hidden bg-[var(--bg-main)]">
      {/* Sources Navbar - hidden on mobile drawer since header handles it */}
      <nav className="hidden md:flex items-center justify-between rounded-xl px-3 py-2 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <button>
            <Logs size={20} strokeWidth={1.8} />
          </button>
          <h2 className="text-xl font-light text-[var(--text-main)]/80 font-heading">
            Sources
          </h2>

          {files.length > 0 && (
            <span className="rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
              {files.length}
            </span>
          )}
        </div>
        
       
          <QrCode />
        
      </nav>

      {/* Hidden File Input */}
      <input
        id="source-file-input"
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.doc,.docx,.md,.csv,.xls,.xlsx,.jpg,.png,.js,.py,.jsx,.html,.css"
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {/* Sources Content Area */}
      <div className="flex flex-1 flex-col justify-between gap-3 overflow-hidden">
        {/* Top Section: Empty State or Added Files */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {files.length === 0 && !isUploading ? (
            <div className="py-6 flex flex-col items-center justify-center h-full">
              <EmptySource />
            </div>
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
                  Clear list
                </button>
              </div>

              {files.map((file, index) => {
                const fileName =
                  file.originalName || file.name || "Untitled File";
                const fileSize = file.size
                  ? (file.size / 1024).toFixed(1) + " KB"
                  : "";
                const fileId = file._id || file.id;

                return (
                  <div
                    key={`${fileName}-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-[var(--border-light)]/20 bg-[var(--bg-card)]/40 p-2.5 transition-all hover:border-[var(--border-light)]/60"
                  >
                    <div className="flex w-7 shrink-0 items-center justify-center">
                      <img
                        src={getFileIcon(fileName)}
                        className="h-7 w-7 object-contain"
                        alt=""
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        title={fileName}
                        className="truncate text-xs font-medium tracking-tight text-[var(--text-primary)]"
                      >
                        {fileName}
                      </p>

                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        {fileSize && <span>{fileSize}</span>}
                        {fileSize && (
                          <span className="h-1 w-1 rounded-full bg-[var(--text-muted)]/50" />
                        )}
                        <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]/80">
                          Ready
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      title={`Remove ${fileName}`}
                      aria-label={`Remove ${fileName}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFile(fileId, index);
                      }}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
                    >
                      <X size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                );
              })}

              {/* Upload Loader State */}
              {isUploading && (
                <div className="flex items-center gap-3 rounded-lg border border-[var(--border-light)]/20 bg-[var(--bg-card)]/40 p-2.5 ">
                  <div className="flex w-7 shrink-0 items-center justify-center text-[var(--accent-primary)]">
                    <Loader2 size={22} className="animate-spin" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium tracking-tight text-[var(--text-primary)]">
                      Uploading files...
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                      Please wait while your files are processed
                    </p>
                  </div>
                </div>
              )}
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
          className={`group shrink-0 mt-auto flex h-24 md:h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-3 text-center transition-all duration-200 ${
            isDragging
              ? "border-[var(--accent-primary)] bg-[var(--bg-secondary)] scale-[0.99]"
              : "border-[var(--border-light)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-secondary)]/50"
          }`}
        >
          <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">
            {isUploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} strokeWidth={1.8} />
            )}
          </div>

          <h3 className="text-xs md:text-sm font-light tracking-tight text-[var(--text-main)]">
            {isUploading
              ? "Uploading files..."
              : isDragging
                ? "Drop to upload"
                : "Drag files here or browse"}
          </h3>

          {/* Supported File Types */}
          <div className="mt-2 flex flex-wrap justify-center items-center gap-1">
            {["PDF", "TXT", "DOCX", "MD", "JPG", "PNG"].map((type) => (
              <span
                key={type}
                className="rounded border border-[var(--border-light)] px-1.5 py-0.5 text-[8px] md:text-[9px] font-medium tracking-wide text-[var(--text-muted)] bg-[var(--bg-secondary)]/30"
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
