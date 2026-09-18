const fs = require('fs');

function fixProfileItem(filePath) {
  let file = fs.readFileSync(filePath, 'utf8');
  
  if (file.includes('const t = useTranslations("Profile");\n  return (')) {
    console.log('Already fixed:', filePath);
    return;
  }

  const target2 = /function ProfileItem\([\s\S]*?\) \{\r?\n/;
  const match2 = file.match(target2);
  if (match2) {
    const replacement = match2[0] + '  const t = useTranslations("Profile");\n';
    file = file.replace(target2, replacement);
    fs.writeFileSync(filePath, file);
    console.log('Fixed ProfileItem in', filePath);
  } else {
    console.log('Could not find ProfileItem in', filePath);
  }
}

fixProfileItem('app/[locale]/student/profile/page.tsx');
fixProfileItem('app/[locale]/parent/profile/page.tsx');
