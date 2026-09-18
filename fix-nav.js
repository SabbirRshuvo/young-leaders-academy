const fs = require('fs');
let file = fs.readFileSync('components/layout/Navbar.tsx', 'utf8');

// Replace switchLocale & isActive
const oldSwitchLocaleAndIsActive = `  const switchLocale = (targetLocale?: string) => {
    const nextLocale = typeof targetLocale === "string" ? targetLocale : (locale === "en" ? "ar" : "en");

    let newPath = \`/\${nextLocale}\`;

    if (pathname) {
      if (pathname === \`/\${locale}\`) {
        newPath = \`/\${nextLocale}\`;
      } else if (pathname.startsWith(\`/\${locale}/\`)) {
        newPath = pathname.replace(\`/\${locale}/\`, \`/\${nextLocale}/\`);
      } else if (pathname !== "/") {
        newPath = \`/\${nextLocale}\${pathname}\`;
      }
    }

    router.push(newPath);
  };

  /*
  |--------------------------------------------------------------------------
  | Active link
  |--------------------------------------------------------------------------
  */

  const isActive = (href: string) => {
    const fullHref = \`/\${locale}\${href === "/" ? "" : href}\`;

    return (
      pathname === fullHref ||
      (href !== "/" && pathname?.startsWith(fullHref))
    );
  };`;

const newSwitchLocaleAndIsActive = `  const switchLocale = (targetLocale?: string) => {
    const nextLocale = typeof targetLocale === "string" ? targetLocale : (locale === "en" ? "ar" : "en");

    let rawPath = pathname || "/";
    if (rawPath === \`/\${locale}\`) {
      rawPath = "/";
    } else if (rawPath.startsWith(\`/\${locale}/\`)) {
      rawPath = rawPath.replace(\`/\${locale}/\`, "/");
    }

    let newPath = rawPath;
    if (nextLocale !== "en") {
      newPath = \`/\${nextLocale}\${rawPath === "/" ? "" : rawPath}\`;
    }

    router.push(newPath);
  };

  const getLocalizedHref = (href: string) => {
    if (locale === "en") return href;
    return \`/\${locale}\${href === "/" ? "" : href}\`;
  };

  /*
  |--------------------------------------------------------------------------
  | Active link
  |--------------------------------------------------------------------------
  */

  const isActive = (href: string) => {
    const fullHref = getLocalizedHref(href);

    return (
      pathname === fullHref ||
      (href !== "/" && pathname?.startsWith(fullHref + "/")) ||
      (href !== "/" && pathname === fullHref)
    );
  };`;

file = file.replace(oldSwitchLocaleAndIsActive, newSwitchLocaleAndIsActive);

// Replace Link hrefs
file = file.replace(/href={`\/\${locale}`}/g, 'href={getLocalizedHref("/")}');
file = file.replace(/href={`\/\${locale}\${link.href === "\/" \? "" : link.href}`}/g, 'href={getLocalizedHref(link.href)}');
file = file.replace(/href={`\/\${locale}\${profilePath}`}/g, 'href={getLocalizedHref(profilePath || "")}');
file = file.replace(/href={`\/\${locale}\/settings`}/g, 'href={getLocalizedHref("/settings")}');

// Also replace in router.push
file = file.replace(/router\.push\(`\/\${locale}`\)/g, 'router.push(getLocalizedHref("/"))');
file = file.replace(/router\.push\(`\/\${locale}\/sign-up`\)/g, 'router.push(getLocalizedHref("/sign-up"))');
file = file.replace(/router\.push\(`\/\${locale}\/login`\)/g, 'router.push(getLocalizedHref("/login"))');

fs.writeFileSync('components/layout/Navbar.tsx', file);
console.log('Updated Navbar.tsx');
