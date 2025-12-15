"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Terminal } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface NotesViewerProps {
    notes: {
        summary: string;
        keyConcepts: string[];
        qaRecap: { question: string; answer: string }[];
    };
    onClose: () => void;
    title: string;
}

export function NotesViewer({ notes, onClose, title }: NotesViewerProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!contentRef.current) return;
        setIsDownloading(true);

        try {
            // 1. Create a temporary container for the clone
            const container = document.createElement("div");
            container.style.position = "absolute";
            container.style.left = "-9999px";
            container.style.top = "0";
            container.style.width = "800px"; // Fixed width for consistent PDF scale
            document.body.appendChild(container);

            // 2. Clone the content
            const clone = contentRef.current.cloneNode(true) as HTMLElement;

            // 3. Apply specific styles to the clone for PDF generation
            clone.style.height = "auto";
            clone.style.overflow = "visible";
            clone.style.backgroundColor = "#000000";
            clone.style.color = "#22c55e"; // green-500
            clone.style.padding = "40px";
            clone.style.border = "2px solid #22c55e";

            container.appendChild(clone);

            // 4. Generate Canvas from the clone
            const canvas = await html2canvas(clone, {
                scale: 2, // Higher resolution
                backgroundColor: "#000000",
                useCORS: true,
                logging: false,
                windowWidth: 800,
            });

            // 5. Generate PDF
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            // Handle multi-page if content is long
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`vercus-session-notes-${new Date().toISOString().split('T')[0]}.pdf`);

            // 6. Cleanup
            document.body.removeChild(container);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-3xl bg-black border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)] flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-2 border-green-500/30 bg-green-950/10">
                    <div className="flex items-center gap-2 text-green-500 font-mono uppercase tracking-widest">
                        <Terminal className="w-5 h-5" />
                        <span>Mission_Log // {title}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-mono uppercase text-xs h-8"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {isDownloading ? "Compiling..." : "Download_PDF"}
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-400 hover:bg-green-950/30 h-8 w-8"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 font-mono text-green-500/90 space-y-8 custom-scrollbar" ref={contentRef}>

                    {/* Header for PDF capture */}
                    <div className="border-b border-green-500/30 pb-4 mb-8">
                        <h1 className="text-2xl font-bold uppercase tracking-tighter text-green-400">Session Report: {title}</h1>
                        <p className="text-xs opacity-70 mt-1">DATE: {new Date().toLocaleDateString()}</p>
                        <p className="text-xs opacity-70">STATUS: COMPLETED</p>
                    </div>

                    {/* Summary */}
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-2 text-green-400 border-l-4 border-green-500 pl-2">
                            01 // Executive_Summary
                        </h2>
                        <p className="text-sm leading-relaxed opacity-90 pl-3">
                            {notes.summary}
                        </p>
                    </section>

                    {/* Key Concepts */}
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-2 text-green-400 border-l-4 border-green-500 pl-2">
                            02 // Key_Intel_Acquired
                        </h2>
                        <ul className="space-y-2 pl-3">
                            {notes.keyConcepts.map((concept, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-green-600 mt-1">{">"}</span>
                                    <span className="opacity-90">{concept}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Q&A Recap */}
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-2 text-green-400 border-l-4 border-green-500 pl-2">
                            03 // Interaction_Log
                        </h2>
                        <div className="space-y-4 pl-3">
                            {notes.qaRecap.map((qa, i) => (
                                <div key={i} className="bg-green-950/10 p-3 border border-green-500/20">
                                    <p className="text-xs text-green-600 uppercase mb-1">Query:</p>
                                    <p className="text-sm font-bold mb-2 text-green-300">"{qa.question}"</p>
                                    <p className="text-xs text-green-600 uppercase mb-1">Analysis:</p>
                                    <p className="text-sm opacity-90">{qa.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Footer for PDF */}
                    <div className="pt-8 mt-8 border-t border-green-500/30 text-center opacity-50 text-xs uppercase">
                        Generated by Vercus AI Tutor System
                    </div>
                </div>
            </div>
        </div>
    );
}
