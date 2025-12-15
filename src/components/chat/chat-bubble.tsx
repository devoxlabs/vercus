import { cn } from "@/lib/utils";
import { Message } from "@/app/actions/chat";

interface ChatBubbleProps {
    message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
    const isUser = message.role === "user";

    return (
        <div
            className={cn(
                "flex w-full",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                    isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                )}
            >
                {message.parts.map((part, index) => (
                    <p key={index}>{part.text}</p>
                ))}
            </div>
        </div>
    );
}
