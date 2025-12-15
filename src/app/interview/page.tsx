"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateAgentDialog } from "@/components/interview/create-agent-dialog";
import { INTERVIEWER_PERSONAS } from "@/lib/prompts";

const INITIAL_AGENTS = [
    // Tech Stack
    { id: "nextjs", name: "Next.js Specialist", desc: "App Router, Server Actions, Performance", category: "tech", level: "Advanced" },
    { id: "react", name: "React Lead", desc: "Hooks, State Management, Patterns", category: "tech", level: "Advanced" },
    { id: "node", name: "Node.js Architect", desc: "Backend, Streams, Scalability", category: "tech", level: "Expert" },
    { id: "python", name: "Python Engineer", desc: "Django, FastAPI, Data Structures", category: "tech", level: "Advanced" },
    { id: "java", name: "Java Developer", desc: "Spring Boot, JVM, Enterprise", category: "tech", level: "Advanced" },
    { id: "web_basics", name: "Web Fundamentals", desc: "HTML, CSS, JS, DOM", category: "tech", level: "Beginner" },
    { id: "devops", name: "DevOps Lead", desc: "CI/CD, Docker, Kubernetes, Cloud", category: "tech", level: "Expert" },
    { id: "data_science", name: "Data Scientist", desc: "ML, Statistics, Python/Pandas", category: "tech", level: "Advanced" },
    { id: "mobile", name: "Mobile Lead", desc: "React Native, Flutter, Native", category: "tech", level: "Advanced" },
    { id: "cybersecurity", name: "Security Analyst", desc: "OWASP, Pen Testing, Network Sec", category: "tech", level: "Expert" },
    { id: "ui_ux", name: "Product Designer", desc: "Figma, User Research, Prototyping", category: "tech", level: "Intermediate" },
    { id: "qa_engineer", name: "QA Automation", desc: "Cypress, Selenium, TDD", category: "tech", level: "Intermediate" },
    { id: "rust", name: "Rust Engineer", desc: "Ownership, Concurrency, Systems", category: "tech", level: "Advanced" },
    { id: "go", name: "Go Developer", desc: "Goroutines, Microservices", category: "tech", level: "Advanced" },
    { id: "cpp", name: "C++ Architect", desc: "Memory Mgmt, STL, Low-level", category: "tech", level: "Expert" },
    { id: "csharp", name: ".NET Core Lead", desc: "LINQ, Entity Framework, Enterprise", category: "tech", level: "Advanced" },
    { id: "sql", name: "Database Admin", desc: "Normalization, Indexing, SQL", category: "tech", level: "Advanced" },
    { id: "nosql", name: "NoSQL Architect", desc: "MongoDB, Cassandra, Sharding", category: "tech", level: "Expert" },
    { id: "graphql", name: "GraphQL Expert", desc: "Schema Design, Federation", category: "tech", level: "Advanced" },
    { id: "aws", name: "AWS Architect", desc: "Lambda, EC2, DynamoDB", category: "tech", level: "Expert" },
    { id: "azure", name: "Azure Architect", desc: "Functions, Cosmos DB, Enterprise", category: "tech", level: "Expert" },
    { id: "gcp", name: "GCP Architect", desc: "BigQuery, GKE, Cloud Run", category: "tech", level: "Expert" },
    { id: "swift", name: "iOS Developer", desc: "SwiftUI, Core Data, Mobile", category: "tech", level: "Advanced" },
    { id: "kotlin", name: "Android Developer", desc: "Jetpack Compose, Coroutines", category: "tech", level: "Advanced" },
    { id: "php", name: "PHP Lead", desc: "Laravel, Symfony, Modern PHP", category: "tech", level: "Advanced" },
    { id: "ruby", name: "Rails Engineer", desc: "ActiveRecord, MVC, RSpec", category: "tech", level: "Advanced" },

    // Corporate
    { id: "pm", name: "Product Manager", desc: "Strategy, Agile, User Stories", category: "corporate", level: "Senior" },
    { id: "project_manager", name: "Project Manager", desc: "Risk, Timeline, Stakeholders", category: "corporate", level: "Senior" },
    { id: "marketing", name: "Marketing Director", desc: "SEO, Content, Analytics, Brand", category: "corporate", level: "Senior" },
    { id: "sales", name: "VP of Sales", desc: "Closing, Negotiation, CRM", category: "corporate", level: "Executive" },
    { id: "hr", name: "HR Partner", desc: "Culture, Conflict, Recruiting", category: "corporate", level: "Senior" },
    { id: "recruiter", name: "Tech Recruiter", desc: "Screening, Career History, Fit", category: "corporate", level: "Senior" },
    { id: "team_lead", name: "Team Lead", desc: "Mentorship, Sprint Planning", category: "corporate", level: "Senior" },
    { id: "business_analyst", name: "Business Analyst", desc: "Requirements, Process, Data", category: "corporate", level: "Intermediate" },
    { id: "customer_success", name: "Customer Success", desc: "Retention, Onboarding, Upsell", category: "corporate", level: "Senior" },
    { id: "finance", name: "Financial Analyst", desc: "Modeling, P&L, Forecasting", category: "corporate", level: "Advanced" },
    { id: "legal", name: "General Counsel", desc: "Contracts, Compliance, IP", category: "corporate", level: "Executive" },
    { id: "operations", name: "COO", desc: "Efficiency, Logistics, Scaling", category: "corporate", level: "Executive" },
    { id: "cto", name: "CTO", desc: "Tech Strategy, Architecture, R&D", category: "corporate", level: "Executive" },
    { id: "cfo", name: "CFO", desc: "Finance Strategy, Fundraising", category: "corporate", level: "Executive" },
    { id: "cmo", name: "CMO", desc: "Brand Strategy, Growth", category: "corporate", level: "Executive" },
    { id: "ceo", name: "Startup CEO", desc: "Vision, Strategy, Leadership", category: "corporate", level: "Executive" },
    { id: "intern", name: "Internship Coord", desc: "Learning, Curiosity, Basics", category: "corporate", level: "Entry" },
    { id: "freelancer", name: "Client (Freelance)", desc: "Portfolio, Rates, Deadlines", category: "corporate", level: "Client" },
    { id: "consultant", name: "Mgmt Consultant", desc: "Strategy, Frameworks, Cases", category: "corporate", level: "Expert" },
];

