import Link from "next/link";
import { Button } from "@/components/ui/button";
import GradientBlinds from "@/components/ui/gradient-blinds";

export default function Home() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <GradientBlinds
                    gradientColors={['#ff6666', '#ffff33', '#3388ff', '#ff6666']}
                    blindCount={12}
                    blindMinWidth={60}
                    spotlightRadius={0.6}
                    spotlightOpacity={0.8}
                    noise={0.2}
                />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pointer-events-none">
                <main className="flex flex-col items-center text-center space-y-8 p-8 pointer-events-auto">
                    <h1 className="text-8xl font-black tracking-tighter uppercase text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        VERCUS
                    </h1>
                    <p className="text-2xl font-medium text-white max-w-2xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-black/50 p-4 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                        Master your interview skills with AI-powered agents.
                        Practice with realistic personas, get instant feedback, and land your dream job.
                    </p>
                    <div className="flex gap-6 mt-8">
                        <Link href="/interview">
                            <Button size="lg" className="text-xl px-10 py-8 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all bg-primary text-black font-bold">
                                Start Interview
                            </Button>
                        </Link>
                        <Link href="/tutors">
                            <Button variant="secondary" size="lg" className="text-xl px-10 py-8 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all bg-accent text-white font-bold">
                                Learn
                            </Button>
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}
