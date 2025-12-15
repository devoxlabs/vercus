"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useSpeech() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
    const [speechData, setSpeechData] = useState<{ lastWordTimestamp: number, charIndex: number }>({ lastWordTimestamp: 0, charIndex: 0 });
    const [error, setError] = useState<string | null>(null);
    const isStarting = useRef(false);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const startListening = useCallback(() => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Web Speech API is not supported in this browser. Please use Chrome.");
            return;
        }

        if (isStarting.current || isListening) return;

        isStarting.current = true;
        setError(null);

        // Stop any existing instance
        if (recognitionInstance) {
            recognitionInstance.stop();
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            isStarting.current = false;
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const currentTranscript = Array.from(event.results)
                .map((result: any) => result[0].transcript)
                .join("");
            setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
            isStarting.current = false;
            if (event.error === 'no-speech') {
                return;
            }

            if (event.error === 'network') {
                console.warn("Speech recognition network error - attempting retry logic in UI");
            } else {
                console.error("Speech recognition error", event.error);
            }

            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            isStarting.current = false;
            setIsListening(false);
        };

        try {
            recognition.start();
            setRecognitionInstance(recognition);
        } catch (e) {
            console.error("Failed to start recognition", e);
            isStarting.current = false;
            setIsListening(false);
        }
    }, [isListening, recognitionInstance]);

    const stopListening = useCallback(() => {
        if (recognitionInstance) {
            recognitionInstance.stop();
            setIsListening(false);
        }
    }, [recognitionInstance]);

    const speak = useCallback((text: string, interrupt: boolean = true) => {
        if (!("speechSynthesis" in window)) {
            alert("Text-to-Speech is not supported in this browser.");
            return;
        }

        // Only cancel if interrupt is requested (default true)
        if (interrupt) {
            window.speechSynthesis.cancel();
        }

        // Preprocess text for better pronunciation
        const processedText = text
            .replace(/Next\.js/gi, "Next J S")
            .replace(/Node\.js/gi, "Node J S")
            .replace(/Vue\.js/gi, "Vue J S")
            .replace(/React\.js/gi, "React J S")
            .replace(/Express\.js/gi, "Express J S");

        const utterance = new SpeechSynthesisUtterance(processedText);

        // Smart Voice Selection
        // Priority: Google US English -> Microsoft Zira -> First English Voice
        const preferredVoice = voices.find(v => v.name === "Google US English") ||
            voices.find(v => v.name.includes("Google") && v.lang.includes("en-US")) ||
            voices.find(v => v.name.includes("Microsoft Zira")) ||
            voices.find(v => v.lang.includes("en-US"));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // Slight adjustments for more natural flow
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                setSpeechData({
                    lastWordTimestamp: Date.now(),
                    charIndex: event.charIndex
                });
            }
        };

        // We set isSpeaking true immediately to prevent race conditions with UI
        setIsSpeaking(true);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false); // Safety

        window.speechSynthesis.speak(utterance);
    }, [voices]);

    const speakQueue = useCallback((text: string) => {
        speak(text, false);
    }, [speak]);

    const stopSpeaking = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const unlockAudio = useCallback(() => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    return {
        isListening,
        transcript,
        setTranscript,
        startListening,
        stopListening,
        isSpeaking,
        speechData,
        speak,
        speakQueue,
        stopSpeaking,
        unlockAudio,
        error,
    };
}
