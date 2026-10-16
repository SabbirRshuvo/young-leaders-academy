import UniversitiesHero from '@/components/universities/UniversitiesHero';
import UniversityStats from '@/components/universities/UniversityStats';
import UniversityGrid from '@/components/universities/UniversityGrid';
import GlobalMobility from '@/components/universities/GlobalMobility';
import UniversitiesCta from '@/components/universities/UniversitiesCta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr
      ? 'الجامعات الشريكة | أكاديمية قادة الشباب'
      : 'Universities | Young Leaders Academy',
    description: isAr
      ? 'استكشف شبكتنا العالمية من الجامعات الشريكة والروابط الأكاديمية ومسارات التنقل العالمية.'
      : 'Explore our global network of partner universities, academic connections, and global mobility pathways.',
  };
}

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
