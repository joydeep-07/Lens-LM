// src/ui/ChatBot.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  CircleFadingPlus,
  Copy,
  Check,
  RotateCw,
  Volume2,
  VolumeX,
  Menu,
  X,
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
import Wifi from "./Wifi";
import ThoughtLine from "./ThoughtLine";
import StatusBadge from "./StatusBadge";

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState("");

  // Shared files state between ChatBot and Source panel
  const [files, setFiles] = useState([]);

  // Speech synthesis state
  const [speakingIndex, setSpeakingIndex] = useState(null);

  // Model & Level state selectors
  const [selectedModel, setSelectedModel] = useState("Nova Mini");
  const [selectedLevel, setSelectedLevel] = useState("High");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);

  // Mobile drawer states
  const [isMobileSourceOpen, setIsMobileSourceOpen] = useState(false);
  const [isMobileSidePanelOpen, setIsMobileSidePanelOpen] = useState(false);

  const models = ["Nova Mini", "Nova Pro", "Lens Ultra"];
  const levels = ["High", "Medium", "Low"];

  const messagesEndRef = useRef(null);
  const messagesEndMobileRef = useRef(null);

  // Auto-scroll to bottom smoothly when messages update or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    messagesEndMobileRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Track completed questions based on user message count (capped at 10)
  const completedQuestions = Math.min(
    messages.filter((msg) => msg.sender === "user").length,
    10,
  );

  // Initialize state from sessionStorage if available, default to 70
  const [leftWidth, setLeftWidth] = useState(() => {
    const savedWidth = sessionStorage.getItem("chatLeftWidth");
    return savedWidth ? parseFloat(savedWidth) : 70;
  });

  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;

    if (newWidth >= 40 && newWidth <= 75) {
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

    const lastUserMsgIndex = [...messages]
      .reverse()
      .findIndex((m) => m.sender === "user");
    if (lastUserMsgIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserMsgIndex;
    const lastUserText = messages[actualIndex].text;

    setMessages((prev) => prev.slice(0, actualIndex));
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

    const voices = window.speechSynthesis.getVoices();
    const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceUri);

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.pitch = 0.95;
    utterance.rate = 1.0;

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
    setFiles([]);
  };

  // Fetch messages and files when choosing an existing chat from the Chat History
  const handleResumeChat = async (chatId) => {
    setCurrentChatId(chatId);
    window.dispatchEvent(new CustomEvent("close-popup-modal"));
    setIsMobileSidePanelOpen(false);

    try {
      setIsLoading(true);
      const response = await api.get(endpoints.getChat(chatId));
      const chat = response.data.chat;
      if (chat) {
        if (chat.messages) {
          const formattedMessages = chat.messages.map((msg) => ({
            sender: msg.role === "user" ? "user" : "bot",
            text: msg.content,
            role: msg.role,
          }));
          setMessages(formattedMessages);
        }
        if (chat.files) {
          setFiles(chat.files);
        }
      }
    } catch (error) {
      console.error("Failed to load chat data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--main)] text-[var(--text-main)]">
      {/* ==================== DESKTOP LAYOUT (UNTOUCHED) ==================== */}
      <div className="hidden md:flex w-full h-full overflow-hidden">
        <div
          style={{ width: `${leftWidth}%` }}
          className="flex flex-col justify-between bg-[var(--bg-main)] rounded-xl border-r border-[var(--border-light)]/50 gap-2 p-2 shrink-0"
        >
          {/* Navbar */}
          <nav className="flex items-center justify-between rounded-xl px-3 py-2">
            <div className="flex gap-3 items-center">
              <img src="./logo.svg" className="h-8" alt="" />
              <h1 className="text-2xl text-[var(--text-main)]/80 font-light tracking-tight font-heading">
                Lens L<span className="text-lg ">M</span>.
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Wifi />
              <StatusBadge />
            </div>
          </nav>

          <div className="flex h-full gap-2 w-full overflow-hidden">
            <SidePanel
              onNewChat={handleNewChat}
              selectedVoiceUri={selectedVoiceUri}
              setSelectedVoiceUri={setSelectedVoiceUri}
              onResumeChat={handleResumeChat}
            />

            <div className="relative flex flex-1 flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto pb-4 px-0 z-10 space-y-4">
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
                            className={`max-w-[85%] px-4 py-2 text-xs ${
                              msg.sender === "user"
                                ? "bg-[var(--bg-secondary)] text-justify rounded-tl-xl rounded-tr-none rounded-bl-xl rounded-br-xl text-[var(--text-main)]/90 leading-relaxed border border-[var(--border-light)]"
                                : "text-[var(--text-main)] w-full text-[var(--text-main)]/90 leading-relaxed"
                            }`}
                          >
                            <RenderText text={msg.text} />

                            {msg.sender === "bot" && (
                              <div className="mt-3 flex items-center gap-3 text-[var(--text-muted)]">
                                <button
                                  onClick={() => handleCopy(msg.text)}
                                  className="transition-colors hover:text-[var(--text-main)]"
                                  title={copied ? "Copied!" : "Copy"}
                                >
                                  {copied ? (
                                    <Check
                                      size={15}
                                      strokeWidth={1.8}
                                      className="text-green-500"
                                    />
                                  ) : (
                                    <Copy size={15} strokeWidth={1.8} />
                                  )}
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

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-start"
                      >
                        <ThoughtLine
                          steps={[
                            "Reading the question",
                            "Searching your notes",
                            "Drafting an answer",
                          ]}
                          label="Thinking…"
                          doneLabel="Thought for"
                          fontSize={10}
                          breathPeriod={1.6}
                          breathDepth={0.5}
                          settleDuration={350}
                          settleBlur={2}
                          collapsible
                          collapseOnSettle
                          showTimer
                        />
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

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
                onOpenUpload={() => {
                  document.getElementById("source-file-input")?.click();
                }}
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
          <Source
            chatId={currentChatId}
            onChatCreated={(newId) => setCurrentChatId(newId)}
            files={files}
            setFiles={setFiles}
          />
        </div>
      </div>

      {/* ==================== MOBILE LAYOUT ==================== */}
      <div className="flex md:hidden flex-col w-full h-full overflow-hidden relative bg-[var(--bg-main)]">
        {/* Mobile Navbar */}
        <nav className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-light)]/50 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidePanelOpen(true)}
              className="p-1 rounded-lg text-[var(--text-main)] hover:bg-[var(--bg-secondary)]"
            >
              <Menu size={20} />
            </button>
            <img src="./logo.svg" className="h-7" alt="" />
            <h1 className="text-xl text-[var(--text-main)]/80 font-light tracking-tight font-heading">
              Lens L<span className="text-sm">M</span>.
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Wifi />
            <StatusBadge />
          </div>
        </nav>

        {/* Mobile Chat Area */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
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
                      className={`max-w-[87%] px-2 py-2 text-xs ${
                        msg.sender === "user"
                          ? "bg-[var(--bg-secondary)] text-justify rounded-tl-xl rounded-tr-none rounded-bl-xl rounded-br-xl text-[var(--text-main)]/90 leading-relaxed border border-[var(--border-light)]"
                          : "text-[var(--text-main)] w-full text-[var(--text-main)]/90 leading-relaxed"
                      }`}
                    >
                      <RenderText text={msg.text} />
                      {msg.sender === "bot" && (
                        <div className="mt-3 flex items-center gap-3 text-[var(--text-muted)]">
                          <button
                            onClick={() => handleCopy(msg.text)}
                            className="transition-colors hover:text-[var(--text-main)]"
                          >
                            {copied ? (
                              <Check size={15} className="text-green-500" />
                            ) : (
                              <Copy size={15} />
                            )}
                          </button>
                          <button
                            onClick={handleRegenerate}
                            className="transition-colors hover:text-[var(--text-main)]"
                          >
                            <RotateCw size={15} />
                          </button>
                          <button
                            onClick={() => handleListen(msg.text, index)}
                            className={`transition-colors hover:text-[var(--text-main)] ${speakingIndex === index ? "text-[var(--google-blue)]" : ""}`}
                          >
                            {speakingIndex === index ? (
                              <VolumeX size={15} />
                            ) : (
                              <Volume2 size={15} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <ThoughtLine
                  steps={[
                    "Reading the question",
                    "Searching your notes",
                    "Drafting an answer",
                  ]}
                  label="Thinking…"
                  doneLabel="Thought for"
                  fontSize={10}
                  collapsible
                  showTimer
                />
              )}
              <div ref={messagesEndMobileRef} />
            </div>
          )}
        </div>

        {/* Mobile Chat Input */}
        <div className="p-2 shrink-0">
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
            onOpenUpload={() => setIsMobileSourceOpen(true)}
          />
        </div>

        {/* ==================== MOBILE FRAMER MOTION DRAWERS ==================== */}
        <AnimatePresence>
          {/* Left Side Sliding Panel */}
          {isMobileSidePanelOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSidePanelOpen(false)}
                className="absolute inset-0 bg-black z-40 md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="absolute top-0 left-0 bottom-0 w-54 bg-[var(--bg-main)] border-r border-[var(--border-light)]/50 z-50 flex flex-col md:hidden shadow-2xl"
              >
                <div className="flex items-center justify-between p-3 border-b border-[var(--border-light)]/50 shrink-0">
                  <h2 className="text-lg font-light text-[var(--text-main)]/85 font-heading">
                    Menu
                  </h2>
                  <button
                    onClick={() => setIsMobileSidePanelOpen(false)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <SidePanel
                    onNewChat={() => {
                      handleNewChat();
                      setIsMobileSidePanelOpen(false);
                    }}
                    selectedVoiceUri={selectedVoiceUri}
                    setSelectedVoiceUri={setSelectedVoiceUri}
                    onResumeChat={handleResumeChat}
                  />
                </div>
              </motion.div>
            </>
          )}

          {/* Bottom Source Panel Drawer (70% Height) */}
          {isMobileSourceOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSourceOpen(false)}
                className="absolute inset-0 bg-black z-40 md:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute inset-x-0 bottom-0 top-[30%] bg-[var(--bg-main)] rounded-t-2xl border-t border-[var(--border-light)] z-50 flex flex-col md:hidden shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between p-2 border-b border-[var(--border-light)]/50 shrink-0">
                  <h2 className="text-lg font-light text-[var(--text-main)]/80 font-heading">
                    Sources
                  </h2>
                  <button
                    onClick={() => setIsMobileSourceOpen(false)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Source
                    chatId={currentChatId}
                    onChatCreated={(newId) => setCurrentChatId(newId)}
                    files={files}
                    setFiles={setFiles}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatBot;
