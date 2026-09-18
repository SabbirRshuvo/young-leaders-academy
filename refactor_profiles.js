const fs = require('fs');
const path = require('path');

const studentFile = 'app/[locale]/student/profile/page.tsx';
const parentFile = 'app/[locale]/parent/profile/page.tsx';
const enJsonFile = 'messages/en.json';
const arJsonFile = 'messages/ar.json';

const translations = {
  loadingProfile: { en: "Loading your profile...", ar: "جاري تحميل ملفك الشخصي..." },
  profileNotFound: { en: "Profile not found", ar: "لم يتم العثور على الملف الشخصي" },
  profileNotFoundDesc: { en: "We couldn't find your profile information.", ar: "لم نتمكن من العثور على معلومات ملفك الشخصي." },
  backToHome: { en: "Back to Home", ar: "العودة إلى الصفحة الرئيسية" },
  back: { en: "Back", ar: "رجوع" },
  studentProfile: { en: "Student Profile", ar: "الملف الشخصي للطالب" },
  parentProfile: { en: "Parent Profile", ar: "الملف الشخصي لولي الأمر" },
  editProfile: { en: "Edit Profile", ar: "تعديل الملف الشخصي" },
  personalInfo: { en: "Personal Information", ar: "المعلومات الشخصية" },
  personalInfoDesc: { en: "Your basic account information", ar: "معلومات حسابك الأساسية" },
  locationLanguage: { en: "Location & Language", ar: "الموقع واللغة" },
  locationLanguageDesc: { en: "Your location and language preferences", ar: "تفضيلات الموقع واللغة الخاصة بك" },
  locationLanguageDescParent: { en: "Manage your location and language preferences", ar: "إدارة تفضيلات الموقع واللغة الخاصة بك" },
  education: { en: "Education", ar: "التعليم" },
  educationDesc: { en: "Your current academic information", ar: "معلوماتك الأكاديمية الحالية" },
  parentConsent: { en: "Parent Consent", ar: "موافقة ولي الأمر" },
  parentConsentDesc: { en: "Your account consent status", ar: "حالة الموافقة على حسابك" },
  currentStatus: { en: "Current Status", ar: "الحالة الحالية" },
  accountType: { en: "Account Type", ar: "نوع الحساب" },
  accountTypeDesc: { en: "Your Young Leaders Academy account", ar: "حساب أكاديمية القادة الشباب الخاص بك" },
  studentAccount: { en: "Student Account", ar: "حساب طالب" },
  parentAccount: { en: "Parent Account", ar: "حساب ولي أمر" },
  basicInfo: { en: "Basic Information", ar: "المعلومات الأساسية" },
  basicInfoDesc: { en: "Update your personal details", ar: "تحديث بياناتك الشخصية" },
  preferences: { en: "Preferences", ar: "التفضيلات" },
  communication: { en: "Communication", ar: "التواصل" },
  communicationDesc: { en: "How you prefer to be contacted", ar: "كيف تفضل أن يتم التواصل معك" },
  saveChanges: { en: "Save Changes", ar: "حفظ التغييرات" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  saving: { en: "Saving...", ar: "جاري الحفظ..." },

  // Fields
  firstName: { en: "First Name", ar: "الاسم الأول" },
  lastName: { en: "Last Name", ar: "اسم العائلة" },
  emailAddress: { en: "Email Address", ar: "عنوان البريد الإلكتروني" },
  phoneNumber: { en: "Phone Number", ar: "رقم الهاتف" },
  dateOfBirth: { en: "Date of Birth", ar: "تاريخ الميلاد" },
  country: { en: "Country", ar: "البلد" },
  preferredLanguage: { en: "Preferred Language", ar: "اللغة المفضلة" },
  gender: { en: "Gender", ar: "الجنس" },
  male: { en: "Male", ar: "ذكر" },
  female: { en: "Female", ar: "أنثى" },
  preferNotToSay: { en: "Prefer not to say", ar: "أفضل عدم القول" },
  schoolName: { en: "School Name", ar: "اسم المدرسة" },
  gradeLevel: { en: "Grade Level", ar: "المرحلة الدراسية" },
  city: { en: "City", ar: "المدينة" },
  preferredContactMethod: { en: "Preferred Contact Method", ar: "طريقة الاتصال المفضلة" },
  
  // Toasts
  unableLoadProfile: { en: "Unable to load your profile.", ar: "تعذر تحميل ملفك الشخصي." },
  unableLoadStudent: { en: "Unable to load your student information.", ar: "تعذر تحميل معلومات الطالب الخاصة بك." },
  unableLoadParent: { en: "Unable to load your parent information.", ar: "تعذر تحميل معلومات ولي الأمر الخاصة بك." },
  profileUpdatedSuccess: { en: "Profile updated successfully!", ar: "تم تحديث الملف الشخصي بنجاح!" },
  unableUpdateProfile: { en: "Unable to update profile. Please try again.", ar: "تعذر تحديث الملف الشخصي. يرجى المحاولة مرة أخرى." }
};

// 1. Update JSON files
const en = JSON.parse(fs.readFileSync(enJsonFile, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arJsonFile, 'utf8'));

if (!en.Profile) en.Profile = {};
if (!ar.Profile) ar.Profile = {};

for (const [key, val] of Object.entries(translations)) {
  en.Profile[key] = val.en;
  ar.Profile[key] = val.ar;
}

fs.writeFileSync(enJsonFile, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(arJsonFile, JSON.stringify(ar, null, 2) + '\n');

// 2. Replacer logic
function refactorFile(filePath) {
  let file = fs.readFileSync(filePath, 'utf8');

  // Inject useTranslations if missing
  if (!file.includes('useTranslations')) {
    file = file.replace('import { useRouter } from "next/navigation";', 'import { useRouter } from "next/navigation";\nimport { useTranslations } from "next-intl";');
  }

  // Inject const t = useTranslations("Profile");
  if (!file.includes('useTranslations("Profile")')) {
    file = file.replace('const router = useRouter();', 'const router = useRouter();\n  const t = useTranslations("Profile");');
  }

  // Common replacements for text nodes
  const textReplacements = [
    ['>Loading your profile...<', '>{t("loadingProfile")}<'],
    ['>Profile not found<', '>{t("profileNotFound")}<'],
    [">We couldn't find your profile information.<", '>{t("profileNotFoundDesc")}<'],
    ['>Back to Home<', '>{t("backToHome")}<'],
    ['>Back<', '>{t("back")}<'],
    ['>Student Profile<', '>{t("studentProfile")}<'],
    ['>Parent Profile<', '>{t("parentProfile")}<'],
    ['>Edit Profile<', '>{t("editProfile")}<'],
    ['>Personal Information<', '>{t("personalInfo")}<'],
    ['>Your basic account information<', '>{t("personalInfoDesc")}<'],
    ['>Location & Language<', '>{t("locationLanguage")}<'],
    ['>Your location and language preferences<', '>{t("locationLanguageDesc")}<'],
    ['>Manage your location and language preferences<', '>{t("locationLanguageDescParent")}<'],
    ['>Education<', '>{t("education")}<'],
    ['>Your current academic information<', '>{t("educationDesc")}<'],
    ['>Parent Consent<', '>{t("parentConsent")}<'],
    ['>Your account consent status<', '>{t("parentConsentDesc")}<'],
    ['>Current Status<', '>{t("currentStatus")}<'],
    ['>Account Type<', '>{t("accountType")}<'],
    ['>Your Young Leaders Academy account<', '>{t("accountTypeDesc")}<'],
    ['>Student Account<', '>{t("studentAccount")}<'],
    ['>Parent Account<', '>{t("parentAccount")}<'],
    ['>Basic Information<', '>{t("basicInfo")}<'],
    ['>Update your personal details<', '>{t("basicInfoDesc")}<'],
    ['>Preferences<', '>{t("preferences")}<'],
    ['>Communication<', '>{t("communication")}<'],
    ['>How you prefer to be contacted<', '>{t("communicationDesc")}<'],
    ['>Save Changes<', '>{t("saveChanges")}<'],
    ['>Cancel<', '>{t("cancel")}<'],
    ['>Saving...<', '>{t("saving")}<'],
    // Fields
    ['>First Name<', '>{t("firstName")}<'],
    ['>Last Name<', '>{t("lastName")}<'],
    ['>Email Address<', '>{t("emailAddress")}<'],
    ['>Phone Number<', '>{t("phoneNumber")}<'],
    ['>Date of Birth<', '>{t("dateOfBirth")}<'],
    ['>Country<', '>{t("country")}<'],
    ['>Preferred Language<', '>{t("preferredLanguage")}<'],
    ['>Gender<', '>{t("gender")}<'],
    ['>School Name<', '>{t("schoolName")}<'],
    ['>Grade Level<', '>{t("gradeLevel")}<'],
    ['>City<', '>{t("city")}<'],
    ['>Preferred Contact Method<', '>{t("preferredContactMethod")}<'],
    // Options
    ['>Male<', '>{t("male")}<'],
    ['>Female<', '>{t("female")}<'],
    ['>Prefer not to say<', '>{t("preferNotToSay")}<']
  ];

  // Also Toast messages
  const stringReplacements = [
    ['toast.error("Unable to load your profile.")', 'toast.error(t("unableLoadProfile"))'],
    ['toast.error("Unable to load your student information.")', 'toast.error(t("unableLoadStudent"))'],
    ['toast.error("Unable to load your parent information.")', 'toast.error(t("unableLoadParent"))'],
    ['toast.success("Profile updated successfully!")', 'toast.success(t("profileUpdatedSuccess"))'],
    ['toast.error("Unable to update profile. Please try again.")', 'toast.error(t("unableUpdateProfile"))'],
    // Label components props
    ['label="First Name"', 'label={t("firstName")}'],
    ['label="Last Name"', 'label={t("lastName")}'],
    ['label="Email Address"', 'label={t("emailAddress")}'],
    ['label="Phone Number"', 'label={t("phoneNumber")}'],
    ['label="Country"', 'label={t("country")}'],
    ['label="Preferred Language"', 'label={t("preferredLanguage")}'],
    ['label="Date of Birth"', 'label={t("dateOfBirth")}'],
    ['label="Gender"', 'label={t("gender")}'],
    ['label="School Name"', 'label={t("schoolName")}'],
    ['label="Grade Level"', 'label={t("gradeLevel")}'],
    ['label="City"', 'label={t("city")}'],
    ['label="Preferred Contact Method"', 'label={t("preferredContactMethod")}']
  ];

  textReplacements.forEach(([from, to]) => {
    file = file.split(from).join(to);
  });
  
  stringReplacements.forEach(([from, to]) => {
    file = file.split(from).join(to);
  });

  fs.writeFileSync(filePath, file);
}

refactorFile(studentFile);
refactorFile(parentFile);

console.log('Refactoring complete');
