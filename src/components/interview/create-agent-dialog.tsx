"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categorizeAgent } from "@/app/actions/agents";
import { Loader2, Plus } from "lucide-react";

interface CreateAgentDialogProps {
    onAgentCreated: (agent: any) => void;
}

export function CreateAgentDialog({ onAgentCreated }: CreateAgentDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        instructions: "",
        level: "Custom"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Auto-categorize using AI
            const category = await categorizeAgent(formData.name, formData.description, formData.instructions);

            // 2. Construct new agent object
            const newAgent = {
                id: `custom-${Date.now()}`,
                name: formData.name,
                desc: formData.description,
                category: category,
                level: formData.level,
                instructions: formData.instructions // We'll need to pass this to the chat interface
            };

            onAgentCreated(newAgent);
            setOpen(false);
            setFormData({ name: "", description: "", instructions: "", level: "Custom" });
        } catch (error) {
            console.error("Failed to create agent", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Custom Agent
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Interviewer</DialogTitle>
                    <DialogDescription>
                        Define your custom AI agent. The system will automatically categorize it for you.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Agent Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Senior Rust Architect"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="desc">Short Description</Label>
                        <Input
                            id="desc"
                            placeholder="e.g., Focuses on memory safety and concurrency"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="instructions">System Instructions (Persona)</Label>
                        <Textarea
                            id="instructions"
                            placeholder="You are Vercus, a... Focus on... Ask about..."
                            className="h-32"
                            value={formData.instructions}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, instructions: e.target.value })}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Publish Agent
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
