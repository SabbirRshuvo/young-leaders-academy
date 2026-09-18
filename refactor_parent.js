const fs = require('fs');

const dashboardFile = 'app/[locale]/parent/dashboard/page.tsx';
const childrenFile = 'app/[locale]/parent/children/page.tsx';
const enJsonFile = 'messages/en.json';
const arJsonFile = 'messages/ar.json';

const translations = {
  parentDashboard: { en: "Parent Dashboard", ar: "لوحة تحكم ولي الأمر" },
  welcomeBack: { en: "Welcome back!", ar: "مرحباً بعودتك!" },
  keepTrack: { en: "Keep track of your children's applications, programs, events, and opportunities at Young Leaders Academy.", ar: "تتبع طلبات أبنائك، والبرامج، والفعاليات، والفرص في أكاديمية القادة الشباب." },
  viewMyChildren: { en: "View My Children", ar: "عرض أبنائي" },
  myChildren: { en: "My Children", ar: "أبنائي" },
  monitorProgress: { en: "Monitor your children's progress.", ar: "راقب تقدم أبنائك." },
  viewAll: { en: "View All", ar: "عرض الكل" },
  viewProfile: { en: "View Profile", ar: "عرض الملف الشخصي" },
  viewApplications: { en: "View Applications", ar: "عرض الطلبات" },
  upcomingEvents: { en: "Upcoming Events", ar: "الفعاليات القادمة" },
  stayInformed: { en: "Stay informed about academy events.", ar: "ابق على اطلاع بفعاليات الأكاديمية." },
  viewAllEvents: { en: "View All Events", ar: "عرض جميع الفعاليات" },
  quickActions: { en: "Quick Actions", ar: "إجراءات سريعة" },
  quickAccess: { en: "Quickly access the things you may need.", ar: "الوصول السريع إلى الأشياء التي قد تحتاجها." },
  needHelp: { en: "Need help?", ar: "هل تحتاج إلى المساعدة؟" },
  ifYouHaveQuestions: { en: "If you have questions about your child's application or program, our team is here to help.", ar: "إذا كان لديك أسئلة حول طلب ابنك أو برنامجه، فريقنا هنا للمساعدة." },
  contactUs: { en: "Contact Us", ar: "اتصل بنا" },
  
  parentPortal: { en: "Parent Portal", ar: "بوابة ولي الأمر" },
  viewChildrenInfo: { en: "View your children's information, track their programs, and monitor their application progress.", ar: "عرض معلومات أبنائك، وتتبع برامجهم، ومراقبة تقدم طلباتهم." },
  totalApplications: { en: "Total submitted applications", ar: "إجمالي الطلبات المقدمة" },
  activeProgress: { en: "Children with active progress", ar: "الأبناء الذين لديهم تقدم نشط" },
  searchPlaceholder: { en: "Search by name, school, or program...", ar: "ابحث بالاسم، أو المدرسة، أو البرنامج..." },
  yourChildren: { en: "Your Children", ar: "أبناؤك" },
  applications: { en: "Applications", ar: "الطلبات" },
  noChildrenFound: { en: "No children found", ar: "لم يتم العثور على أبناء" },
  noChildrenDesc: { en: "We couldn't find any children matching your search. Once a child is connected to your account, their information will appear here.", ar: "لم نتمكن من العثور على أي أبناء يطابقون بحثك. بمجرد ربط ابن بحسابك، ستظهر معلوماته هنا." },
  contactSupport: { en: "Contact Support", ar: "الاتصال بالدعم" }
};

// 1. Update JSON files
const en = JSON.parse(fs.readFileSync(enJsonFile, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arJsonFile, 'utf8'));

if (!en.Parent) en.Parent = {};
if (!ar.Parent) ar.Parent = {};

for (const [key, val] of Object.entries(translations)) {
  en.Parent[key] = val.en;
  ar.Parent[key] = val.ar;
}

fs.writeFileSync(enJsonFile, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(arJsonFile, JSON.stringify(ar, null, 2) + '\n');

// 2. Replacer logic
function refactorFile(filePath) {
  let file = fs.readFileSync(filePath, 'utf8');

  // Inject useTranslations if missing
  if (!file.includes('useTranslations')) {
    if (file.includes('import { useRouter }')) {
      file = file.replace('import { useRouter } from "next/navigation";', 'import { useRouter } from "next/navigation";\nimport { useTranslations } from "next-intl";');
    } else {
      file = file.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { useTranslations } from "next-intl";');
    }
  }

  // Find default export and inject t
  const defaultExportRegex = /export default function [A-Za-z0-9_]+\(\) \{\r?\n/;
  const defaultMatch = file.match(defaultExportRegex);
  if (defaultMatch && !file.includes('useTranslations("Parent")')) {
    file = file.replace(defaultExportRegex, defaultMatch[0] + '  const t = useTranslations("Parent");\n');
  }

  const replaceTextRegex = (search, key) => {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`>\\s*${escapedSearch}\\s*<`, 'g');
    file = file.replace(regex, `>\n      {t("${key}")}\n    <`);
  };

  const stringsToReplace = {
    "Parent Dashboard": "parentDashboard",
    "Welcome back!": "welcomeBack",
    "View My Children": "viewMyChildren",
    "My Children": "myChildren",
    "Monitor your children's progress.": "monitorProgress",
    "View All": "viewAll",
    "View Profile": "viewProfile",
    "View Applications": "viewApplications",
    "Upcoming Events": "upcomingEvents",
    "Stay informed about academy events.": "stayInformed",
    "View All Events": "viewAllEvents",
    "Quick Actions": "quickActions",
    "Quickly access the things you may need.": "quickAccess",
    "Need help?": "needHelp",
    "Contact Us": "contactUs",
    "Parent Portal": "parentPortal",
    "Your Children": "yourChildren",
    "Parent Profile": "parentDashboard", // Wait, Parent Profile already translated in Profile, but we can reuse Parent dashboard here or just string Parent Profile
    "Applications": "applications",
    "No children found": "noChildrenFound",
    "Contact Support": "contactSupport"
  };

  for (const [text, key] of Object.entries(stringsToReplace)) {
    replaceTextRegex(text, key);
  }
  
  // Custom replacements for multiline or specific structures
  file = file.replace(/Keep track of your children's applications,[\s\S]*?Leaders Academy\./g, '{t("keepTrack")}');
  file = file.replace(/If you have questions about your child's[\s\S]*?to help\./g, '{t("ifYouHaveQuestions")}');
  file = file.replace(/View your children's information, track their[\s\S]*?application[\s\S]*?progress\./g, '{t("viewChildrenInfo")}');
  file = file.replace(/description="Total submitted applications"/g, 'description={t("totalApplications")}');
  file = file.replace(/description="Children with active progress"/g, 'description={t("activeProgress")}');
  file = file.replace(/placeholder="Search by name, school, or program..."/g, 'placeholder={t("searchPlaceholder")}');
  file = file.replace(/We couldn't find any children matching your search\. Once a[\s\S]*?appear here\./g, '{t("noChildrenDesc")}');

  // Replace 'Parent Profile' if it's there
  replaceTextRegex("Parent Profile", "parentDashboard");

  fs.writeFileSync(filePath, file);
}

refactorFile(dashboardFile);
refactorFile(childrenFile);

console.log('Refactored Parent Dashboard and Children pages');
