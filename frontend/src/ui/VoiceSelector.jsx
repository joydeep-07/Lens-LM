"use client";

import React, { useState, useEffect } from "react";
import { Volume2, Check, Mic, Play, Speaker } from "lucide-react";
import { motion } from "framer-motion"; // 1. Import motion
import Strands from "../components/Strands";

const VoiceSelector = ({ selectedVoiceUri, setSelectedVoiceUri }) => {
  const [voices, setVoices] = useState([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    const updateVoices = () => {
      if (!("speechSynthesis" in window)) return;

      const availableVoices = window.speechSynthesis.getVoices();

      // Sort voices to prioritize "Natural", "Enhanced", or "Premium" tags
      const sortedVoices = [...availableVoices].sort((a, b) => {
        const aNatural = /natural|enhanced|premium|online/i.test(a.name)
          ? 1
          : 0;
        const bNatural = /natural|enhanced|premium|online/i.test(b.name)
          ? 1
          : 0;
        return bNatural - aNatural;
      });

      // Filter for English voices first, or fallback to all voices if none found
      const englishVoices = sortedVoices.filter((v) => v.lang.startsWith("en"));
      const displayVoices =
        englishVoices.length > 0 ? englishVoices : sortedVoices;

      setVoices(displayVoices);

      // Auto-select the first best voice if none is selected
      if (!selectedVoiceUri && displayVoices.length > 0) {
        setSelectedVoiceUri(displayVoices[0].voiceURI);
      }
    };

    updateVoices();

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceUri, setSelectedVoiceUri]);

  const getCleanName = (name) => {
    return name
      .replace(/Google|Microsoft|Apple|Desktop|Online \(Natural\)/gi, "")
      .replace(/English \(United States\)|English \(United Kingdom\)/gi, "")
      .replace(/[-–—]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const speakDemo = (voice) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const voiceName = getCleanName(voice.name) || voice.name;
    const demoText = `Hello! I’m ${voiceName}, it’s a pleasure to meet you. I’m here to help whenever you need me!
`;

    const utterance = new SpeechSynthesisUtterance(demoText);
    utterance.voice = voice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    setIsSynthesizing(true);

    utterance.onend = () => setIsSynthesizing(false);
    utterance.onerror = () => setIsSynthesizing(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceSelect = (voice) => {
    setSelectedVoiceUri(voice.voiceURI);
    speakDemo(voice);
  };

  const selectedVoiceObj =
    voices.find((v) => v.voiceURI === selectedVoiceUri) || voices[0];
  const selectedCleanName = selectedVoiceObj
    ? getCleanName(selectedVoiceObj.name) || selectedVoiceObj.name
    : "None selected";

  return (
    <div className="border border-[var(--border-light)]/50 flex overflow-hidden rounded-xl h-150 w-6xl bg-[var(--bg-main)] text-[var(--text-main)] shadow-2xl">
      {/* Left Sidebar: Voice List Navigation */}
      <div className="w-64 border-r border-[var(--border-light)]/30 flex flex-col bg-[var(--bg-secondary)]/50 select-none shrink-0 z-10">
        <div className="px-4 pt-4 pb-2 border-b border-[var(--border-light)]/20">
          <div className="text-[13px] uppercase tracking-wider text-[var(--text-main)]/80 font-semibold mb-0.5">
            Voices Available ({voices.length})
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 text-xs font-medium">
          {voices.map((voice) => {
            const isSelected = selectedVoiceUri === voice.voiceURI;
            const cleanName = getCleanName(voice.name);

            return (
              <button
                key={voice.voiceURI}
                onClick={() => handleVoiceSelect(voice)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors text-left relative ${
                  isSelected
                    ? "text-[var(--text-main)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                }`}
              >
                {/* 2. Framer Motion layout transition background */}
                {isSelected && (
                  <motion.div
                    layoutId="activeVoiceTab"
                    className="absolute inset-0 bg-[var(--bg-card)]/50 rounded z-0"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                    }}
                  />
                )}

                <div className="flex items-center gap-2.5 truncate z-10 min-w-0">
                  <Mic
                    size={14}
                    className={`shrink-0 z-10 ${
                      isSelected
                        ? "text-[var(--google-blue)] opacity-100"
                        : "opacity-60"
                    }`}
                  />
                  <span className="truncate z-10">
                    {cleanName || voice.name}
                  </span>
                </div>

                {isSelected && (
                  <div className="h-4 w-4 rounded-full bg-[var(--google-blue)] flex items-center justify-center text-white shrink-0 z-10">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Main Content Panel */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        {/* Absolute Background Strands Layer */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-50">
          <div className="flex items-center justify-center w-full h-full">
            <Strands
              colors={[
                "#4285f4", // Google Blue
                "#ea4335", // Google Red
                "#fbbc05", // Google Yellow
                "#34a853", // Google Green
              ]}
              count={4}
              speed={0.5}
              amplitude={1}
              waviness={0.5}
              thickness={0.7}
              glow={1}
              taper={4}
              spread={1}
              intensity={0.6}
              saturation={2.5}
              opacity={0.8}
              scale={2}
              glass={false}
              refraction={1}
              dispersion={1}
              glassSize={1}
              hueShift={0}
            />
          </div>
        </div>

        {/* Foreground Content Body */}
        <div className="relative z-10 flex-1 flex flex-col justify-between p-6 h-full">
          {selectedVoiceObj ? (
            <div className="flex flex-col h-full justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 shrink-0">
                    <img src="./logo.svg" alt="" className="w-full h-auto" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-main)]">
                      {selectedCleanName}
                    </h3>
                    <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider mt-0.5">
                      Language: {selectedVoiceObj.lang} &bull;{" "}
                      {selectedVoiceObj.voiceURI}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                 
                  <p className="text-xs max-w-md text-[var(--text-secondary)] leading-relaxed">
                    Uses free native browser text-to-speech synthesis. Voices
                    adapt automatically based on your current browser and
                    operating system.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-light)]/10 flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">
                  Status:{" "}
                  <span className="text-[var(--text-main)] font-medium">
                    {isSynthesizing ? "Speaking..." : "Ready"}
                  </span>
                </span>
                <button
                  onClick={() => speakDemo(selectedVoiceObj)}
                  disabled={isSynthesizing}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--google-blue)] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Play size={13} fill="currentColor" />
                  {isSynthesizing ? "Playing..." : "Test Voice Sample"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Speaker
                size={32}
                className="text-[var(--text-secondary)] opacity-40 mb-2"
              />
              <p className="text-xs text-[var(--text-secondary)]">
                No voice selected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;
