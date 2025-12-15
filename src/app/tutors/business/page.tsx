import { TutorGrid } from "@/components/tutors/tutor-grid";
import { BUSINESS_TUTORS } from "@/lib/tutor-data";

export default function BusinessTutorsPage() {
    return (
        <TutorGrid
            title="Business Tutors"
            description="Gain strategic insights into Entrepreneurship, Marketing, Finance, and Corporate Strategy."
            agents={BUSINESS_TUTORS}
        />
    );
}
