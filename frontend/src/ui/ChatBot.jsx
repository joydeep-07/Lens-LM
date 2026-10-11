import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  CircleFadingPlus,
  Copy,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import endpoints from "../api/endpoints";
import RenderText from "../components/RenderText";

import Source from "./Source";
import EmptyChat from "./EmptyChat";
import SidePanel from "./SidePanel";
import ChatInput from "./ChatInput";
import NewChatButton from "./NewChatButton";

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Speech synthesis state
  const [speakingIndex, setSpeakingIndex] = useState(null);

  // Model & Level state selectors
  const [selectedModel, setSelectedModel] = useState("Nova Mini");
  const [selectedLevel, setSelectedLevel] = useState("High");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);

  const models = ["Nova Mini", "Nova Pro", "Lens Ultra"];
  const levels = ["High", "Medium", "Low"];

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom smoothly when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Track completed questions based on user message count (capped at 10)
  const completedQuestions = Math.min(
    messages.filter((msg) => msg.sender === "user").length,
    10,
  );

  // Initialize state from sessionStorage if available, default to 60
  const [leftWidth, setLeftWidth] = useState(() => {
    const savedWidth = sessionStorage.getItem("chatLeftWidth");
    return savedWidth ? parseFloat(savedWidth) : 60;
  });

  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;

    if (newWidth >= 60 && newWidth <= 80) {
      setLeftWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";

      setLeftWidth((currentWidth) => {
        sessionStorage.setItem("chatLeftWidth", currentWidth);
        return currentWidth;
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Send message handler
  const handleSend = async (textToSend = message) => {
    const text = typeof textToSend === "string" ? textToSend : message;
    if (!text.trim() || isLoading) return;

    const userMessage = { sender: "user", text: text, role: "user" };

    setMessages((prev) => [...prev, userMessage]);
    if (text === message) setMessage("");
    setIsLoading(true);

    try {
      let chatId = currentChatId;

      if (!chatId) {
        const createRes = await api.post(endpoints.createChat, {
          title: text.slice(0, 30),
        });
        chatId = createRes.data.chat.id;
        setCurrentChatId(chatId);
      }

      const response = await api.post(endpoints.sendMessage(chatId), {
        message: text,
        model: selectedModel,
      });

      const botReply = {
        sender: "bot",
        text: response.data.message,
        role: "assistant",
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "We're unable to connect to the backend server or process your request right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate last bot response
  const handleRegenerate = async () => {
    if (isLoading || messages.length === 0) return;

    // Find the last user message
    const lastUserMsgIndex = [...messages]
      .reverse()
      .findIndex((m) => m.sender === "user");
    if (lastUserMsgIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserMsgIndex;
    const lastUserText = messages[actualIndex].text;

    // Remove messages from the last user prompt onward
    setMessages((prev) => prev.slice(0, actualIndex));

    // Resend
    await handleSend(lastUserText);
  };

  // Text-to-speech reader
  const handleListen = (text, index) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleNewChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingIndex(null);
    setCurrentChatId(null);
    setMessages([]);
    setMessage("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--main)] text-[var(--text-main)]">
      {/* Left Panel */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="flex flex-col justify-between bg-[var(--bg-main)] rounded-xl border-r border-[var(--border-light)]/50 gap-2 p-2 shrink-0"
      >
        {/* Navbar */}
        <nav className="flex items-center justify-between rounded-xl px-3 py-2">
          <div className="flex gap-3 items-center">
            <img src="./logo.svg" className="h-8" alt="" />
            <h1 className="text-2xl font-light tracking-tight font-heading">
              Lens LM.
            </h1>
          </div>

          <NewChatButton onClick={handleNewChat} />
        </nav>

        <div className="flex h-full gap-2 w-full overflow-hidden">
          {/* Side Navigation Panel */}
          <SidePanel />

          {/* Main Chat Area */}
          <div className="relative flex flex-1 flex-col h-full overflow-hidden">
            {/* Chat Messages / Empty State Area */}
            <div className="flex-1 overflow-y-auto pb-4 px-2 z-10 space-y-4">
              {messages.length === 0 ? (
                <EmptyChat />
              ) : (
                <div className="flex flex-col gap-4 py-2">
                  <AnimatePresence>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`flex flex-col ${
                          msg.sender === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] px-4 py-3 text-xs ${
                            msg.sender === "user"
                              ? "bg-[var(--bg-secondary)] text-justify rounded-tl-xl rounded-tr-none rounded-bl-xl rounded-br-xl text-[var(--text-main)]/90 leading-relaxed border border-[var(--border-light)]"
                              : "text-[var(--text-main)] w-full text-[var(--text-main)]/90 leading-relaxed"
                          }`}
                        >
                          <RenderText text={msg.text} />

                          {/* Action Icons Below Bot Reply */}
                          {msg.sender === "bot" && (
                            <div className="mt-3 flex items-center gap-3 text-[var(--text-muted)]">
                              <button
                                onClick={() =>
                                  navigator.clipboard.writeText(msg.text)
                                }
                                className="transition-colors hover:text-[var(--text-main)]"
                                title="Copy"
                              >
                                <Copy size={15} strokeWidth={1.8} />
                              </button>
                              <button
                                onClick={handleRegenerate}
                                className="transition-colors hover:text-[var(--text-main)]"
                                title="Regenerate"
                              >
                                <RotateCw size={15} strokeWidth={1.8} />
                              </button>
                              <button
                                onClick={() => handleListen(msg.text, index)}
                                className={`transition-colors hover:text-[var(--text-main)] ${speakingIndex === index ? "text-[var(--google-blue)]" : ""}`}
                                title={
                                  speakingIndex === index
                                    ? "Stop reading"
                                    : "Listen"
                                }
                              >
                                {speakingIndex === index ? (
                                  <VolumeX size={15} strokeWidth={1.8} />
                                ) : (
                                  <Volume2 size={15} strokeWidth={1.8} />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Skeleton Loader */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-start"
                    >
                      <div className="max-w-[80%] px-4 py-3 text-sm w-full space-y-2">
                        <div className="h-2.5 w-32 animate-pulse rounded-full bg-[var(--border-light)]" />
                        <div className="h-2 w-24 animate-pulse rounded-full bg-[var(--bg-secondary)]" />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input Container Component */}
            <ChatInput
              message={message}
              setMessage={setMessage}
              handleSend={() => handleSend(message)}
              isLoading={isLoading}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              isModelDropdownOpen={isModelDropdownOpen}
              setIsModelDropdownOpen={setIsModelDropdownOpen}
              isLevelDropdownOpen={isLevelDropdownOpen}
              setIsLevelDropdownOpen={setIsLevelDropdownOpen}
              models={models}
              levels={levels}
              completedQuestions={completedQuestions}
            />
          </div>
        </div>
      </div>

      {/* Draggable Divider */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1.5 cursor-col-resize transition-colors bg-transparent flex items-center justify-center shrink-0"
        title="Drag to resize panels"
      >
        <div className="h-8 w-0.5 rounded-full bg-[var(--border-light)]" />
      </div>

      {/* Right Panel */}
      <div className="flex-1 h-full overflow-hidden">
        <Source />
      </div>
    </div>
  );
};

export default ChatBot;
