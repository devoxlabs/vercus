import { TutorGrid } from "@/components/tutors/tutor-grid";
import { TECHNICAL_TUTORS } from "@/lib/tutor-data";

export default function TechnicalTutorsPage() {
    return (
        <TutorGrid
            title="Technical Skills"
            description="Learn coding, system design, and technical concepts from expert AI mentors. From Python to Blockchain."
            agents={TECHNICAL_TUTORS}
        />
    );
}
