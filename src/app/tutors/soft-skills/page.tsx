import { TutorGrid } from "@/components/tutors/tutor-grid";
import { SOFT_SKILLS_TUTORS } from "@/lib/tutor-data";

export default function SoftSkillsTutorsPage() {
    return (
        <TutorGrid
            title="Soft Skills"
            description="Enhance your interpersonal effectiveness. Improve communication, leadership, and emotional intelligence."
            agents={SOFT_SKILLS_TUTORS}
        />
    );
}
