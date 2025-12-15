"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { useSpeech } from "@/hooks/use-speech";
import { sendMessage, Message } from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "@/components/chat/audio-visualizer";
import { TutorAgent } from "@/lib/tutor-data";
import { TutorReportCard, TutorSessionResult } from "./tutor-report-card";
import { ArrowLeft, StopCircle } from "lucide-react";
import Link from "next/link";

interface TutorInterfaceProps {
    agent: TutorAgent;
}

export function TutorInterface({ agent }: TutorInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [sessionResult, setSessionResult] = useState<TutorSessionResult | null>(null);

    const { isListening, transcript, setTranscript, startListening, stopListening, isSpeaking, speechData, speak, stopSpeaking, unlockAudio } = useSpeech();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };



    const handleEndSession = async () => {
        setIsLoading(true);
        stopSpeaking();

        // Check if user has participated (at least one user message)
        const userHasParticipated = messages.some(m => m.role === "user");

        if (!userHasParticipated) {
            setSessionResult({
                status: 'fail',
                score: 0,
                title: "The Silent Observer",
                feedback: "Session ended without any student participation. No score can be awarded.",
                strengths: ["None observed"],
                weaknesses: ["Lack of participation"],
                recommendedCourses: ["Introduction to Active Learning"]
            });
            setSessionComplete(true);
            setIsLoading(false);
            return;
        }

        // Trigger report generation
        const endPrompt = `
            [SYSTEM: END SESSION]
            The session is over. Evaluate the student's performance based on the conversation history.
            
            SCORING RULES:
            - If the student answered questions correctly and showed understanding: Score 70-100 (Pass).
            - If the student struggled but showed effort: Score 40-69 (Fail/Needs Improvement).
            - If the student gave irrelevant or very poor answers: Score 0-39 (Fail).
            - If the student barely participated or ended immediately: Score 0 (Fail).

            Generate a JSON summary in this EXACT format:
            {
                "status": "pass" or "fail",
                "score": 0-100,
                "title": "A creative title based on performance (e.g., 'Python Master', 'Novice Learner', 'Promising Student')",
                "feedback": "A brief summary of how the student did.",
                "strengths": ["Strength 1", "Strength 2", "Strength 3"],
                "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
                "recommendedCourses": ["Course 1", "Course 2", "Course 3"]
            }
            
            Do not output anything else. Just the JSON.
        `;

        try {
            const responseText = await sendMessage([...messages], endPrompt, "");
            console.log("Report Response:", responseText);

            // Clean code blocks if present
            let cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

            const result = JSON.parse(cleanJson);
            setSessionResult(result);
            setSessionComplete(true);
        } catch (e) {
            console.error("Failed to generate report", e);
            // Fallback result
            setSessionResult({
                status: 'fail',
                score: 0,
                title: "Session Error",
                feedback: "Session completed, but report generation failed. Please try again.",
                strengths: ["Unknown"],
                weaknesses: ["System Error"],
                recommendedCourses: ["General Review"]
            });
            setSessionComplete(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = useCallback(async (text: string, hidden: boolean = false) => {
        if (!text.trim()) return;

        const userMessage: Message = { role: "user", parts: [{ text }] };
        if (!hidden) {
            setMessages((prev) => [...prev, userMessage]);
            setTranscript(""); // Clear transcript
        }

        setIsLoading(true);
        stopSpeaking();

        try {
            const systemInstruction = `
                You are ${agent.name}, a ${agent.role}.
                Description: ${agent.description}
                Expertise: ${agent.expertise.join(", ")}.
                Difficulty Level: ${agent.difficulty}.
                
                Your goal is to TEACH and MENTOR the student.
                - Be encouraging but correct mistakes.
                - Explain concepts clearly.
                - Use analogies where appropriate.
                - Keep responses concise (under 3 sentences) to keep the conversation flowing, unless a detailed explanation is requested.
                - Ask checking questions to ensure understanding.
                
                IMPORTANT: Do NOT output any JSON or special tokens during the conversation. Just chat naturally.
            `;

            const responseText = await sendMessage(
                hidden ? [] : [...messages],
                text,
                systemInstruction
            );

            const modelMessage: Message = { role: "model", parts: [{ text: responseText }] };

            if (isMounted.current && !sessionComplete) {
                setMessages((prev) => [...prev, modelMessage]);
                speak(responseText);
            }

        } catch (error) {
            console.error("Failed to send message", error);
            if (isMounted.current && !sessionComplete) {
                speak("I'm sorry, I'm having trouble connecting. Please try again.");
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, [agent, messages, sessionComplete, speak, stopSpeaking, setTranscript]);

    const handleStart = async () => {
        setIsStarted(true);
        setTranscript("");
        unlockAudio();
        const initialMessage = `Start the session. You are ${agent.name}, a ${agent.role}. Introduce yourself briefly and ask what the student would like to learn about ${agent.expertise[0]} today.`;
        await handleSend(initialMessage, true);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Track mounted state and cleanup
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            stopSpeaking();
        };
    }, [stopSpeaking]);

    // 1. Auto-Start Listening when AI stops speaking
    useEffect(() => {
        if (isStarted && messages.length > 0 && !isSpeaking && !isLoading && !isListening && !sessionComplete) {
            const timer = setTimeout(() => {
                startListening();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isSpeaking, isLoading, isListening, isStarted, sessionComplete, startListening, messages.length]);

    // 2. Auto-Send on Silence
    useEffect(() => {
        if (isListening && transcript.trim()) {
            const silenceTimer = setTimeout(() => {
                stopListening();
                handleSend(transcript);
            }, 2000);
            return () => clearTimeout(silenceTimer);
        }
    }, [transcript, isListening, handleSend, stopListening]);

    if (sessionComplete && sessionResult) {
        return <TutorReportCard result={sessionResult} onRestart={() => window.location.reload()} />;
    }

    return (
        <div className="flex flex-col h-[700px] w-full max-w-4xl mx-auto my-auto border-2 border-border rounded-none shadow-2xl bg-black/90 backdrop-blur-xl overflow-hidden relative">
            {/* Tech Grid Background */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Header - Control Panel Style */}
            <div className="relative z-10 p-4 border-b-2 border-border flex justify-between items-center bg-white/5">
                <div className="flex gap-4 items-center">
                    <Link href="/tutors">
                        <Button variant="outline" size="sm" className="border-white/50 hover:border-white">
                            <ArrowLeft className="w-4 h-4 mr-2" /> EXIT
                        </Button>
                    </Link>
                    <div className="h-8 w-[2px] bg-white/20" /> {/* Separator */}
                    <div className="flex flex-col">
                        <span className="font-bold text-lg uppercase tracking-wider text-white">{agent.name}</span>
                        <span className="text-[10px] text-primary uppercase tracking-widest">{agent.role}</span>
                    </div>
                </div>

                {isStarted ? (
                    <Button onClick={handleEndSession} variant="destructive" size="sm" className="font-mono uppercase tracking-widest">
                        <StopCircle className="w-4 h-4 mr-2" /> Terminate Session
                    </Button>
                ) : (
                    <Button onClick={handleStart} size="sm" className="bg-primary text-black font-bold uppercase tracking-widest hover:bg-primary/90">
                        Initialize Session
                    </Button>
                )}
            </div>

            {/* Main Display Area */}
            <div className="flex-1 overflow-hidden relative z-10">
                <AudioVisualizer isSpeaking={isSpeaking} isListening={isListening} speechData={speechData} />

                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Focus Ring */}
                    <div className="w-[400px] h-[400px] rounded-full border border-white/5 opacity-50" />
                    <div className="absolute w-[350px] h-[350px] rounded-full border border-primary/10 opacity-30" />

                    {/* Crosshairs */}
                    <div className="absolute top-1/2 left-4 w-4 h-[2px] bg-white/20" />
                    <div className="absolute top-1/2 right-4 w-4 h-[2px] bg-white/20" />
                    <div className="absolute top-4 left-1/2 w-[2px] h-4 bg-white/20" />
                    <div className="absolute bottom-4 left-1/2 w-[2px] h-4 bg-white/20" />
                </div>


            </div>

            {/* Footer - Status Log */}
            <div className="relative z-10 p-4 border-t-2 border-border flex justify-center items-center bg-black/40 min-h-[80px] font-mono text-sm uppercase tracking-widest">
                {isSpeaking ? (
                    <div className="flex items-center gap-2 text-primary animate-pulse">
                        <span className="w-2 h-2 bg-primary rounded-full" />
                        <span>{agent.name}_Transmitting...</span>
                    </div>
                ) : isListening ? (
                    <div className="flex items-center gap-2 text-red-500 animate-pulse">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        <span>Listening_Input...</span>
                    </div>
                ) : isLoading ? (
                    <div className="text-muted-foreground animate-pulse">
                        <span>Processing_Data...</span>
                    </div>
                ) : (
                    <div className="text-muted-foreground/50">
                        <span className="animate-pulse">_</span> Waiting_For_Response
                    </div>
                )}
            </div>
            {/* Hidden message list - Moved out of display area to prevent layout issues */}
            <div className="hidden">
                {messages.map((msg, i) => (
                    <ChatBubble key={i} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
