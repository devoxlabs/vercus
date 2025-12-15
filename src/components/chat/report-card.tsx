"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export interface RemedialTutor {
    name: string;
    role: string;
    description: string;
    expertise: string[];
}

export interface StageResult {
    stage: string;
    status: "passed" | "failed" | "skipped";
    score: number;
    title: string;
    feedback: string;
    tips: string[];
    remedialTutor?: RemedialTutor;
}

interface ReportCardProps {
    results: StageResult[];
    onRestart: () => void;
}

export function ReportCard({ results, onRestart }: ReportCardProps) {
    const overallScore = Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length);
    const finalTitle = results[results.length - 1]?.title || "Participant";

    // Find the first remedial tutor recommendation (usually from the failed stage)
    const remedialTutor = results.find(r => r.remedialTutor)?.remedialTutor;

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8 my-auto">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black uppercase tracking-tighter">Interview Report</h1>
                <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">Session Analysis Complete</p>
            </div>

            <Card className="border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-black/80 backdrop-blur">
                <CardHeader className="text-center border-b-2 border-white/10 pb-6">
                    <CardTitle className="text-4xl font-black uppercase text-primary">{finalTitle}</CardTitle>
                    <CardDescription className="text-xl font-mono mt-2">Overall Score: {overallScore}/100</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex justify-center mb-6">
                        <Badge variant={overallScore > 70 ? "default" : "destructive"} className="text-xl px-6 py-2 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase font-bold tracking-widest">
                            {overallScore > 70 ? "PASSED" : "NEEDS IMPROVEMENT"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Remedial Tutor Recommendation */}
            {remedialTutor && (
                <Card className="border-2 border-blue-500 shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] bg-blue-950/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Badge variant="outline" className="bg-blue-500/10 border-blue-500 text-blue-400 uppercase tracking-widest">Recommended Mentor</Badge>
                        </div>
                        <CardTitle className="text-2xl font-bold uppercase">{remedialTutor.name}</CardTitle>
                        <CardDescription className="text-lg text-blue-300 font-mono uppercase">
                            {remedialTutor.role}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-blue-100/80 italic">
                            "{remedialTutor.description}"
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {remedialTutor.expertise.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="bg-blue-900/50 border border-blue-500/30 text-blue-200">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                        <div className="pt-4">
                            <a
                                href={`/tutor-session?custom=true&name=${encodeURIComponent(remedialTutor.name)}&role=${encodeURIComponent(remedialTutor.role)}&description=${encodeURIComponent(remedialTutor.description)}&expertise=${encodeURIComponent(remedialTutor.expertise.join(','))}&difficulty=Beginner`}
                                className="inline-flex h-12 items-center justify-center rounded-none border-2 border-blue-400 bg-blue-600 px-8 text-sm font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(96,165,250,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(96,165,250,1)] hover:bg-blue-700"
                            >
                                Start Remedial Session
                            </a>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {results.map((result, index) => (
                    <Card key={index} className={`flex flex-col border-2 border-white/50 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] ${result.status === 'failed' ? 'bg-red-950/10' : 'bg-black/40'}`}>
                        <CardHeader className="border-b border-white/10">
                            <div className="flex justify-between items-center">
                                <CardTitle className="capitalize font-bold text-xl">{result.stage} Stage</CardTitle>
                                <Badge variant={result.status === 'passed' ? "outline" : "destructive"} className="uppercase font-mono text-xs border-2">
                                    {result.status.toUpperCase()}
                                </Badge>
                            </div>
                            <CardDescription className="font-mono">Score: {result.score}/100</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4 pt-4">
                            <div>
                                <h4 className="font-bold uppercase text-xs text-muted-foreground mb-2 tracking-widest">Feedback</h4>
                                <p className="text-sm">{result.feedback}</p>
                            </div>

                            {result.tips && result.tips.length > 0 && (
                                <div>
                                    <Separator className="my-3 bg-white/10" />
                                    <h4 className="font-bold uppercase text-xs text-muted-foreground mb-2 tracking-widest">Tips for Improvement</h4>
                                    <ul className="list-none space-y-1 text-sm text-muted-foreground">
                                        {result.tips.map((tip, i) => (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-primary">›</span> {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center pt-8 pb-12">
                <Button
                    onClick={onRestart}
                    size="lg"
                    className="h-14 px-10 text-lg border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] uppercase font-black tracking-widest bg-primary text-black hover:bg-primary/90"
                >
                    Start New Interview
                </Button>
            </div>
        </div>
    );
}
