import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error("Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable");
    throw new Error("GEMINI_API_KEY is missing. Please check your .env.local file.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";

export const model = genAI.getGenerativeModel({
    model: modelName,
});
