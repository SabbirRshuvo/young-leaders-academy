import UniversitiesHero from '@/components/universities/UniversitiesHero';
import UniversityStats from '@/components/universities/UniversityStats';
import UniversityGrid from '@/components/universities/UniversityGrid';
import GlobalMobility from '@/components/universities/GlobalMobility';
import UniversitiesCta from '@/components/universities/UniversitiesCta';

export const metadata = {
  title: 'Universities | Young Leaders Academy',
  description: 'Explore our global network of partner universities, academic connections, and global mobility pathways.',
};

export default function UniversitiesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start w-full bg-white">
      <UniversitiesHero />
      <UniversityStats />
      <UniversityGrid />
      <GlobalMobility />
      <UniversitiesCta />
    </main>
  );
}
