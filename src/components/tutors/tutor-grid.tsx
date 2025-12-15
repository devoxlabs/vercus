"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Users, Clock } from "lucide-react";
import { TutorAgent } from "@/lib/tutor-data";

interface TutorGridProps {
    title: string;
    description: string;
    agents: TutorAgent[];
    backLink?: string;
}

export function TutorGrid({ title, description, agents, backLink = "/tutors" }: TutorGridProps) {
    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link href={backLink}>
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Categories
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold mt-4">{title}</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {agents.map((agent) => (
                        <Card key={agent.id} className="flex flex-col h-full transition-all duration-300 hover:border-primary">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant={
                                        agent.difficulty === 'Beginner' ? 'secondary' :
                                            agent.difficulty === 'Intermediate' ? 'default' :
                                                'outline'
                                    }>
                                        {agent.difficulty}
                                    </Badge>
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="ml-1 text-sm font-medium">4.9</span>
                                    </div>
                                </div>
                                <CardTitle className="text-xl">{agent.name}</CardTitle>
                                <CardDescription className="font-medium text-primary">
                                    {agent.role}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground mb-4">
                                    {agent.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {agent.expertise.map((skill, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4 border-t">
                                <Link href={`/tutor-session?agent=${agent.id}`} className="w-full">
                                    <Button className="w-full gap-2">
                                        Start Session
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
