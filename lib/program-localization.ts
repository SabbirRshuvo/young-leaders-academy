import { programsData } from "@/data/programs";

export const PROGRAM_TRANSLATIONS: Record<string, { title: string; description: string; category?: string }> = {
  "Advanced Leadership & Management": {
    title: "القيادة المتقدمة والإدارة",
    description: "طوّر مهارات القيادة الأساسية لإدارة الفرق بفعالية، وتحقيق النجاح المؤسسي، والتعامل مع تحديات الأعمال المعقدة بثقة واحترافية.",
    category: "القيادة"
  },
  "Digital Marketing Bootcamp": {
    title: "معسكر التسويق الرقمي",
    description: "أتقن استراتيجيات التسويق الرقمي الحديثة، بما في ذلك تحسين محركات البحث، وإعلانات التواصل الاجتماعي، والتحليلات لبناء حملات تسويقية ناجحة.",
    category: "التسويق"
  },
  "Data Science & Analytics": {
    title: "علم البيانات والتحليلات",
    description: "تعمق في معالجة البيانات وتصويرها والنمذجة التنبؤية. تعلم كيفية تحويل البيانات الأولية إلى ذكاء أعمال قابل للتنفيذ ومؤثر.",
    category: "التكنولوجيا"
  },
  "Global Entrepreneurship": {
    title: "ريادة الأعمال العالمية",
    description: "حوّل أفكارك المبتكرة إلى شركات قابلة للتطوير. تعلّم أساسيات نمو الشركات الناشئة، ورأس المال الاستثماري، والتوسع في الأسواق الإقليمية والدولية.",
    category: "الأعمال"
  },
  "UI/UX Design Masterclass": {
    title: "دورة متقدمة في تصميم واجهة وتجربة المستخدم",
    description: "تعلّم تصميم تجارب مستخدم بديهية وجذابة وسهلة الوصول. انتقل من التخطيط الأولي إلى النماذج التفاعلية باستخدام أحدث المعايير العالمية.",
    category: "التصميم"
  },
  "Full-Stack Web Development": {
    title: "تطوير الويب الشامل",
    description: "ابنِ تطبيقات ويب تفاعلية وسريعة الاستجابة من الصفر. أتقن تقنيات الواجهة الأمامية وهياكل الواجهة الخلفية لتصبح مطوراً محترفاً ومطلوباً.",
    category: "التكنولوجيا"
  },
  "Global Young Leaders Fellowship": {
    title: "زمالة قادة الشباب العالمية",
    description: "برنامج تحويلي يجمع بين العقول الشابة المتميزة من جميع أنحاء العالم لتطوير مهارات القيادة وبناء شبكات عالمية وخلق تأثير حقيقي في المجتمع.",
    category: "برنامج مميز"
  },
  "High School Leadership Program": {
    title: "برنامج القيادة للمرحلة الثانوية",
    description: "ابنِ ثقتك بنفسك، وطوّر مهارات القيادة والتواصل، واكتشف إمكاناتك الفريدة كصانع تغيير مستقبلي يؤسس لنجاحك الأكاديمي والجامعي.",
    category: "المرحلة الثانوية"
  },
  "Global Mentorship Program": {
    title: "برنامج الإرشاد والتوجيه العالمي",
    description: "احصل على توجيه فردي ومباشر من قادة الصناعة والخريجين المتميزين، واكتسب خبرات ورؤى قيّمة تفتح أمامك أبواب الفرص العالمية.",
    category: "إرشاد وتوجيه"
  },
  "Future Skills & Executive Program": {
    title: "برنامج المهارات المستقبلية والتنفيذية",
    description: "برنامج تنفيذي متقدم مصمم لتزويد قادة الغد بالمهارات الاستراتيجية والتكنولوجية والقيادية للتميز في بيئات العمل التنافسية.",
    category: "برنامج تنفيذي"
  },
  "Summer Leadership Camp": {
    title: "مخيم القيادة الصيفي المكثف",
    description: "مخيم صيفي عملي ومكثف مصمم لبناء الشخصية القيادية والمرونة والعمل الجماعي وحل المشكلات من خلال أنشطة تفاعلية ملهمة.",
    category: "مخيم صيفي"
  },
  "AI & Innovation Lab": {
    title: "مختبر الذكاء الاصطناعي والابتكار",
    description: "استكشف أحدث تطبيقات الذكاء الاصطناعي والتفكير التصميمي والابتكار التكنولوجي لتحويل الأفكار الإبداعية إلى مشاريع حقيقية.",
    category: "ابتكار وتقنية"
  }
};

