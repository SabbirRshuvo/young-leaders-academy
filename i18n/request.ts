import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // Provide a static locale, fetch it from the user, or read from the request
  let locale = await requestLocale;
  
  // Ensure that a valid locale is used
  if (!locale || !['en', 'ar'].includes(locale as string)) {
    locale = 'en';
  }
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
