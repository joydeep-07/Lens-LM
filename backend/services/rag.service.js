// services/rag.service.js
import path from "path";
import PDFParser from "pdf2json";
import mammoth from "mammoth";
import { pipeline } from "@xenova/transformers";
import DocumentChunk from "../models/document-chunk.model.js";
import {
  getGroqChatCompletion,
  fetchFileContentFromUrl,
} from "./ai.service.js";

let embedder = null;
const getEmbedder = async () => {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
};

const generateEmbedding = async (text) => {
  const extractor = await getEmbedder();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
};

const cosineSimilarity = (a, b) => {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
};

export const warmUpEmbeddingModel = () => {
  getEmbedder()
    .then(() => console.log("[RAG] Embedding model ready."))
    .catch((err) => console.warn("[RAG] Warm-up failed:", err.message));
};

const extractTextFromPDFBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    pdfParser.on("pdfParser_dataError", (errData) =>
      reject(new Error(errData.parserError)),
    );
    pdfParser.on("pdfParser_dataReady", () => {
      try {
        const rawText = pdfParser.getRawTextContent();
        resolve(rawText || "");
      } catch (err) {
        reject(err);
      }
    });
    pdfParser.parseBuffer(buffer);
  });
};

const extractTextFromCloudinary = async (fileUrl, ext) => {
  const data = await fetchFileContentFromUrl(fileUrl, ext);
  if (ext === ".pdf") {
    return await extractTextFromPDFBuffer(data);
  } else if (ext === ".docx" || ext === ".doc") {
    const result = await mammoth.extractRawText({ buffer: data });
    return result.value || "";
  } else {
    return String(data);
  }
};

const chunkText = (text, size = 1000, overlap = 200) => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + size, cleaned.length);
    const chunk = cleaned.slice(start, end).trim();
    if (chunk.length > 20) chunks.push(chunk);
    if (end === cleaned.length) break;
    start = end - overlap;
  }
  return chunks;
};

export const indexChatFile = async (chat, file) => {
  const fileDoc = chat.files.id(file._id);
  if (!fileDoc) return;

  fileDoc.processingStatus = "processing";
  await chat.save();

  try {
    const ext = path.extname(file.originalName).toLowerCase();
    const rawText = await extractTextFromCloudinary(file.storagePath, ext);
    const textChunks = chunkText(rawText);

    if (textChunks.length === 0) {
      fileDoc.processingStatus = "completed";
      await chat.save();
      return;
    }

    const chunkDocs = [];
    for (let i = 0; i < textChunks.length; i++) {
      const embedding = await generateEmbedding(textChunks[i]);
      chunkDocs.push({
        chatId: chat._id,
        userId: chat.user,
        fileId: file._id,
        fileName: file.originalName,
        chunkIndex: i,
        text: textChunks[i],
        embedding,
      });
    }

    await DocumentChunk.deleteMany({ chatId: chat._id, fileId: file._id });
    await DocumentChunk.insertMany(chunkDocs);

    fileDoc.processingStatus = "completed";
    await chat.save();
    console.log(
      `[RAG] Indexed "${file.originalName}": ${chunkDocs.length} chunks.`,
    );
  } catch (error) {
    console.error(
      `[RAG] Indexing failed for "${file.originalName}":`,
      error.message,
    );
    fileDoc.processingStatus = "failed";
    await chat.save();
  }
};

export const getRagAnswer = async (chat, userMessage, modelName) => {
  const history = chat.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  if (chat.files.length === 0) {
    return getGroqChatCompletion(history, modelName);
  }

  const queryEmbedding = await generateEmbedding(userMessage);
  const allChunks = await DocumentChunk.find({
    chatId: chat._id,
    userId: chat.user,
  }).lean();

  if (allChunks.length === 0) {
    return getGroqChatCompletion(history, modelName);
  }

  const scored = allChunks.map((c) => ({
    ...c,
    score: cosineSimilarity(queryEmbedding, c.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, 5);

  let systemPrompt = `You are Lens LM, an advanced AI model specialized in Retrieval-Augmented Generation (RAG). Use the provided document context to answer the user accurately.`;

  if (topChunks.length > 0) {
    const context = topChunks
      .map((c, i) => `[Context ${i + 1} (${c.fileName})]\n${c.text}`)
      .join("\n\n");
    systemPrompt += `\n\nRetrieved Document Context:\n${context}`;
  }

  return getGroqChatCompletion(history, modelName, systemPrompt);
};

export const deleteChatChunks = async (chatId) => {
  try {
    await DocumentChunk.deleteMany({ chatId });
  } catch (error) {
    console.error("[RAG] Failed to delete chunks:", error.message);
  }
};
