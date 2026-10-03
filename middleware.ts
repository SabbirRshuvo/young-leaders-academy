import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

export async function middleware(request: NextRequest) {
  // 1. Initialize next-intl middleware
  const intlMiddleware = createIntlMiddleware({
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    localePrefix: 'as-needed'
  });

  // Get the initial response from next-intl (handles locale redirection/rewriting)
  const response = intlMiddleware(request)

  // 2. Initialize Supabase SSR client to check auth status and update session cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()
  
  // 3. Route Protection Logic
  const path = request.nextUrl.pathname;
  
  // Extract locale
  const match = path.match(/^\/(en|ar)/);
  const locale = match ? match[1] : 'en';

  const isProtectedRoute = path.includes('/student') || path.includes('/parent');
  const isAdminRoute = path.includes('/admin');
  
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminRoute) {
    if (!user) {
      const redirectUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
    if (!isAdmin) {
      // Fetch from profiles as fallback
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') {
        const redirectUrl = new URL(`/${locale}/student/dashboard`, request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response
}

export const config = {
  // Matcher ignoring static files, api, etc.
  matcher: [
    '/',
    '/(ar|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
