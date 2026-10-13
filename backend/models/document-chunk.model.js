import mongoose from "mongoose";

// ======================================================
// DocumentChunk — one chunk of extracted text from an
// uploaded file, stored alongside its embedding vector.
//
// Lives in its own collection so it never touches the
// strict Chat schema.
// ======================================================

const documentChunkSchema = new mongoose.Schema(
  {
    // --- Ownership / isolation ---
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // --- Source file ---
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
      maxlength: 255,
    },

    // --- Chunk location ---
    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    pageNumber: {
      type: Number,
      default: null,
    },

    // --- Content ---
    text: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    // --- Embedding vector (384-dim for all-MiniLM-L6-v2) ---
    embedding: {
      type: [Number],
      required: true,
    },

    // --- TTL: auto-delete after 30 days ---
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30, // 30 days in seconds
    },
  },
  {
    versionKey: false,
    // No strict: "throw" here — we own this schema entirely.
  },
);

// Compound index for fast per-chat retrieval.
documentChunkSchema.index({ chatId: 1, fileId: 1 });

// Compound index for fast user-scoped isolation checks.
documentChunkSchema.index({ userId: 1, chatId: 1 });

const DocumentChunk = mongoose.model("DocumentChunk", documentChunkSchema);

export default DocumentChunk;
