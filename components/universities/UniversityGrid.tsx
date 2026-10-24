"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Info, Search, RotateCcw } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import RequestInfoModal from './RequestInfoModal';
import { supabase } from '@/lib/supabase';
import { universitiesData } from '@/data/universities';

const nameTranslations: Record<string, string> = {
  'Oxford Innovation Institute': 'معهد أكسفورد للابتكار',
  'Silicon Valley Tech Academy': 'أكاديمية وادي السيليكون للتكنولوجيا',
  'Berlin Business School': 'كلية برلين للأعمال',
  'Global Leadership University': 'جامعة القيادة العالمية',
  'Melbourne Institute of Science': 'معهد ملبورن للعلوم',
  'Harvard University': 'جامعة هارفارد',
  'University of Oxford': 'جامعة أكسفورد',
  'Stanford University': 'جامعة ستانفورد',
  'Massachusetts Institute of Technology': 'معهد ماساتشوستس للتكنولوجيا (MIT)',
  'University of Cambridge': 'جامعة كامبريدج',
  'Yale University': 'جامعة ييل',
  'King Saud University': 'جامعة الملك سعود',
  'King Fahd University of Petroleum and Minerals': 'جامعة الملك فهد للبترول والمعادن',
  'King Abdullah University of Science and Technology': 'جامعة الملك عبدالله للعلوم والتقنية',
};

const descTranslations: Record<string, string> = {
  'A leading institution dedicated to technological advancement and entrepreneurial research in the heart of the UK.':
    'مؤسسة رائدة مكرسة للتقدم التكنولوجي والبحوث الريادية في قلب المملكة المتحدة.',
  'Located in the global center of technological innovation, providing hands-on engineering and business curriculum.':
    'تقع في المركز العالمي للابتكار التكنولوجي، وتقدم مناهج هندسية وتجارية عملية.',
  'A top-tier business school focusing on European markets, finance, and global corporate leadership.':
    'كلية أعمال رائدة تركز على الأسواق الأوروبية والتمويل والقيادة المؤسسية العالمية.',
  'Preparing future diplomats and global policy makers through rigorous academic and practical training.':
    'إعداد الدبلوماسيين وصناع السياسات العالميين في المستقبل من خلال تدريب أكاديمي وعملي صارم.',
  'Pioneering research in data science, environmental engineering, and sustainable technologies.':
    'أبحاث رائدة في علوم البيانات والهندسة البيئية والتقنيات المستدامة.',
};

const countryTranslations: Record<string, string> = {
  'united states': 'الولايات المتحدة',
  'united kingdom': 'المملكة المتحدة',
  'germany': 'ألمانيا',
  'switzerland': 'سويسرا',
  'australia': 'أستراليا',
  'saudi arabia': 'المملكة العربية السعودية',
  'global': 'عالمي',
};

const cityTranslations: Record<string, string> = {
  'oxford': 'أكسفورد',
  'san jose': 'سان خوسيه',
  'berlin': 'برلين',
  'geneva': 'جنيف',
  'melbourne': 'ملبورن',
  'cambridge': 'كامبريدج',
  'boston': 'بوسطن',
  'new haven': 'نيو هيفن',
  'riyadh': 'الرياض',
  'dhahran': 'الظهران',
  'thuwal': 'ثول',
};

const tagTranslations: Record<string, string> = {
  'innovation': 'ابتكار',
  'research': 'أبحاث',
  'tech': 'تكنولوجيا',
  'technology': 'تكنولوجيا',
  'coding': 'برمجة',
  'startups': 'شركات ناشئة',
  'business': 'أعمال',
  'finance': 'تمويل',
  'leadership': 'قيادة',
  'international relations': 'علاقات دولية',
  'policy': 'سياسات',
  'science': 'علوم',
  'data': 'بيانات',
  'engineering': 'هندسة',
  'stem': 'العلوم والتكنولوجيا',
};

const translateCountry = (country?: string | null) => {
  if (!country) return 'عالمي';
  const key = country.toLowerCase().trim();
  return countryTranslations[key] || country;
};

