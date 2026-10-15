// services/cloudinary.service.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lens_lm_chats",
    resource_type: "auto",
    public_id: (req, file) => {
      const cleanName = path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9]/g, "_");
      return `${Date.now()}_${cleanName}`;
    },
  },
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 5;

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".txt",
  ".doc",
  ".docx",
  ".md",
  ".csv",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
  ".js",
  ".py",
  ".jsx",
  ".html",
  ".css",
]);

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_REQUEST,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return callback(new Error("Unsupported file extension."));
    }
    callback(null, true);
  },
});

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};

export default cloudinary;
