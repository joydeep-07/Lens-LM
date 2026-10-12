import React, { useState, useEffect } from "react";
import { Volume2, Check, Mic, Play, Speaker } from "lucide-react";

const VoiceSelector = ({ selectedVoiceUri, setSelectedVoiceUri }) => {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();

      // Normalize and sort voices to ensure consistent appearance across browsers
      const sortedVoices = [...availableVoices].sort((a, b) => {
        // Prioritize natural / online voices for better cross-browser parity
        const aNatural = /natural|enhanced|premium/i.test(a.name) ? 1 : 0;
        const bNatural = /natural|enhanced|premium/i.test(b.name) ? 1 : 0;
        return bNatural - aNatural;
      });

      // Filter English voices first, fallback to all available voices
      const englishVoices = sortedVoices.filter((v) => v.lang.startsWith("en"));
      const displayVoices = (
        englishVoices.length > 0 ? englishVoices : sortedVoices
      ).slice(0, 10);

      setVoices(displayVoices);

      // Default selection to first available voice if none selected
      if (!selectedVoiceUri && displayVoices.length > 0) {
        setSelectedVoiceUri(displayVoices[0].voiceURI);
      }
    };

    updateVoices();
    if (
      typeof window.speechSynthesis !== "undefined" &&
      window.speechSynthesis.onvoiceschanged !== undefined
    ) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceUri, setSelectedVoiceUri]);

  // Clean voice name (removes vendor prefixes, locale artifacts, and trailing/leading hyphens)
  const getCleanName = (name) => {
    return name
      .replace(/Google|Microsoft|Apple|Desktop|Online \(Natural\)/gi, "")
      .replace(/English \(United States\)|English \(United Kingdom\)/gi, "")
      .replace(/[-–—]+/g, " ") // Replaces hyphens and dashes with spaces
      .replace(/\s+/g, " ") // Collapses multiple spaces
      .trim();
  };

  // Play demo speech sound for the given voice
  const speakDemo = (voice) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel(); // Stop any ongoing audio

    const voiceName = getCleanName(voice.name) || voice.name;
    const demoText = `Hi there, I'm ${voiceName}, nice to meet you`;

    const utterance = new SpeechSynthesisUtterance(demoText);
    utterance.voice = voice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  // Handle clicking on a voice card
  const handleVoiceSelect = (voice) => {
    setSelectedVoiceUri(voice.voiceURI);
    speakDemo(voice);
  };

  // Find currently selected voice object
  const selectedVoiceObj =
    voices.find((v) => v.voiceURI === selectedVoiceUri) || voices[0];
  const selectedCleanName = selectedVoiceObj
    ? getCleanName(selectedVoiceObj.name) || selectedVoiceObj.name
    : "None selected";

  return (
    <div className="border border-[var(--border-light)]/50 flex overflow-hidden rounded-xl h-150 w-6xl bg-[var(--bg-main)] text-[var(--text-main)] shadow-2xl">
      {/* Left Sidebar: Voice List Navigation */}
      <div className="w-64 border-r border-[var(--border-light)]/30 flex flex-col bg-[var(--bg-secondary)]/50 select-none">
        {/* Header showing current Voice Model Name */}
        <div className="px-4 pt-4 pb-2 border-b border-[var(--border-light)]/20">
          <div className="text-[15px] uppercase tracking-wider text-[var(--text-main)]/80 font-semibold mb-0.5">
            Active Voice Model
          </div>
        </div>

        {/* Scrollable Voice Nav Items */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 text-xs font-medium">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-[var(--text-secondary)]/60 font-semibold">
            Available Voices ({voices.length})
          </div>

          {voices.map((voice) => {
            const isSelected = selectedVoiceUri === voice.voiceURI;
            const cleanName = getCleanName(voice.name);

            return (
              <button
                key={voice.voiceURI}
                onClick={() => handleVoiceSelect(voice)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs transition-colors text-left relative ${
                  isSelected
                    ? "text-[var(--text-main)] font-semibold bg-[var(--bg-card)]/50"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover,rgba(255,255,255,0.04))]"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate z-10 min-w-0">
                  <Mic
                    size={14}
                    className={`shrink-0 ${
                      isSelected
                        ? "text-[var(--google-blue)] opacity-100"
                        : "opacity-60"
                    }`}
                  />
                  <span className="truncate">{cleanName || voice.name}</span>
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
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative p-4">
        {selectedVoiceObj ? (
          <div className="flex flex-col h-full justify-between ">
            {/* Top Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className=" w-8">
                  <img src="./logo.svg" alt="" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-main)]">
                    {selectedCleanName}
                  </h3>
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider mt-0.5">
                    Language: {selectedVoiceObj.lang} &bull; {" "}
                    {selectedVoiceObj.voiceURI}
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-[14px] font-medium text-[var(--text-main)]">
                  Voice Profile Details
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  This speech synthesis engine provides realistic text-to-speech
                  audio feedback. Selecting a voice updates the active assistant
                  persona sound profile across connected sessions.
                </p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-6 flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">
                Status:{" "}
                <span className="text-[var(--text-main)] font-medium">
                  Ready
                </span>
              </span>
              <button
                onClick={() => speakDemo(selectedVoiceObj)}
                className="flex items-center gap-2 px-4 py-2 rounded-xs bg-[var(--google-blue)] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
              >
                <Play size={13} fill="currentColor" />
                Test Voice Sample
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
  );
};

export default VoiceSelector;