const translateCity = (city?: string | null) => {
  if (!city) return '';
  const key = city.toLowerCase().trim();
  return cityTranslations[key] || city;
};

const translateTag = (tag: string, isAr: boolean) => {
  if (!isAr) return tag.trim();
  const key = tag.toLowerCase().trim();
  return tagTranslations[key] || tag.trim();
};

export default function UniversityGrid() {
  const t = useTranslations('UniversityGrid');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUni, setSelectedUni] = useState<{ id: string; name: string } | null>(null);
  const [universities, setUniversities] = useState<any[]>(universitiesData);
  const [loading, setLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const regions = [
    { key: 'all', nameEn: 'All', nameAr: 'الكل' },
    { key: 'saudi', nameEn: 'Saudi Arabia', nameAr: 'السعودية' },
    { key: 'us', nameEn: 'USA', nameAr: 'أمريكا' },
    { key: 'uk', nameEn: 'UK', nameAr: 'بريطانيا' },
    { key: 'europe', nameEn: 'Europe', nameAr: 'أوروبا' },
    { key: 'other', nameEn: 'Other', nameAr: 'أخرى' },
  ];

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Merge universitiesData with any custom universities added to Supabase
        const knownIds = new Set(universitiesData.map((u) => u.id.toLowerCase()));
        const customUnis = data.filter(
          (u) =>
            !knownIds.has((u.id || '').toLowerCase()) &&
            !universitiesData.some(
              (item) => item.name.toLowerCase() === (u.name || '').toLowerCase()
            )
        );
        setUniversities([...universitiesData, ...customUnis]);
      }
    } catch (err) {
      console.error('Error fetching universities from Supabase:', err);
    }
  };

  const handleRequestInfo = (id: string, name: string) => {
    setSelectedUni({ id, name });
    setModalOpen(true);
  };

  const getTags = (uniId: string) => {
    switch (uniId) {
      case 'harvard':
        return isAr ? ['قيادة', 'ابتكار', 'تأثير عالمي'] : ['LEADERSHIP', 'INNOVATION', 'GLOBAL IMPACT'];
      case 'oxford':
        return isAr ? ['تميز أكاديمي', 'قيادة', 'منظور عالمي'] : ['ACADEMIC EXCELLENCE', 'LEADERSHIP', 'GLOBAL PERSPECTIVE'];
      case 'stanford':
        return isAr ? ['ابتكار', 'ريادة أعمال', 'قيادة'] : ['INNOVATION', 'ENTREPRENEURSHIP', 'LEADERSHIP'];
      case 'mit':
        return isAr ? ['تكنولوجيا', 'ابتكار', 'حل المشكلات'] : ['STEM', 'INNOVATION', 'PROBLEM SOLVING'];
      case 'cambridge':
        return isAr ? ['بحث علمي', 'منحة دراسية', 'تفكير نقدي'] : ['SCHOLARSHIP', 'RESEARCH', 'CRITICAL THINKING'];
      case 'yale':
        return isAr ? ['قيادة', 'شؤون عالمية', 'تميز أكاديمي'] : ['LEADERSHIP', 'GLOBAL AFFAIRS', 'ACADEMIC EXCELLENCE'];
      case 'ksu':
        return isAr ? ['طب', 'هندسة', 'تميز وطني'] : ['MEDICINE', 'ENGINEERING', 'NATIONAL IMPACT'];
      case 'kfupm':
        return isAr ? ['طاقة', 'هندسة', 'ابتكار صناعي'] : ['ENERGY', 'STEM', 'INDUSTRIAL LEADERSHIP'];
      case 'kaust':
        return isAr ? ['بحث علمي', 'ابتكار', 'دراسات عليا'] : ['RESEARCH', 'INNOVATION', 'GRADUATE STEM'];
      default:
        return [];
    }
  };

  const getUniName = (uni: any) => {
    if (isAr) {
      return uni.name_ar || nameTranslations[uni.name] || uni.name;
    }
    return uni.name;
  };

  const getUniLocation = (uni: any) => {
    if (uni.location) {
      return isAr ? uni.location.ar : uni.location.en;
    }
    if (isAr) {
      const city = translateCity(uni.city);
      const country = translateCountry(uni.country);
      return city ? `${city}، ${country}` : country;
    }
    return uni.city ? `${uni.city}, ${uni.country || 'Global'}` : uni.country || 'Global';
  };

  const getUniDescription = (uni: any) => {
    if (isAr) {
      return uni.overview?.ar || descTranslations[uni.description] || uni.description_ar || uni.description;
    }
    return uni.overview?.en || uni.description;
  };

  const getUniTags = (uni: any) => {
    const predefined = getTags(uni.id);
    if (predefined.length > 0) return predefined.join(' • ');
    if (uni.tags) {
      return uni.tags
        .split(',')
        .map((t: string) => translateTag(t, isAr))
        .join(' • ');
    }
    return '';
  };

  // Filter universities based on search query and region category
  const filteredUniversities = universities.filter((uni) => {
    const name = (getUniName(uni) || '').toLowerCase();
    const location = (getUniLocation(uni) || '').toLowerCase();
    const rawCountry = (uni.country || '').toLowerCase();
    const desc = (getUniDescription(uni) || '').toLowerCase();
    const tags = (getUniTags(uni) || '').toLowerCase();

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        name.includes(q) ||
        location.includes(q) ||
        rawCountry.includes(q) ||
        desc.includes(q) ||
        tags.includes(q);
      if (!matches) return false;
    }

    // 2. Region Category
    if (selectedRegion === 'all') return true;
    if (selectedRegion === 'saudi') {
      return (
        rawCountry.includes('saudi') ||
        location.includes('saudi') ||
        location.includes('سعودي') ||
        location.includes('الرياض') ||
        ['ksu', 'kfupm', 'kaust'].includes(uni.id)
      );
    }
    if (selectedRegion === 'us') {
      return (
        rawCountry.includes('united states') ||
        rawCountry.includes('usa') ||
        rawCountry.includes('us') ||
        location.includes('united states') ||
        location.includes('أمريكا') ||
        location.includes('الولايات المتحدة') ||
        ['harvard', 'stanford', 'mit', 'yale', 'silicon-valley-tech'].includes(uni.id)
      );
    }
    if (selectedRegion === 'uk') {
      return (
        rawCountry.includes('united kingdom') ||
        rawCountry.includes('uk') ||
        location.includes('united kingdom') ||
        location.includes('بريطانيا') ||
        location.includes('المملكة المتحدة') ||
        ['oxford', 'cambridge', 'oxford-innovation'].includes(uni.id)
      );
    }
    if (selectedRegion === 'europe') {
      return (
        rawCountry.includes('germany') ||
        rawCountry.includes('switzerland') ||
        location.includes('germany') ||
        location.includes('switzerland') ||
        location.includes('ألمانيا') ||
        location.includes('سويسرا') ||
        location.includes('europe') ||
        ['berlin-business', 'global-leadership'].includes(uni.id)
      );
    }
    if (selectedRegion === 'other') {
      return (
        rawCountry.includes('australia') ||
        location.includes('australia') ||
        location.includes('أستراليا') ||
        ['melbourne-science'].includes(uni.id)
      );
    }
    return true;
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
  };

  return (
    <section className="w-full py-12 sm:py-16 md:py-24 bg-white overflow-hidden" id="network">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full max-w-full">
        {/* Header - Left-aligned in both languages */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="flex flex-col mb-8 sm:mb-12 md:mb-16 max-w-3xl items-start text-left w-full"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="h-[1.5px] w-8 sm:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
              {t('badge')}
            </span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0B2545] leading-tight mb-4 sm:mb-6 ${
              isAr ? 'font-arabic' : ''
            }`}
          >
            {t('title')}
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className={`space-y-2 sm:space-y-4 text-gray-600 font-sans text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed text-left ${
              isAr ? 'font-arabic' : ''
            }`}
          >
            <p>{t('subtitle1')}</p>
            <p>{t('subtitle2')}</p>
          </motion.div>
        </motion.div>

        {/* Search & Filter Section - strictly mobile-first stack */}
        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 mb-8 sm:mb-10 p-3 sm:p-4 bg-gray-50/90 rounded-2xl border border-gray-200/80">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن جامعة، دولة، أو تخصص...' : 'Search universities, countries, or tags...'}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-[#0B2545] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs p-1"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Region Filters - wrap naturally without horizontal scrolling */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto">
            {regions.map((reg) => (
              <button
                key={reg.key}
                type="button"
                onClick={() => setSelectedRegion(reg.key)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedRegion === reg.key
                    ? 'bg-[#0B2545] text-[#D4AF37] shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {isAr ? reg.nameAr : reg.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Grid: Defaults to 1 col on mobile, 2 on md, 3 on lg */}
        {loading ? (
          <div className="flex justify-center items-center py-20 w-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : filteredUniversities.length === 0 ? (
          <div className="w-full py-12 sm:py-16 px-4 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm mb-4">
              {isAr ? 'لم يتم العثور على جامعات تطابق بحثك.' : 'No universities found matching your search.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('all');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B2545] text-white text-xs font-semibold hover:bg-[#1a365d] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}</span>
            </button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 w-full max-w-full"
          >
            {filteredUniversities.map((uni, index) => {
              const displayName = getUniName(uni);
              const displayLocation = getUniLocation(uni);
              const displayTags = getUniTags(uni);
              const displayDescription = getUniDescription(uni);
              const logoSrc = uni.logo || uni.logo_url || '/placeholder-logo.png';

              return (
                <motion.div
                  key={uni.id || index}
                  variants={itemVariants}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-200/90 p-5 sm:p-6 lg:p-8 flex flex-col h-full w-full max-w-full hover:shadow-xl hover:border-[#D4AF37]/50 transition-all duration-300 ${
                    isAr ? 'font-arabic' : ''
                  }`}
                >
                  {/* Header: Logo & Name - Always left aligned */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-2 text-left">
                    <img
                      src={logoSrc}
                      alt={displayName}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 rounded-xl bg-gray-50 border border-gray-100 p-1"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <h3 className="font-serif text-lg sm:text-xl leading-snug text-[#0B2545] font-bold mb-1 break-words">
                        {displayName}
                      </h3>
                      <div className="text-xs sm:text-[13px] text-gray-500 font-medium flex items-center gap-1.5 text-left justify-start">
                        {displayLocation}
                      </div>
                    </div>
                  </div>

                  {/* Tags - Always left aligned */}
                  <div className="text-[10px] sm:text-[11px] font-bold text-[#D4AF37] tracking-wider uppercase mb-3 mt-3 sm:mt-4 flex-wrap flex gap-1 justify-start text-left">
                    {displayTags}
                  </div>

                  {/* Description - Always left aligned */}
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed flex-grow mb-6 sm:mb-8 text-left">
                    {displayDescription}
                  </p>

                  {/* Actions - Mobile-first stacking on mobile, row on sm+ */}
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full mt-auto">
                    <Link
                      href={`/${locale}/universities/${uni.id}`}
                      className="w-full sm:flex-1 inline-flex justify-center items-center gap-2 bg-[#0B2545] text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors hover:bg-[#1a365d]"
                    >
                      <span>{t('viewBtn')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleRequestInfo(uni.id, displayName)}
                      className="w-full sm:flex-1 inline-flex justify-center items-center gap-2 bg-gray-100 text-[#0B2545] px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors hover:bg-gray-200"
                    >
                      <span>{t('requestInfo')}</span>
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Modal */}
      {selectedUni && (
        <RequestInfoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          universityId={selectedUni.id}
          universityName={selectedUni.name}
        />
      )}
    </section>
  );
}
