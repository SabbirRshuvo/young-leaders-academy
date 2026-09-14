import HowToEnroll from '@/components/programs/HowToEnroll';
import ProgramsCta from '@/components/programs/ProgramsCta';
import ProgramsWrapper from '@/components/programs/ProgramsWrapper';

export const metadata = {
  title: 'Our Programs | Young Leaders Academy',
  description: 'Explore specialized programs designed to help young people build skills, confidence, and global exposure.',
};

export default function ProgramsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start w-full bg-white">
      <ProgramsWrapper />
      <HowToEnroll />
      <ProgramsCta />
    </main>
  );
}
