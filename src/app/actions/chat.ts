"use server";

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Vercus";

export type Message = {
    role: "user" | "model";
    parts: { text: string }[];
};

export async function sendMessage(
    history: Message[],
    message: string,
    systemInstruction: string
) {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API Key is missing. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to .env.local");
    }

    // Convert Gemini history to OpenAI format
    // Gemini: { role: 'user' | 'model', parts: [{ text: '...' }] }
    // OpenAI: { role: 'user' | 'assistant', content: '...' }
    const messages = history.map(msg => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: msg.parts.map(p => p.text).join("\n") // Handle multiple parts if any
    }));

    // Add system instruction at the beginning
    messages.unshift({
        role: "system",
        content: systemInstruction
    });

    // Add current user message
    messages.push({
        role: "user",
        content: message
    });

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": process.env.NEXT_PUBLIC_OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
                "messages": messages,
                "temperature": 0.7,
                "top_p": 0.9,
                "repetition_penalty": 1.1,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter Error Response:", errorText);
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error("Invalid response format from OpenRouter");
        }

        return data.choices[0].message.content;

    } catch (error: any) {
        console.error("Error sending message to OpenRouter:", error);
        throw new Error(`OpenRouter API Error: ${error.message || "Unknown error"}`);
    }
}
