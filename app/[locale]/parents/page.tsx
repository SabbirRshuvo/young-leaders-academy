import ParentsHero from '@/components/parents/ParentsHero';
import ParentsSupport from '@/components/parents/ParentsSupport';
import ParentsCta from '@/components/parents/ParentsCta';

export const metadata = {
  title: 'Parents | Young Leaders Academy',
  description: 'Partners in the journey with Young Leaders Academy.',
};

export default function ParentsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start w-full bg-white">
      <ParentsHero />
      <ParentsSupport />
      <ParentsCta />
    </main>
  );
}
