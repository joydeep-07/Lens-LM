import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      maxlength: 255,
    },

    storedName: {
      type: String,
      required: true,
      maxlength: 255,
    },

    mimeType: {
      type: String,
      required: true,
      maxlength: 100,
    },

    size: {
      type: Number,
      required: true,
      min: 1,
    },

    storagePath: {
      type: String,
      required: true,
      maxlength: 1000,
      select: false,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
  },
  {
    _id: true,
  },
);

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 50000,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    referencedFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  {
    _id: true,
  },
);

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "New Chat",
    },

    messages: {
      type: [messageSchema],
      default: [],
    },

    files: {
      type: [fileSchema],
      default: [],
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },
);

chatSchema.index({
  user: 1,
  updatedAt: -1,
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
