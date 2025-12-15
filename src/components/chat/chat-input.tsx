"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send, MicOff } from "lucide-react";
import { useEffect, useState } from "react";

interface ChatInputProps {
    onSend: (message: string) => void;
    isListening: boolean;
    onStartListening: () => void;
    transcript: string;
    isLoading: boolean;
    disabled?: boolean;
    placeholder?: string;
}

export function ChatInput({
    onSend,
    isListening,
    onStartListening,
    transcript,
    isLoading,
    disabled = false,
    placeholder = "Type your message..."
}: ChatInputProps) {
    const [input, setInput] = useState("");

    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSend(input);
            setInput("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t">
            <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={onStartListening}
                disabled={isLoading || disabled}
                className={isListening ? "animate-pulse" : ""}
            >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : placeholder}
                disabled={isLoading || isListening || disabled}
                className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim() || isListening || disabled}>
                <Send className="h-4 w-4" />
            </Button>
        </form>
    );
}
