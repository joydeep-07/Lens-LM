const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


const endpoints = {
  // Health
  health: "/health",

  // Authentication
  sendOTP: "/auth/send-otp",
  verifyOTP: "/auth/verify-otp",
  getMe: "/auth/me",
  updateProfile: "/auth/profile",
  logout: "/auth/logout",

  // Chats
  createChat: "/auth/chats",
  getChats: "/auth/chats",

  renameChat: (chatId) =>
    `/auth/chats/${encodeURIComponent(chatId)}/rename`,

  getChat: (chatId) =>
    `/auth/chats/${encodeURIComponent(chatId)}`,

  deleteChat: (chatId) =>
    `/auth/chats/${encodeURIComponent(chatId)}`,

  sendMessage: (chatId) =>
    `/auth/chats/${encodeURIComponent(chatId)}/messages`,

  // Files
  uploadFiles: (chatId) =>
    `/auth/chats/${encodeURIComponent(chatId)}/files`,

  downloadFile: (chatId, fileId) =>
    `/auth/chats/${encodeURIComponent(chatId)}/files/${encodeURIComponent(fileId)}/download`,

  deleteFile: (chatId, fileId) =>
    `/auth/chats/${encodeURIComponent(chatId)}/files/${encodeURIComponent(fileId)}`,
};



export default endpoints;
