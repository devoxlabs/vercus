import { model } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { history, message, systemInstruction } = await req.json();

        const chat = model.startChat({
            history: history,
            systemInstruction: {
                role: "system",
                parts: [{ text: systemInstruction }],
            },
        });

        const result = await chat.sendMessageStream(message);

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            controller.enqueue(encoder.encode(chunkText));
                        }
                    }
                } catch (err) {
                    console.error("Stream error:", err);
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
