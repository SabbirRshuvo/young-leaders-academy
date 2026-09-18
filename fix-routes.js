const fs = require('fs');

function fixRouting(filePath) {
  let file = fs.readFileSync(filePath, 'utf8');
  file = file.replace(/router\.push\(`\/\$\{locale\}\/([^`]+)`\)/g, 'router.push(locale === "en" ? `/$1` : `/${locale}/$1`)');
  file = file.replace(/router\.push\(`\/\$\{locale\}`\)/g, 'router.push(locale === "en" ? "/" : `/${locale}`)');
  file = file.replace(/href=\{`\/\$\{locale\}\/([^`]+)`\}/g, 'href={locale === "en" ? `/$1` : `/${locale}/$1`}');
  file = file.replace(/href=\{`\/\$\{locale\}`\}/g, 'href={locale === "en" ? "/" : `/${locale}`}');
  fs.writeFileSync(filePath, file);
}

fixRouting('app/[locale]/login/page.tsx');
fixRouting('app/[locale]/sign-up/page.tsx');
console.log('Fixed routing in login and sign-up');