export const PROGRAM_DESCRIPTION_MAP: Record<string, string> = {
  "Develop essential leadership skills to manage teams effectively, drive organizational success, and navigate complex business challenges with confidence.":
    "طوّر مهارات القيادة الأساسية لإدارة الفرق بفعالية، وتحقيق النجاح المؤسسي، والتعامل مع تحديات الأعمال المعقدة بثقة واحترافية.",
  "Master modern digital marketing strategies, including SEO, social media advertising, and analytics, to build impactful campaigns and grow any brand.":
    "أتقن استراتيجيات التسويق الرقمي الحديثة، بما في ذلك تحسين محركات البحث، وإعلانات التواصل الاجتماعي، والتحليلات لبناء حملات تسويقية ناجحة.",
  "Dive deep into data manipulation, visualization, and predictive modeling. Learn to translate raw data into actionable business intelligence.":
    "تعمق في معالجة البيانات وتصويرها والنمذجة التنبؤية. تعلم كيفية تحويل البيانات الأولية إلى ذكاء أعمال قابل للتنفيذ ومؤثر.",
  "Turn your innovative ideas into scalable businesses. Learn the fundamentals of startup growth, venture capital, and global market expansion.":
    "حوّل أفكارك المبتكرة إلى شركات قابلة للتطوير. تعلّم أساسيات نمو الشركات الناشئة، ورأس المال الاستثماري، والتوسع في الأسواق الإقليمية والدولية.",
  "Learn to design intuitive, accessible, and beautiful user experiences. Go from wireframing to prototyping using industry-standard design tools.":
    "تعلّم تصميم تجارب مستخدم بديهية وجذابة وسهلة الوصول. انتقل من التخطيط الأولي إلى النماذج التفاعلية باستخدام أحدث المعايير العالمية.",
  "Build dynamic, responsive web applications from scratch. Master both frontend technologies and robust backend architectures to become a complete developer.":
    "ابنِ تطبيقات ويب تفاعلية وسريعة الاستجابة من الصفر. أتقن تقنيات الواجهة الأمامية وهياكل الواجهة الخلفية لتصبح مطوراً محترفاً ومطلوباً."
};

export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  "Leadership": "القيادة",
  "Marketing": "التسويق",
  "Technology": "التكنولوجيا",
  "Business": "الأعمال",
  "Design": "التصميم",
  "Executive": "تنفيذي",
  "Mentorship": "إرشاد وتوجيه",
  "High School": "المرحلة الثانوية",
  "Featured Program": "برنامج مميز",
  "Featured": "مميز",
  "General": "عام"
};

export const SPEC_TRANSLATIONS: Record<string, string> = {
  // Age Groups
  "18-35 Years": "١٨ - ٣٥ سنة",
  "20-40 Years": "٢٠ - ٤٠ سنة",
  "16-35 Years": "١٦ - ٣٥ سنة",
  "18-40 Years": "١٨ - ٤٠ سنة",
  "18-30 Years": "١٨ - ٣٠ سنة",
  "14-18 Years": "١٤ - ١٨ سنة",
  "16-22 Years": "١٦ - ٢٢ سنة",
  "All Ages": "جميع الأعمار",

  // Durations
  "2 Weeks": "أسبوعين",
  "4 Weeks": "٤ أسابيع",
  "6 Weeks": "٦ أسابيع",
  "8 Weeks": "٨ أسابيع",
  "12 Weeks": "١٢ أسبوعاً",
  "16 Weeks": "١٦ أسبوعاً",
  "Flexible": "مرن",

  // Modes
  "Online": "عبر الإنترنت",
  "Online Interactive": "عبر الإنترنت (تفاعلي)",
  "In-Person": "حضور شخصي",
  "In-Person + Online": "حضور شخصي + عبر الإنترنت",
  "Hybrid": "تعليم مدمج",
  "Self-paced": "ذاتي التعلم",

  // Start Date / Admissions
  "Rolling Admissions": "قبول مستمر",
  "Flexible Start": "بداية مرنة",
  "Immediate": "فوري",
};

export const MODULE_TRANSLATIONS: Record<string, { title: string; description?: string }> = {
  "Module 1 Basics": {
    title: "الوحدة الأولى: الأساسيات والمفاهيم",
    description: "المقدمة والإعداد الأساسي للدورة والمنهج التدريبي"
  },
  "Module 2 Practice": {
    title: "الوحدة الثانية: التطبيق العملي",
    description: "التدريب العملي والتطبيقي المباشر وورش العمل"
  },
  "Module 3 Advanced": {
    title: "الوحدة الثالثة: المستوى المتقدم",
    description: "المواضيع المتقدمة والمشاريع النهائية"
  },
  "Introduction and core setup": {
    title: "المقدمة والإعداد الأساسي",
    description: "المقدمة والإعداد الأساسي للدورة والمنهج التدريبي"
  },
  "Practical hands on training": {
    title: "التدريب العملي والتطبيقي",
    description: "التدريب العملي والتطبيقي المباشر وورش العمل"
  },
  "Advanced topics and project": {
    title: "المواضيع المتقدمة والمشروع",
    description: "المواضيع المتقدمة والمشاريع النهائية"
  }
};

