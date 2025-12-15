"use client";

import { useSearchParams } from "next/navigation";
import { TutorInterface } from "@/components/tutors/tutor-interface";
import {
    LANGUAGE_TUTORS,
    TECHNICAL_TUTORS,
    HARD_SKILLS_TUTORS,
    SOFT_SKILLS_TUTORS,
    BUSINESS_TUTORS
} from "@/lib/tutor-data";
import { Suspense } from "react";

function TutorSessionContent() {
    const searchParams = useSearchParams();
    const agentId = searchParams.get("agent");
    const isCustom = searchParams.get("custom") === "true";

    let agent: any = null;

    if (isCustom) {
        // Construct transient agent from URL params
        agent = {
            id: 'custom-remedial',
            name: searchParams.get("name") || "Remedial Tutor",
            role: searchParams.get("role") || "Mentor",
            description: searchParams.get("description") || "Here to help you improve.",
            expertise: searchParams.get("expertise")?.split(',') || ["General Learning"],
            difficulty: (searchParams.get("difficulty") as any) || "Beginner"
        };
    } else {
        // Combine all tutors to find the matching one
        const allTutors = [
            ...LANGUAGE_TUTORS,
            ...TECHNICAL_TUTORS,
            ...HARD_SKILLS_TUTORS,
            ...SOFT_SKILLS_TUTORS,
            ...BUSINESS_TUTORS
        ];
        agent = allTutors.find(t => t.id === agentId);
    }

    if (!agent) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Tutor Not Found</h1>
                    <p className="text-muted-foreground">The requested tutor agent could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <TutorInterface agent={agent} />
        </div>
    );
}

export default function TutorSessionPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <TutorSessionContent />
        </Suspense>
    );
}
