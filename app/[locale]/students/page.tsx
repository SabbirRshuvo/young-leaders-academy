import StudentsHero from '@/components/students/StudentsHero';
import StudentsBenefits from '@/components/students/StudentsBenefits';
import StudentsCta from '@/components/students/StudentsCta';

export const metadata = {
  title: 'Students | Young Leaders Academy',
  description: 'Discover your potential with Young Leaders Academy.',
};

export default function StudentsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start w-full">
      <StudentsHero />
      <StudentsBenefits />
      <StudentsCta />
    </main>
  );
}
