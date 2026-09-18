const fs = require('fs');
const path = require('path');

const studentFile = 'app/[locale]/student/profile/page.tsx';
const parentFile = 'app/[locale]/parent/profile/page.tsx';
const enJsonFile = 'messages/en.json';
const arJsonFile = 'messages/ar.json';

const translations = {
  educationSection: { en: "Tell us about your current education", ar: "أخبرنا عن تعليمك الحالي" },
  parentConsentNotice: { en: "Your parent consent status is managed by the consent process and cannot be changed from your profile.", ar: "تتم إدارة حالة موافقة الوالدين من خلال عملية الموافقة ولا يمكن تغييرها من ملفك الشخصي." },
  communicationPref: { en: "Communication Preferences", ar: "تفضيلات الاتصال" },
  communicationPrefDesc: { en: "Choose how you prefer to be contacted", ar: "اختر كيف تفضل أن يتم التواصل معك" },
};

// 1. Update JSON files
const en = JSON.parse(fs.readFileSync(enJsonFile, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arJsonFile, 'utf8'));

for (const [key, val] of Object.entries(translations)) {
  en.Profile[key] = val.en;
  ar.Profile[key] = val.ar;
}

fs.writeFileSync(enJsonFile, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(arJsonFile, JSON.stringify(ar, null, 2) + '\n');

// 2. Replacer logic
function refactorFile(filePath) {
  let file = fs.readFileSync(filePath, 'utf8');

  // Replace text using regex to handle whitespace
  const replaceText = (search, key) => {
    // Escape regex chars
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Allow any whitespace around the text
    const regex = new RegExp(`>\\s*${escapedSearch}\\s*<`, 'g');
    file = file.replace(regex, `>{t("${key}")}<`);
  };

  replaceText("Manage your location and language preferences", "locationLanguageDescParent");
  replaceText("Tell us about your current education", "educationSection");
  
  // This one has newlines inside the text in the code:
  // Your parent consent status is managed by
  // the consent process and cannot be changed
  // from your profile.
  // We can just replace the whole block manually
  file = file.replace(
    /Your parent consent status is managed by[\s\S]*?from your profile\./,
    '{t("parentConsentNotice")}'
  );

  replaceText("Cancel", "cancel");
  replaceText("Saving...", "saving");
  replaceText("Save Changes", "saveChanges");
  
  replaceText("Location & Language", "locationLanguage");
  replaceText("Communication Preferences", "communicationPref");
  replaceText("Choose how you prefer to be contacted", "communicationPrefDesc");

  fs.writeFileSync(filePath, file);
}

refactorFile(studentFile);
refactorFile(parentFile);

console.log('Refactoring complete 2');
