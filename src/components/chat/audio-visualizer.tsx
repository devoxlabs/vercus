"use client";

import { cn } from "@/lib/utils";
import { Orb } from "@/components/ui/orb";

interface AudioVisualizerProps {
    isSpeaking: boolean;
    isListening: boolean;
    speechData?: { lastWordTimestamp: number };
}

const ORB_COLORS: [string, string] = ["#ff6666", "#3388ff"];

export function AudioVisualizer({ isSpeaking, isListening }: AudioVisualizerProps) {
    const agentState = isSpeaking ? "talking" : isListening ? "listening" : null;

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-transparent">
            {/* Orb Container */}
            <div className="relative flex items-center justify-center w-full h-full max-h-[600px]">
                <Orb
                    agentState={agentState}
                    colors={ORB_COLORS}
                    className="w-full h-full"
                />
            </div>

            {/* Status Text */}
            <div className={cn(
                "mt-4 text-lg font-medium transition-colors duration-500",
                isSpeaking ? "text-primary" : isListening ? "text-secondary" : "text-muted-foreground"
            )}>
                {isSpeaking ? "Vercus is speaking..." : isListening ? "Listening..." : "Waiting for response..."}
            </div>
        </div>
    );
}
