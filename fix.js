const fs = require('fs');
let file = fs.readFileSync('app/[locale]/sign-up/page.tsx', 'utf8');
file = file.replace('I acknowledge the{" "}', '{t("privacyText1")}{" "}');
file = file.replace('Privacy Policy', '{t("privacyText2")}');
fs.writeFileSync('app/[locale]/sign-up/page.tsx', file);
