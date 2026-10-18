const BASE_URL = "http://localhost:5000/api";

const endpoints = {
  // Health
  health: `${BASE_URL}/health`,

  // Authentication
  sendOTP: `${BASE_URL}/auth/send-otp`,
  verifyOTP: `${BASE_URL}/auth/verify-otp`,
  getMe: `${BASE_URL}/auth/me`,
  updateProfile: `${BASE_URL}/auth/profile`,
  logout: `${BASE_URL}/auth/logout`,

  // Chats
  createChat: `${BASE_URL}/auth/chats`,
  getChats: `${BASE_URL}/auth/chats`,
  // In endpoints.js
  renameChat: (chatId) =>
    `${BASE_URL}/auth/chats/${encodeURIComponent(chatId)}/rename`,
  getChat: (chatId) => `${BASE_URL}/auth/chats/${encodeURIComponent(chatId)}`,
  deleteChat: (chatId) =>
    `${BASE_URL}/auth/chats/${encodeURIComponent(chatId)}`,

  sendMessage: (chatId) =>
    `${BASE_URL}/auth/chats/${encodeURIComponent(chatId)}/messages`,

  // Files
  uploadFiles: (chatId) =>
    `${BASE_URL}/auth/chats/${encodeURIComponent(chatId)}/files`,
  downloadFile: (chatId, fileId) =>
    `${BASE_URL}/auth/chats/${encodeURIComponent(chatId)}/files/${encodeURIComponent(fileId)}/download`,
  deleteFile: (chatId, fileId) =>
    `${BASE_URL}/auth/chats/${encodeURIComponent(chatId)}/files/${encodeURIComponent(fileId)}`,
};

export default endpoints;
