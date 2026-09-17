export interface Event {
  id: string;
  titleEn: string;
  titleAr: string;
  categoryEn: string;
  categoryAr: string;
  dateEn: string;
  dateAr: string;
  timeEn: string;
  timeAr: string;
  locationEn: string;
  locationAr: string;
  hostEn: string;
  hostAr: string;
  seats: number;
  type: 'virtual' | 'in-person';
  typeLabelEn: string;
  typeLabelAr: string;
}

export const upcomingEvents: Event[] = [
  {
    id: "guf-2026",
    titleEn: "Global University Fair 2026",
    titleAr: "معرض الجامعات العالمية 2026",
    categoryEn: "University Fairs",
    categoryAr: "معارض الجامعات",
    dateEn: "Oct 15, 2026",
    dateAr: "15 أكتوبر 2026",
    timeEn: "09:00 AM - 05:00 PM",
    timeAr: "09:00 صباحاً - 05:00 مساءً",
    locationEn: "Riyadh Exhibition Center",
    locationAr: "مركز معارض الرياض",
    hostEn: "YLA & Partner Universities",
    hostAr: "أكاديمية القادة الشباب والجامعات الشريكة",
    seats: 500,
    type: "in-person",
    typeLabelEn: "In-Person",
    typeLabelAr: "حضوري"
  },
  {
    id: "leadership-career",
    titleEn: "Leadership & Career Workshop",
    titleAr: "ورشة عمل القيادة والمسار المهني",
    categoryEn: "Workshops",
    categoryAr: "ورش عمل",
    dateEn: "Nov 02, 2026",
    dateAr: "02 نوفمبر 2026",
    timeEn: "04:00 PM - 07:00 PM",
    timeAr: "04:00 مساءً - 07:00 مساءً",
    locationEn: "Jeddah Hilton",
    locationAr: "فندق هيلتون جدة",
    hostEn: "King Saud University Reps",
    hostAr: "ممثلي جامعة الملك سعود",
    seats: 120,
    type: "in-person",
    typeLabelEn: "In-Person",
    typeLabelAr: "حضوري"
  },
  {
    id: "us-uk-webinar",
    titleEn: "US/UK University Application Webinar",
    titleAr: "ندوة التقديم للجامعات الأمريكية والبريطانية",
    categoryEn: "Webinars",
    categoryAr: "ندوات عبر الإنترنت",
    dateEn: "Nov 15, 2026",
    dateAr: "15 نوفمبر 2026",
    timeEn: "06:00 PM - 08:00 PM",
    timeAr: "06:00 مساءً - 08:00 مساءً",
    locationEn: "Zoom Meeting",
    locationAr: "اجتماع زووم",
    hostEn: "Oxford & MIT Alumni",
    hostAr: "خريجي أكسفورد ومعهد ماساتشوستس للتكنولوجيا",
    seats: 300,
    type: "virtual",
    typeLabelEn: "Virtual",
    typeLabelAr: "افتراضي"
  },
  {
    id: "parent-readiness",
    titleEn: "Parent Guide: University Readiness",
    titleAr: "دليل الآباء: الجاهزية الجامعية",
    categoryEn: "Webinars",
    categoryAr: "ندوات عبر الإنترنت",
    dateEn: "Dec 01, 2026",
    dateAr: "01 ديسمبر 2026",
    timeEn: "07:00 PM - 08:30 PM",
    timeAr: "07:00 مساءً - 08:30 مساءً",
    locationEn: "Microsoft Teams",
    locationAr: "مايكروسوفت تيمز",
    hostEn: "YLA Senior Coaches",
    hostAr: "كبار مدربي أكاديمية القادة الشباب",
    seats: 500,
    type: "virtual",
    typeLabelEn: "Virtual",
    typeLabelAr: "افتراضي"
  }
];
