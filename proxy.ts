// import createMiddleware from 'next-intl/middleware';
// import { locales, defaultLocale } from './config';

// export default createMiddleware({
//   // A list of all locales that are supported
//   locales,

//   // Used when no locale matches
//   defaultLocale
// });

// export const config = {
//   // Match only internationalized pathnames
//   matcher: ['/', '/(ar|en)/:path*']
// };

import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/', '/(ar|en)/:path*']
};