export default function InterviewPage() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [customAgents, setCustomAgents] = useState<any[]>([]);

    // Merge static and custom agents
    const allAgents = [...customAgents, ...INITIAL_AGENTS];

    const handleAgentCreated = (newAgent: any) => {
        setCustomAgents(prev => [newAgent, ...prev]);
        // Also inject the new prompt into the global prompts object so ChatInterface can find it
        // Note: In a real app, this would be fetched from DB
        INTERVIEWER_PERSONAS[newAgent.id] = newAgent.instructions;
    };

    if (selectedTopic) {
        return (
            <div className="container mx-auto py-4 h-[calc(100vh-100px)] flex flex-col">
                <ChatInterface topic={selectedTopic} onBack={() => setSelectedTopic(null)} className="flex-1 h-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="flex flex-col items-center text-center mb-10 space-y-4">
                <h1 className="text-4xl font-bold">Choose Your Interviewer</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Select an AI agent to start your mock interview session, or create your own custom persona.
                </p>
                <CreateAgentDialog onAgentCreated={handleAgentCreated} />
            </div>

            <Tabs defaultValue="tech" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                        <TabsTrigger value="tech">Tech & Engineering</TabsTrigger>
                        <TabsTrigger value="corporate">Corporate & Business</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="tech">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allAgents.filter(a => a.category === 'tech').map((agent) => (
                            <AgentCard key={agent.id} agent={agent} onSelect={setSelectedTopic} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="corporate">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allAgents.filter(a => a.category === 'corporate').map((agent) => (
                            <AgentCard key={agent.id} agent={agent} onSelect={setSelectedTopic} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function AgentCard({ agent, onSelect }: { agent: any, onSelect: (id: string) => void }) {
    return (
        <Card className="transition-all hover:-translate-y-1 cursor-pointer border-primary/10" onClick={() => onSelect(agent.id)}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant={agent.level === 'Beginner' ? 'secondary' : agent.level === 'Executive' ? 'destructive' : 'default'} className="text-xs">
                        {agent.level}
                    </Badge>
                </div>
                <CardTitle className="text-xl">{agent.name}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">{agent.desc}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full" variant="outline">Start Interview</Button>
            </CardContent>
        </Card>
    );
}