export function getLocalizedProgramText(
  value: any,
  isAr: boolean,
  field: "title" | "description" = "title",
  progTitleEn?: string
): string {
  if (!value) return "";

  // 1. If it's already an object { en, ar }
  if (typeof value === "object" && value !== null) {
    if (isAr && value.ar) return value.ar;
    if (value.en) return value.en;
  }

  // 2. If it's a JSON string '{"en": "...", "ar": "..."}'
  if (typeof value === "string" && value.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      if (isAr && parsed.ar) return parsed.ar;
      if (parsed.en) return parsed.en;
    } catch {
      // Ignore JSON parse error and fallback
    }
  }

  const strValue = typeof value === "string" ? value.trim() : String(value);

  // 3. If Arabic is active, check translation dictionary
  if (isAr) {
    if (field === "title") {
      if (PROGRAM_TRANSLATIONS[strValue]) {
        return PROGRAM_TRANSLATIONS[strValue].title;
      }
      // Case-insensitive match
      const key = Object.keys(PROGRAM_TRANSLATIONS).find(
        (k) => k.toLowerCase() === strValue.toLowerCase()
      );
      if (key) return PROGRAM_TRANSLATIONS[key].title;
    }

    if (field === "description") {
      // Direct description lookup
      if (PROGRAM_DESCRIPTION_MAP[strValue]) {
        return PROGRAM_DESCRIPTION_MAP[strValue];
      }
      // Trimmed partial match
      const descKey = Object.keys(PROGRAM_DESCRIPTION_MAP).find(
        (d) => d.toLowerCase() === strValue.toLowerCase()
      );
      if (descKey) return PROGRAM_DESCRIPTION_MAP[descKey];

      // Lookup by title
      const titleLookup = progTitleEn || strValue;
      if (PROGRAM_TRANSLATIONS[titleLookup]) {
        return PROGRAM_TRANSLATIONS[titleLookup].description;
      }
      const matchedTitleKey = Object.keys(PROGRAM_TRANSLATIONS).find(
        (k) => k.toLowerCase() === titleLookup.toLowerCase()
      );
      if (matchedTitleKey) return PROGRAM_TRANSLATIONS[matchedTitleKey].description;
    }

    // Fallback to static programsData
    const foundInStatic = programsData.find(
      (p) =>
        p.title.en.toLowerCase() === strValue.toLowerCase() ||
        (progTitleEn && p.title.en.toLowerCase() === progTitleEn.toLowerCase())
    );
    if (foundInStatic) {
      if (field === "title") return foundInStatic.title.ar;
      if (field === "description") return foundInStatic.overview.ar;
    }
  }

  return strValue;
}

export function getLocalizedCategory(cat: string | undefined, isAr: boolean): string {
  if (!cat) return isAr ? "عام" : "General";
  if (isAr) {
    return CATEGORY_TRANSLATIONS[cat] || cat;
  }
  return cat;
}

export function getLocalizedSpecValue(
  value: string | undefined | null,
  isAr: boolean,
  fallback: string = ""
): string {
  if (!value) return fallback;
  if (!isAr) return value;

  const trimmed = value.trim();
  if (SPEC_TRANSLATIONS[trimmed]) {
    return SPEC_TRANSLATIONS[trimmed];
  }

  // Handle Weeks pattern dynamically (e.g., "X Weeks")
  const weeksMatch = trimmed.match(/^(\d+)\s*Weeks?$/i);
  if (weeksMatch) {
    const num = weeksMatch[1];
    if (num === "1") return "أسبوع واحد";
    if (num === "2") return "أسبوعين";
    return `${num} أسابيع`;
  }

  // Handle Years pattern dynamically (e.g., "X-Y Years")
  const yearsMatch = trimmed.match(/^(\d+)-(\d+)\s*Years?$/i);
  if (yearsMatch) {
    return `${yearsMatch[1]} - ${yearsMatch[2]} سنة`;
  }

  return value;
}

export function getLocalizedModuleText(
  value: any,
  isAr: boolean,
  field: "title" | "description" = "title"
): string {
  if (!value) return "";

  // 1. If it's already an object { en, ar }
  if (typeof value === "object" && value !== null) {
    if (isAr && value.ar) return value.ar;
    if (value.en) return value.en;
  }

  // 2. If it's a JSON string '{"en": "...", "ar": "..."}'
  if (typeof value === "string" && value.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      if (isAr && parsed.ar) return parsed.ar;
      if (parsed.en) return parsed.en;
    } catch {
      // Ignore JSON parse error and fallback
    }
  }

  const str = typeof value === "string" ? value.trim() : String(value);
  if (!isAr) return str;

  if (MODULE_TRANSLATIONS[str]) {
    return field === "title" 
      ? MODULE_TRANSLATIONS[str].title 
      : (MODULE_TRANSLATIONS[str].description || MODULE_TRANSLATIONS[str].title);
  }

  return str;
}
