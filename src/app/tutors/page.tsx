"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code, Languages, Briefcase, Brain, Hammer } from "lucide-react";

export default function TutorsPage() {
    const categories = [
        {
            title: "Language Tutors",
            description: "Master new languages with native-level AI conversation partners.",
            icon: <Languages className="w-10 h-10 mb-4 text-blue-500" />,
            href: "/tutors/language"
        },
        {
            title: "Technical Skills",
            description: "Learn coding, system design, and technical concepts.",
            icon: <Code className="w-10 h-10 mb-4 text-green-500" />,
            href: "/tutors/technical"
        },
        {
            title: "Hard Skills",
            description: "Data analysis, project management, and specialized vocational skills.",
            icon: <Hammer className="w-10 h-10 mb-4 text-orange-500" />,
            href: "/tutors/hard-skills"
        },
        {
            title: "Soft Skills",
            description: "Communication, leadership, and emotional intelligence coaching.",
            icon: <Brain className="w-10 h-10 mb-4 text-purple-500" />,
            href: "/tutors/soft-skills"
        },
        {
            title: "Business",
            description: "Entrepreneurship, marketing, finance, and strategy.",
            icon: <Briefcase className="w-10 h-10 mb-4 text-slate-500" />,
            href: "/tutors/business"
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold mt-4">Tutor Agents</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Select a category to start learning with specialized AI tutors.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, index) => (
                        <Link href={category.href} key={index} className="block group">
                            <Card className="h-full transition-all duration-300 hover:border-primary hover:-translate-y-1">
                                <CardHeader>
                                    <div className="transition-transform duration-300 group-hover:scale-110 origin-left">
                                        {category.icon}
                                    </div>
                                    <CardTitle className="text-2xl">{category.title}</CardTitle>
                                    <CardDescription className="text-base mt-2">
                                        {category.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                        Start Learning <span>→</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
