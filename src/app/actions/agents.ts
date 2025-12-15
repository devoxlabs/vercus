"use server";

import { model } from "@/lib/gemini";

export async function categorizeAgent(name: string, description: string, instructions: string) {
    try {
        const prompt = `
      You are a system classifier.
      Analyze the following AI Agent definition and categorize it into EXACTLY one of these two categories: "tech" or "corporate".
      
      Agent Name: ${name}
      Description: ${description}
      Instructions: ${instructions}
      
      Rules:
      - If it relates to software, engineering, coding, data, or IT infrastructure, output "tech".
      - If it relates to business, management, sales, marketing, hr, finance, or executive roles, output "corporate".
      - Output ONLY the category name (lowercase). No other text.
    `;

        const result = await model.generateContent(prompt);
        const category = result.response.text().trim().toLowerCase();

        if (category.includes("tech")) return "tech";
        return "corporate"; // Default fallback
    } catch (error) {
        console.error("Categorization failed:", error);
        return "corporate"; // Fail safe
    }
}
