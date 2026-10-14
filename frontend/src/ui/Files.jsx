import React, { useState, useEffect } from "react";
import {
  Search,
  FileText,
  Trash2,
  Download,
  Clock,
  LayoutGrid,
  Grid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SegmentedControl from "../components/SegmentedControl";
import DeleteModal from "../components/DeleteModal"; // Adjust path if needed
import api from "../api/axios";
import endpoints from "../api/endpoints";
import { formatDate } from "../utils/dateFormatter"; // Adjust path if needed

const Files = () => {
  const [filesList, setFilesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("Grid"); // "Grid" | "Tiles"
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Fetch all chats and extract all uploaded files on mount
  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(endpoints.getChats);
        const chats = response.data.chats || [];

        const detailedChatsPromises = chats.map((chat) =>
          api.get(endpoints.getChat(chat._id || chat.id)).catch(() => null),
        );

        const chatResponses = await Promise.all(detailedChatsPromises);

        let allFiles = [];
        chatResponses.forEach((res) => {
          if (res && res.data && res.data.chat) {
            const chat = res.data.chat;
            const chatFiles = chat.files || chat.sources || [];
            chatFiles.forEach((file) => {
              allFiles.push({
                ...file,
                id: file._id || file.id,
                chatId: chat._id || chat.id,
                chatTitle: chat.title || "Untitled Chat",
              });
            });
          }
        });

        setFilesList(allFiles);
      } catch (error) {
        console.error("Failed to fetch user files:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFiles();
  }, []);

  const handleOpenDeleteModal = (file) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      await api.delete(endpoints.deleteFile(fileToDelete.chatId, fileToDelete.id));
      setFilesList((prev) => prev.filter((file) => file.id !== fileToDelete.id));
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Failed to delete file.");
    } finally {
      setFileToDelete(null);
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const downloadEndpoint = endpoints.downloadFile
        ? endpoints.downloadFile(file.chatId, file.id)
        : `/chats/${file.chatId}/files/${file.id}/download`;

      const response = await api.get(downloadEndpoint, {
        responseType: "blob",
      });

      // Create a temporary object URL to trigger browser download
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.originalName || file.name || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert("Failed to download file.");
    }
  };

  const filteredFiles = filesList.filter((file) => {
    const query = searchQuery.toLowerCase().trim();
    const name = (file.originalName || file.name || "").toLowerCase();
    const chatTitle = (file.chatTitle || "").toLowerCase();
    return name.includes(query) || chatTitle.includes(query);
  });

  const getFileIcon = (fileName) => {
    if (!fileName) return "./icons.svg";
    const extension = fileName.split(".").pop().toLowerCase();

    if (["doc", "docx"].includes(extension)) return "./word.svg";
    if (["pdf"].includes(extension)) return "./pdf.svg";
    if (["xls", "xlsx", "csv"].includes(extension)) return "./excel.svg";
    if (["jpg", "png", "jpeg"].includes(extension)) return "./image.svg";
    if (["js", "jsx", "py", "html", "css"].includes(extension))
      return "./code.svg";
    if ([].includes(extension)) return "./html.svg";
    return "./icons.svg";
  };

  return (
    <>
      <div className="border border-[var(--border-light)]/50 flex flex-col overflow-hidden rounded-xl h-150 w-6xl bg-[var(--bg-main)] text-[var(--text-main)] shadow-2xl">
        {/* Header & Controls */}
        <div className="px-6 py-4 border-b border-[var(--border-light)]/40 flex items-center justify-between gap-4 shrink-0 bg-[var(--bg-secondary)]/30">
          <div className="flex items-center gap-3">
            <img src="./word.svg" className="w-4" />
            <h2 className="text-sm uppercase font-medium text-[var(--text-main)]/80 ">
              Documents
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[var(--bg-card)]/50 px-3 py-2 rounded-xs text-xs text-[var(--text-secondary)] border border-[var(--border-light)]/20 w-64">
              <Search size={14} className="opacity-50 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files or chats..."
                className="bg-transparent border-none outline-none w-full text-[var(--text-main)] placeholder:text-[var(--text-secondary)]/50 text-xs"
              />
            </div>

            {/* View Toggler */}
            <SegmentedControl
              options={["Grid", "Tiles"]}
              value={viewMode}
              onChange={setViewMode}
              layoutId="filesViewModePill"
            />
          </div>
        </div>

        {/* Files Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)]">
              Loading your files...
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
              <FileText
                size={32}
                className="text-[var(--text-muted)] opacity-40"
              />
              <h3 className="text-sm font-semibold text-[var(--text-main)]">
                No documents found
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Files you upload inside your chat sessions will appear here.
              </p>
            </div>
          ) : (
            /* Dynamic Animated Layout Rendering */
            <motion.div
              layout
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={
                viewMode === "Grid"
                  ? "grid grid-cols-1 md:grid-cols-3 gap-3"
                  : "grid grid-cols-2 md:grid-cols-4 gap-3"
              }
            >
              <AnimatePresence mode="popLayout">
                {filteredFiles.map((file) => {
                  const fileName =
                    file.originalName || file.name || "Untitled File";
                  const fileSize = file.size
                    ? (file.size / 1024).toFixed(1) + " KB"
                    : "";
                  const uploadDate = file.uploadedAt
                    ? formatDate(file.uploadedAt)
                    : "Recent";

                  return (
                    <motion.div
                      key={file.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="flex flex-col justify-between"
                    >
                      {viewMode === "Tiles" ? (
                        /* TILES VIEW (Card block layout) */
                        <div className="h-full flex flex-col justify-between gap-3 rounded-sm border border-[var(--border-light)]/20 bg-[var(--bg-card)]/40 p-4 transition-colors hover:border-[var(--border-light)]/60 text-left">
                          <div className="flex items-start justify-between">
                            <img
                              src={getFileIcon(fileName)}
                              className="h-10"
                              alt=""
                            />
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDownloadFile(file)}
                                title="Download file"
                                className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--google-blue)] transition-colors"
                              >
                                <Download size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(file)}
                                title="Delete file"
                                className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--google-red)] transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1 min-w-0">
                            <p
                              title={fileName}
                              className="truncate text-xs font-medium text-[var(--text-main)]"
                            >
                              {fileName}
                            </p>
                            <div className="flex justify-between">
                              <span className="inline-block truncate max-w-full bg-[var(--bg-secondary)]/60 py-0.5 rounded text-[10px] text-[var(--text-secondary)]">
                                <span>{uploadDate}</span>
                              </span>

                              <div className="flex items-center font-medium justify-between text-[10px] text-[var(--text-muted)] border-t border-[var(--border-light)]/10">
                                <span>{fileSize}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* GRID VIEW (Row list layout) */
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-light)]/20 bg-[var(--bg-card)]/40 p-3.5 transition-colors hover:border-[var(--border-light)]/60 w-full">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex w-8 shrink-0 items-center justify-center">
                              <img
                                src={getFileIcon(fileName)}
                                className="h-8"
                                alt=""
                              />
                            </div>

                            <div className="min-w-0">
                              <p
                                title={fileName}
                                className="truncate text-xs font-medium text-[var(--text-main)]"
                              >
                                {fileName}
                              </p>

                              <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                                {fileSize && <span>{fileSize}</span>}
                                <span>•</span>
                                <span>{uploadDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(file)}
                              title="Download file"
                              aria-label={`Download ${fileName}`}
                              className="p-1.5 rounded text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--google-blue)] transition-colors"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(file)}
                              title="Delete file"
                              aria-label={`Delete ${fileName}`}
                              className="p-1.5 rounded text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--google-red)] transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default Files;