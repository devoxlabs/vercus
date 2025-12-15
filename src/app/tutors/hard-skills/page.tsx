import { TutorGrid } from "@/components/tutors/tutor-grid";
import { HARD_SKILLS_TUTORS } from "@/lib/tutor-data";

export default function HardSkillsTutorsPage() {
    return (
        <TutorGrid
            title="Hard Skills"
            description="Master practical vocational skills like Data Analysis, Project Management, Design, and Finance."
            agents={HARD_SKILLS_TUTORS}
        />
    );
}
