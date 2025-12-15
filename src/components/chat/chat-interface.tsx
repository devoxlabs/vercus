"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import { useSpeech } from "@/hooks/use-speech";
import { sendMessage, Message } from "@/app/actions/chat";
import { INTERVIEWER_PERSONAS, STAGES } from "@/lib/prompts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ReportCard, StageResult } from "./report-card";
import { AudioVisualizer } from "./audio-visualizer";
import { cn } from "@/lib/utils";

type Difficulty = "Easy" | "Medium" | "Hard" | "Expert" | "CEO";
type Stage = "intro" | "technical" | "negotiation";

interface ChatInterfaceProps {
    topic: string;
    onBack: () => void;
    className?: string;
}

export function ChatInterface({ topic, onBack, className }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
    const [stage, setStage] = useState<Stage>("intro");
    const [isStarted, setIsStarted] = useState(false);

    const [isStageComplete, setIsStageComplete] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [stageResults, setStageResults] = useState<StageResult[]>([]);

    const { isListening, transcript, setTranscript, startListening, stopListening, isSpeaking, speechData, speak, speakQueue, stopSpeaking, unlockAudio } = useSpeech();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    // Stop speaking when moving to report card
    useEffect(() => {
        if (interviewComplete) {
            stopSpeaking();
        }
    }, [interviewComplete, stopSpeaking]);

    const handleSend = useCallback(async (text: string, hidden: boolean = false) => {
        if (!text.trim()) return;

        const userMessage: Message = { role: "user", parts: [{ text }] };
        if (!hidden) {
            setMessages((prev) => [...prev, userMessage]);
            setTranscript(""); // Clear transcript after sending
        }

        setIsLoading(true);
        stopSpeaking();

        try {
            const persona = INTERVIEWER_PERSONAS[topic] || INTERVIEWER_PERSONAS.default;
            const stageInstruction = STAGES[stage];
            const systemInstruction = `
        ${persona}
        Difficulty Level: ${difficulty}.
        Current Stage: ${stageInstruction}.
        
        Instructions:
        - You are Vercus, the AI Interviewer.
        - Your goal is to interview the candidate for a ${topic} role.
        - Ask ONE question at a time.
        - WAIT for the candidate to respond.
        - DO NOT simulate the candidate's response.
        - Keep your responses concise and professional.
        - If the candidate answers well, ask a harder follow-up.
        - If they struggle, provide a hint.
        - If you feel the candidate has passed this stage, include "[STAGE_COMPLETE]" in your response.
        
        HIDDEN SCORING RULES:
        - Maintain a hidden confidence score (0-100) for the candidate based on their answers.
        - CRITICAL: Do NOT fail the candidate immediately. You MUST wait for at least 3 user responses before making a pass/fail decision.
        - If the score drops below 40 after at least 3 exchanges, FAIL the candidate.
        - If the score is above 70 after sufficient evaluation (3-4 good answers), PASS the candidate.
        
        OUTPUT RULES:
        - STOP generating after asking your question.
        - If PASS: Say a transitional phrase like "That's good. Let's move on..." and append "[STAGE_COMPLETE]" at the very end.
        - If FAIL: Politely reject the candidate, explain why briefly, and append "[FAIL]" at the very end.
        - ALWAYS append a JSON summary block at the very end (after the token) in this format:
          [STAGE_SUMMARY] {
            "score": 0-100, 
            "title": "Fun Title based on performance", 
            "feedback": "Brief feedback", 
            "tips": ["Tip 1", "Tip 2"],
            "remedialTutor": {
                "name": "Creative Name (e.g., 'Professor Syntax')",
                "role": "Specific Role (e.g., 'Python Error Specialist')",
                "description": "A description of how this agent will help the user fix their specific mistakes from this interview.",
                "expertise": ["Skill 1", "Skill 2"]
            }
          }
          (NOTE: Only include 'remedialTutor' if the candidate FAILED or scored below 50. Otherwise, omit it.)
          
          SCORING GUIDELINES:
          - FAIL: Score MUST be between 0 and 49.
          - PASS: Score MUST be between 70 and 100.
          - Be harsh but fair. One word answers or "I don't know" should result in very low scores (0-20).

        - Otherwise: Continue the interview naturally.
      `;

            // Construct history for API
            let historyForApi = hidden ? [] : [...messages];

            // If history starts with model (e.g. after intro), prepend context
            if (historyForApi.length > 0 && historyForApi[0].role === "model") {
                historyForApi = [
                    { role: "user", parts: [{ text: `Start the ${difficulty} interview for the ${stage} stage. Topic: ${topic}.` }] },
                    ...historyForApi
                ];
            }

            const responseText = await sendMessage(
                historyForApi,
                text,
                systemInstruction
            );

            let cleanResponse = responseText;
            let action = null;
            let summaryData: any = null;

            // Extract JSON summary
            if (responseText.includes("[STAGE_SUMMARY]")) {
                const parts = responseText.split("[STAGE_SUMMARY]");
                cleanResponse = parts[0].trim();
                try {
                    summaryData = JSON.parse(parts[1].trim());
                } catch (e) {
                    console.error("Failed to parse stage summary JSON", e);
                }
            }

            // Extract Action Tokens
            if (cleanResponse.includes("[STAGE_COMPLETE]")) {
                cleanResponse = cleanResponse.replace("[STAGE_COMPLETE]", "").trim();
                action = "pass";
            } else if (cleanResponse.includes("[FAIL]")) {
                cleanResponse = cleanResponse.replace("[FAIL]", "").trim();
                action = "fail";
            }

            const modelMessage: Message = { role: "model", parts: [{ text: cleanResponse }] };

            if (isMounted.current && !interviewComplete) {
                setMessages((prev) => [...prev, modelMessage]);
                speak(cleanResponse);

                if (summaryData && action) {
                    // Determine fallback score based on action if AI failed to provide one
                    let finalScore = summaryData.score;
                    if (!finalScore) {
                        finalScore = action === "fail" ? 30 : 85;
                    }

                    const result: StageResult = {
                        stage: stage,
                        status: action === "fail" ? "failed" : "passed",
                        score: finalScore,
                        title: summaryData.title || "Participant",
                        feedback: summaryData.feedback || "No feedback provided.",
                        tips: summaryData.tips || [],
                        remedialTutor: summaryData.remedialTutor // Pass the generated tutor if present
                    };
                    setStageResults(prev => [...prev, result]);
                }

                if (action === "pass") {
                    setIsStageComplete(true);
                } else if (action === "fail") {
                    setHasFailed(true);
                }
            }
        } catch (error) {
            console.error("Failed to send message", error);
            // Provide audio feedback for error
            if (isMounted.current && !interviewComplete) {
                speak("I'm sorry, I'm having trouble connecting. Please try again.");
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, [messages, topic, difficulty, stage, speak, stopSpeaking, interviewComplete]);

    const handleStart = async () => {
        setIsStarted(true);
        setTranscript(""); // Clear any stale transcript
        unlockAudio(); // Prime the audio engine
        const initialMessage = `Start the ${difficulty} interview for the ${stage} stage now. Topic: ${topic === 'nextjs' ? 'Next.js Framework' : 'Web Development Basics'}. Introduce yourself as Vercus and ask the first question.`;
        // We don't show this message to user, just trigger the AI
        await handleSend(initialMessage, true);
    };
    // 1. Auto-Start Listening when AI stops speaking
    useEffect(() => {
        // Added messages.length > 0 check to ensure we don't start listening before the intro
        if (isStarted && messages.length > 0 && !isSpeaking && !isLoading && !isListening && !isStageComplete && !hasFailed && !interviewComplete) {
            // Small delay to ensure natural pause
            const timer = setTimeout(() => {
                startListening();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isSpeaking, isLoading, isListening, isStarted, isStageComplete, hasFailed, interviewComplete, startListening, messages.length]);
    // 2. Auto-Send on Silence (Silence Detection)
    useEffect(() => {
        if (isListening && transcript.trim()) {
            // If user is listening and has said something, start a silence timer
            const silenceTimer = setTimeout(() => {
                stopListening(); // Stop the mic
                handleSend(transcript);
            }, 2000); // Reduced to 2.0s for better responsiveness

            return () => clearTimeout(silenceTimer);
        }
    }, [transcript, isListening, handleSend, stopListening]);

    const handleBack = () => {
        stopSpeaking();
        onBack();
    };



    const advanceStage = () => {
        let nextStage: Stage | null = null;
        if (stage === "intro") nextStage = "technical";
        else if (stage === "technical") nextStage = "negotiation";

        if (nextStage) {
            setStage(nextStage);
            setMessages([]); // Clear chat history for the new stage
            setIsStageComplete(false);
            // Trigger AI to start next stage
            const nextStagePrompt = `I am ready for the next stage: ${nextStage}. NOTE: I have already introduced myself in the previous stage. SKIP the introduction. START IMMEDIATELY with the first question for the ${nextStage} stage.`;
            handleSend(nextStagePrompt, true);
        } else {
            setInterviewComplete(true);
        }
    };

    if (interviewComplete) {
        return <ReportCard results={stageResults} onRestart={onBack} />;
    }

    return (
        <div className={cn("flex flex-col w-full max-w-4xl mx-auto my-auto border-2 border-border rounded-none shadow-2xl bg-black/90 backdrop-blur-xl overflow-hidden relative", className)}>
            {/* Tech Grid Background */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Header - Control Panel Style */}
            <div className="relative z-10 p-4 border-b-2 border-border flex justify-between items-center bg-white/5 backdrop-blur-sm">
                <div className="flex gap-4 items-center">
                    <Button variant="outline" onClick={handleBack} className="border-white/50 hover:border-white">
                        <span className="mr-2">←</span> BACK
                    </Button>
                    <div className="h-8 w-[2px] bg-white/20" /> {/* Separator */}
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)} disabled={isStarted}>
                        <SelectTrigger className="w-[180px] bg-black/50 border-white/20">
                            <SelectValue placeholder="Select Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                            <SelectItem value="CEO">CEO</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground tracking-widest">Current Stage</span>
                        <span className="text-sm font-bold text-primary uppercase tracking-wider">{stage}</span>
                    </div>
                </div>
                {!isStarted && (
                    <Button onClick={handleStart} className="bg-primary text-black font-bold uppercase tracking-widest hover:bg-primary/90">
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
                    <div className="absolute w-[350px] h-[350px] rounded-full border border-primary/10 opacity-30 animate-pulse" />

                    {/* Crosshairs */}
                    <div className="absolute top-1/2 left-4 w-4 h-[2px] bg-white/20" />
                    <div className="absolute top-1/2 right-4 w-4 h-[2px] bg-white/20" />
                    <div className="absolute top-4 left-1/2 w-[2px] h-4 bg-white/20" />
                    <div className="absolute bottom-4 left-1/2 w-[2px] h-4 bg-white/20" />
                </div>

                {/* Hidden message list */}
                <div className="hidden">
                    {messages.map((msg, i) => (
                        <ChatBubble key={i} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Footer - Status Log */}
            {isStageComplete || hasFailed ? (
                <div className="relative z-10 p-4 bg-muted/30 border-t border-border flex flex-col items-center gap-2 backdrop-blur-sm">
                    <p className="text-sm font-mono uppercase tracking-widest text-white">
                        {hasFailed ? ">> SESSION TERMINATED <<" : ">> STAGE COMPLETE <<"}
                    </p>
                    {hasFailed ? (
                        <Button onClick={() => setInterviewComplete(true)} variant="destructive" className="w-full max-w-sm font-mono uppercase">
                            View Report
                        </Button>
                    ) : (
                        <Button onClick={advanceStage} className="w-full max-w-sm font-mono uppercase bg-white text-black hover:bg-white/90">
                            {stage === 'negotiation' ? 'Finalize Session' : 'Initiate Next Stage'}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="relative z-10 p-4 border-t-2 border-border flex justify-center items-center bg-black/40 min-h-[80px] font-mono text-sm uppercase tracking-widest backdrop-blur-sm">
                    {isSpeaking ? (
                        <div className="flex items-center gap-2 text-primary animate-pulse">
                            <span className="w-2 h-2 bg-primary rounded-full" />
                            <span>Vercus_Transmitting...</span>
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
            )}
        </div>
    );
}
