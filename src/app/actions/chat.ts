"use server";

const OPENROUTER_KEYS = [
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY1,
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY2,
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY3,
].filter(Boolean) as string[];

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
    if (OPENROUTER_KEYS.length === 0) {
        throw new Error("No OpenRouter API Keys found. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to .env.local");
    }

    // Convert Gemini history to OpenAI format
    const messages = history.map(msg => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: msg.parts.map(p => p.text).join("\n")
    }));

    messages.unshift({
        role: "system",
        content: systemInstruction
    });

    messages.push({
        role: "user",
        content: message
    });

    let lastError: any = null;

    // Failover Loop
    for (const apiKey of OPENROUTER_KEYS) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
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
                // If rate limited or quota exceeded, throw to try next key
                if (response.status === 429 || response.status === 402) {
                    console.warn(`Key failed with status ${response.status}. Trying next key...`);
                    throw new Error(`API Error ${response.status}: ${errorText}`);
                }
                // For other errors (e.g. 500), also try next key just in case
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error("Invalid response format from OpenRouter");
            }

            return data.choices[0].message.content;

        } catch (error: any) {
            console.error(`Attempt failed with key ending in ...${apiKey.slice(-4)}:`, error.message);
            lastError = error;
            // Continue to next key
        }
    }

    // If loop finishes without returning, all keys failed
    throw new Error(`All API keys failed. Last error: ${lastError?.message || "Unknown error"}`);
}
