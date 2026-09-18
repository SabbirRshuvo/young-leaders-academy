const fs = require('fs');

// 1. Update translations
const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));

if (!en.Profile.notProvided) en.Profile.notProvided = 'Not provided';
if (!ar.Profile.notProvided) ar.Profile.notProvided = 'غير متوفر';

if (!en.NotFound) en.NotFound = { title: 'Coming Soon', desc: 'This page is under construction or could not be found.', back: 'Return Home' };
if (!ar.NotFound) ar.NotFound = { title: 'قريباً', desc: 'هذه الصفحة قيد الإنشاء أو لم يتم العثور عليها.', back: 'العودة للصفحة الرئيسية' };

fs.writeFileSync('messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('messages/ar.json', JSON.stringify(ar, null, 2) + '\n');

// 2. Fix 'Not provided' in profile pages
function replaceNotProvided(filePath) {
  let file = fs.readFileSync(filePath, 'utf8');
  file = file.replace(/"Not provided"/g, 't("notProvided")');
  fs.writeFileSync(filePath, file);
}

replaceNotProvided('app/[locale]/student/profile/page.tsx');
replaceNotProvided('app/[locale]/parent/profile/page.tsx');

console.log('Fixed Not Provided and added NotFound keys');
