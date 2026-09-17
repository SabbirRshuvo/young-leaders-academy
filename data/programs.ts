export interface LocalizedString {
  en: string;
  ar: string;
}

export interface LocalizedArray {
  en: string[];
  ar: string[];
}

export interface CurriculumModule {
  module: string;
  title: LocalizedString;
  description: LocalizedString;
}

export interface Program {
  id: string;
  title: LocalizedString;
  badge: LocalizedString;
  heroImage: string;
  ageGroup: LocalizedString;
  duration: LocalizedString;
  mode: LocalizedString;
  startDate: LocalizedString;
  fee: LocalizedString;
  overview: LocalizedString;
  learningOutcomes: LocalizedArray;
  curriculum: CurriculumModule[];
}

export const programsData: Program[] = [
  {
    id: "global-young-leaders-fellowship",
    title: {
      en: "Global Young Leaders Fellowship",
      ar: "زمالة قادة الشباب العالمية"
    },
    badge: {
      en: "Featured Program",
      ar: "برنامج مميز"
    },
    heroImage: "/features-program.png",
    ageGroup: {
      en: "16-22 Years",
      ar: "١٦-٢٢ سنة"
    },
    duration: {
      en: "2 Weeks",
      ar: "أسبوعين"
    },
    mode: {
      en: "In-Person + Online",
      ar: "حضور شخصي + عبر الإنترنت"
    },
    startDate: {
      en: "July 15, 2027",
      ar: "١٥ يوليو ٢٠٢٧"
    },
    fee: {
      en: "Scholarship Available",
      ar: "منح دراسية متاحة"
    },
    overview: {
      en: "A transformative program that brings together outstanding young minds from around the world to develop leadership skills, build global networks and create real-world impact. This exclusive fellowship is designed for ambitious individuals seeking to make a difference.",
      ar: "برنامج تحويلي يجمع بين العقول الشابة المتميزة من جميع أنحاء العالم لتطوير مهارات القيادة وبناء شبكات عالمية وخلق تأثير في العالم الحقيقي. تم تصميم هذه الزمالة الحصرية للأفراد الطموحين الذين يسعون لإحداث فرق."
    },
    learningOutcomes: {
      en: [
        "Advanced leadership frameworks",
        "Cross-cultural communication skills",
        "Strategic project management",
        "Global networking strategies"
      ],
      ar: [
        "أطر القيادة المتقدمة",
        "مهارات التواصل عبر الثقافات",
        "إدارة المشاريع الاستراتيجية",
        "استراتيجيات بناء الشبكات العالمية"
      ]
    },
    curriculum: [
      {
        module: "01",
        title: { en: "Foundations of Global Leadership", ar: "أسس القيادة العالمية" },
        description: { en: "Understand the core principles of leading across borders and cultures.", ar: "فهم المبادئ الأساسية للقيادة عبر الحدود والثقافات." }
      },
      {
        module: "02",
        title: { en: "Impact-Driven Innovation", ar: "الابتكار الموجه نحو التأثير" },
        description: { en: "Learn to design solutions for complex global challenges.", ar: "تعلم تصميم حلول للتحديات العالمية المعقدة." }
      }
    ]
  },
  {
    id: "high-school-leadership-program",
    title: {
      en: "High School Leadership Program",
      ar: "برنامج القيادة في المدرسة الثانوية"
    },
    badge: {
      en: "High School",
      ar: "المرحلة الثانوية"
    },
    heroImage: "/high-school.png",
    ageGroup: {
      en: "14-18 Years",
      ar: "١٤-١٨ سنة"
    },
    duration: {
      en: "4 Weeks",
      ar: "٤ أسابيع"
    },
    mode: {
      en: "Online Interactive",
      ar: "عبر الإنترنت (تفاعلي)"
    },
    startDate: {
      en: "Rolling Admissions",
      ar: "قبول مستمر"
    },
    fee: {
      en: "$499 USD",
      ar: "٤٩٩ دولار أمريكي"
    },
    overview: {
      en: "Build confidence, develop essential leadership skills and discover your unique potential as a future changemaker. Our high school program sets the foundation for university success and lifelong leadership.",
      ar: "ابنِ ثقتك بنفسك، وطوّر مهارات القيادة الأساسية، واكتشف إمكاناتك الفريدة كصانع تغيير مستقبلي. يضع برنامجنا للمدرسة الثانوية الأساس للنجاح الجامعي والقيادة مدى الحياة."
    },
    learningOutcomes: {
      en: [
        "Self-awareness and confidence",
        "Effective public speaking",
        "Team collaboration techniques",
        "Goal setting and time management"
      ],
      ar: [
        "الوعي الذاتي والثقة بالنفس",
        "التحدث أمام الجمهور بفعالية",
        "تقنيات التعاون والعمل الجماعي",
        "تحديد الأهداف وإدارة الوقت"
      ]
    },
    curriculum: [
      {
        module: "01",
        title: { en: "Discovering Your Potential", ar: "اكتشاف إمكاناتك" },
        description: { en: "Identify your strengths, values, and leadership style.", ar: "تحديد نقاط القوة والقيم وأسلوب القيادة الخاص بك." }
      },
      {
        module: "02",
        title: { en: "Communication & Influence", ar: "التواصل والتأثير" },
        description: { en: "Master the art of articulating ideas and influencing peers.", ar: "إتقان فن التعبير عن الأفكار والتأثير في الأقران." }
      }
    ]
  },
  {
    id: "global-mentorship-program",
    title: {
      en: "Global Mentorship Program",
      ar: "برنامج الإرشاد العالمي"
    },
    badge: {
      en: "Mentorship",
      ar: "الإرشاد والتوجيه"
    },
    heroImage: "/global-mentor.png",
    ageGroup: {
      en: "16-25 Years",
      ar: "١٦-٢٥ سنة"
    },
    duration: {
      en: "8 Weeks",
      ar: "٨ أسابيع"
    },
    mode: {
      en: "1-on-1 Online",
      ar: "عبر الإنترنت (فردي)"
    },
    startDate: {
      en: "Flexible",
      ar: "مرن"
    },
    fee: {
      en: "$899 USD",
      ar: "٨٩٩ دولار أمريكي"
    },
    overview: {
      en: "Get guidance from industry leaders and alumni, and gain valuable insights into global opportunities. Tailored to your career aspirations, this program pairs you with a mentor who shares your ambitions.",
      ar: "احصل على إرشادات من قادة الصناعة والخريجين، واكتسب رؤى قيمة حول الفرص العالمية. تم تصميم هذا البرنامج خصيصًا لتطلعاتك المهنية، حيث يجمعك بمرشد يشاركك طموحاتك."
    },
    learningOutcomes: {
      en: [
        "Personalized career roadmapping",
        "Industry-specific knowledge",
        "Professional networking skills",
        "Interview and resume prep"
      ],
      ar: [
        "تخطيط المسار المهني الشخصي",
        "معرفة متخصصة في مجال الصناعة",
        "مهارات بناء العلاقات المهنية",
        "التحضير للمقابلات والسيرة الذاتية"
      ]
    },
    curriculum: [
      {
        module: "01",
        title: { en: "Goal Setting & Pairing", ar: "تحديد الأهداف والمطابقة" },
        description: { en: "Define your objectives and meet your expert mentor.", ar: "تحديد أهدافك ومقابلة مرشدك الخبير." }
      },
      {
        module: "02",
        title: { en: "Strategic Execution", ar: "التنفيذ الاستراتيجي" },
        description: { en: "Work through real challenges and build your professional portfolio.", ar: "العمل على تحديات حقيقية وبناء ملفك المهني." }
      }
    ]
  },
  {
    id: "future-skills-executive-program",
    title: {
      en: "Future Skills & Executive Program",
      ar: "برنامج المهارات المستقبلية والتنفيذية"
    },
    badge: {
      en: "Executive",
      ar: "تنفيذي"
    },
    heroImage: "/future-skill.png",
    ageGroup: {
      en: "16-28 Years",
      ar: "١٦-٢٨ سنة"
    },
    duration: {
      en: "6 Weeks",
      ar: "٦ أسابيع"
    },
    mode: {
      en: "Hybrid",
      ar: "هجين (مدمج)"
    },
    startDate: {
      en: "September 10, 2027",
      ar: "١٠ سبتمبر ٢٠٢٧"
    },
    fee: {
      en: "$1,200 USD",
      ar: "١,٢٠٠ دولار أمريكي"
    },
    overview: {
      en: "Develop critical thinking, communication, and problem-solving skills for academic and professional success. This fast-paced executive track bridges the gap between university education and modern workplace demands.",
      ar: "طوّر مهارات التفكير النقدي والتواصل وحل المشكلات من أجل النجاح الأكاديمي والمهني. يسد هذا المسار التنفيذي السريع الفجوة بين التعليم الجامعي ومتطلبات بيئة العمل الحديثة."
    },
    learningOutcomes: {
      en: [
        "Data-driven decision making",
        "Agile project management",
        "Executive communication",
        "Financial literacy basics"
      ],
      ar: [
        "اتخاذ القرارات المبنية على البيانات",
        "إدارة المشاريع الرشيقة (Agile)",
        "التواصل التنفيذي",
        "أساسيات الثقافة المالية"
      ]
    },
    curriculum: [
      {
        module: "01",
        title: { en: "The Modern Professional", ar: "المحترف الحديث" },
        description: { en: "Master the soft skills required in the 21st-century workplace.", ar: "إتقان المهارات الشخصية المطلوبة في بيئة عمل القرن الحادي والعشرين." }
      },
      {
        module: "02",
        title: { en: "Analytical Thinking", ar: "التفكير التحليلي" },
        description: { en: "Solve complex problems using structured frameworks.", ar: "حل المشكلات المعقدة باستخدام أطر منظمة." }
      }
    ]
  },
  {
    id: "summer-leadership-camp",
    title: {
      en: "Summer Leadership Camp",
      ar: "مخيم القيادة الصيفي"
    },
    badge: {
      en: "Summer Camp",
      ar: "مخيم صيفي"
    },
    heroImage: "/summer.png",
    ageGroup: {
      en: "12-16 Years",
      ar: "١٢-١٦ سنة"
    },
    duration: {
      en: "2 Weeks",
      ar: "أسبوعين"
    },
    mode: {
      en: "In-Person (Outdoor)",
      ar: "حضور شخصي (في الهواء الطلق)"
    },
    startDate: {
      en: "August 1, 2027",
      ar: "١ أغسطس ٢٠٢٧"
    },
    fee: {
      en: "$1,500 USD",
      ar: "١,٥٠٠ دولار أمريكي"
    },
    overview: {
      en: "An immersive summer experience focused on team-building, outdoor challenges, and leadership development. Disconnect from screens and connect with nature and peers in this unforgettable journey.",
      ar: "تجربة صيفية غامرة تركز على بناء الفريق والتحديات في الهواء الطلق وتطوير القيادة. انفصل عن الشاشات وتواصل مع الطبيعة والأقران في هذه الرحلة التي لا تُنسى."
    },
    learningOutcomes: {
      en: [
        "Resilience and adaptability",
        "Outdoor survival basics",
        "Conflict resolution in groups",
        "Environmental stewardship"
      ],
      ar: [
        "المرونة والقدرة على التكيف",
        "أساسيات البقاء في الهواء الطلق",
        "حل النزاعات داخل المجموعات",
        "الإشراف البيئي"
      ]
    },
    curriculum: [
      {
        module: "01",
        title: { en: "Wilderness Team Building", ar: "بناء الفريق في الطبيعة" },
        description: { en: "Learn to trust and lead peers through physical challenges.", ar: "تعلم الثقة وقيادة الأقران من خلال التحديات البدنية." }
      },
      {
        module: "02",
        title: { en: "Mindfulness & Reflection", ar: "اليقظة الذهنية والتأمل" },
        description: { en: "Develop emotional intelligence through guided reflection.", ar: "تطوير الذكاء العاطفي من خلال التأمل الموجه." }
      }
    ]
  }
];
