import { TutorGrid } from "@/components/tutors/tutor-grid";
import { LANGUAGE_TUTORS } from "@/lib/tutor-data";

export default function LanguageTutorsPage() {
    return (
        <TutorGrid
            title="Language Tutors"
            description="Master new languages with native-level AI conversation partners. Practice pronunciation, grammar, and cultural nuances."
            agents={LANGUAGE_TUTORS}
        />
    );
}
