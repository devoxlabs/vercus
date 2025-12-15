"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, BookOpen, TrendingUp, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { NotesViewer } from "./notes-viewer";

export interface TutorSessionResult {
    status: 'pass' | 'fail';
    score: number;
    title: string;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    recommendedCourses: string[];
    notes?: {
        summary: string;
        keyConcepts: string[];
        qaRecap: { question: string; answer: string }[];
    };
}

interface TutorReportCardProps {
    result: TutorSessionResult;
    onRestart: () => void;
}

export function TutorReportCard({ result, onRestart }: TutorReportCardProps) {
    const isPass = result.status === 'pass';
    const [showNotes, setShowNotes] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-[600px] w-full p-4 my-auto">
            <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-500">
                <Card className="border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-black/90 backdrop-blur">
                    <CardHeader className="text-center pb-6 border-b-2 border-white/10">
                        <div className="mx-auto mb-4">
                            {isPass ? (
                                <CheckCircle className="w-20 h-20 text-green-500 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.5)]" />
                            ) : (
                                <XCircle className="w-20 h-20 text-red-500 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.5)]" />
                            )}
                        </div>
                        <Badge variant="outline" className="mb-2 text-lg px-4 py-1 border-2 border-white text-white uppercase tracking-widest mx-auto w-fit">
                            {result.title}
                        </Badge>
                        <CardTitle className="text-4xl font-black uppercase tracking-tighter mt-2">
                            {isPass ? "Session Completed" : "Needs Improvement"}
                        </CardTitle>
                        <CardDescription className="text-xl font-mono mt-2 uppercase">
                            Score: <span className={isPass ? "text-green-500 font-bold" : "text-red-500 font-bold"}>{result.score}/100</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">

                        {/* Main Feedback */}
                        <div className="p-6 rounded-none border-2 border-white/20 bg-white/5 text-center italic text-lg font-medium">
                            "{result.feedback}"
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            <div className="space-y-3">
                                <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 text-green-500 text-sm">
                                    <TrendingUp className="w-4 h-4" /> Strengths
                                </h3>
                                <ul className="space-y-2">
                                    {result.strengths.map((item, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2 bg-green-950/20 p-2 border border-green-500/20">
                                            <span className="text-green-500 mt-0.5 font-bold">+</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="space-y-3">
                                <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 text-red-500 text-sm">
                                    <AlertTriangle className="w-4 h-4" /> Areas for Improvement
                                </h3>
                                <ul className="space-y-2">
                                    {result.weaknesses.map((item, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2 bg-red-950/20 p-2 border border-red-500/20">
                                            <span className="text-red-500 mt-0.5 font-bold">!</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Recommended Courses */}
                        <div className="space-y-4 pt-6 border-t-2 border-white/10">
                            <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 text-blue-400 text-sm">
                                <BookOpen className="w-4 h-4" /> Recommended Next Steps
                            </h3>
                            <div className="grid gap-3">
                                {result.recommendedCourses.map((course, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-none border-2 border-white/20 bg-black/40 hover:bg-white/5 transition-colors group">
                                        <span className="font-bold text-sm uppercase tracking-wide group-hover:text-primary transition-colors">{course}</span>
                                        <Badge variant="outline" className="border-white/30 text-xs">RECOMMENDED</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 justify-center pt-2 pb-8">
                        {result.notes && result.score > 0 && (
                            <Button
                                onClick={() => setShowNotes(true)}
                                variant="outline"
                                className="w-full max-w-sm h-12 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black uppercase font-bold tracking-widest"
                            >
                                <BookOpen className="w-4 h-4 mr-2" /> View Mission Log
                            </Button>
                        )}
                        <Button
                            onClick={onRestart}
                            size="lg"
                            className="w-full max-w-sm h-14 text-lg border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] uppercase font-black tracking-widest"
                        >
                            Start New Session
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {showNotes && result.notes && (
                <NotesViewer
                    notes={result.notes}
                    onClose={() => setShowNotes(false)}
                    title={result.title}
                />
            )}
        </div>
    );
}
