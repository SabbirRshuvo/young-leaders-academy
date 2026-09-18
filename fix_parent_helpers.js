const fs = require('fs');

function injectT(filePath) {
  let file = fs.readFileSync(filePath, 'utf8');
  
  const helpers = [
    'ChildCard', 'InfoItem', 'SummaryCard', 'StatusBadge', 'EmptyChildren',
    'DashboardStat', 'QuickAction'
  ];

  helpers.forEach(helper => {
    // We match `function HelperName({...}) {` or similar
    // The previous regex `(function HelperName\([^)]*\)\s*\{\r?\n)` assumes everything is on one line or doesn't have nested destructuring.
    // Because some components like `function ChildCard({ child }: { child: Child }) {` have `{}` inside the arguments.
    const regex = new RegExp(`(function ${helper}\\([\\s\\S]*?\\)\\s*\\{\\r?\\n)(?!\\s*const t = useTranslations)`);
    file = file.replace(regex, `$1  const t = useTranslations("Parent");\n`);
  });

  fs.writeFileSync(filePath, file);
}

injectT('app/[locale]/parent/children/page.tsx');
injectT('app/[locale]/parent/dashboard/page.tsx');
console.log('Fixed helper functions');
