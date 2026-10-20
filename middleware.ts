import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 0. Bypass internationalization and route protection for /auth and /api
  if (path.startsWith('/auth') || path.startsWith('/api')) {
    return NextResponse.next();
  }

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
  
  // Extract locale
  const match = path.match(/^\/(en|ar)/);
  const locale = match ? match[1] : 'en';

  const isStudentRoute = path.includes('/student');
  const isParentRoute = path.includes('/parent');
  const isAdminRoute = path.includes('/admin');
  const isCoachRoute = path.includes('/coach');
  
  if (isStudentRoute || isParentRoute || isAdminRoute || isCoachRoute) {
    if (!user) {
      const redirectUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Fetch user role from user_roles
    const { data: userRolesData } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id);

    let userRole = null;
    if (userRolesData && userRolesData.length > 0) {
      const { data: roleData } = await supabase
        .from('roles')
        .select('name')
        .eq('id', userRolesData[0].role_id)
        .single();
      userRole = roleData?.name?.toLowerCase();
    }
    
    // Fallback to metadata just in case
    userRole = userRole || user.user_metadata?.role || user.app_metadata?.role;

    const isAdminUser = userRole === 'admin' || user.email === 'adminsabbir@gmail.com';

    // Strict role verification based on route
    if (isAdminRoute && !isAdminUser) {
      if (userRole === 'coach') {
        return NextResponse.redirect(new URL(`/${locale}/coach/dashboard`, request.url));
      } else if (userRole === 'student') {
        return NextResponse.redirect(new URL(`/${locale}/student/dashboard`, request.url));
      } else if (userRole === 'parent') {
        return NextResponse.redirect(new URL(`/${locale}/parent/dashboard`, request.url));
      }
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    if (isCoachRoute && userRole !== 'coach' && !isAdminUser) {
      if (userRole === 'student') {
        return NextResponse.redirect(new URL(`/${locale}/student/dashboard`, request.url));
      } else if (userRole === 'parent') {
        return NextResponse.redirect(new URL(`/${locale}/parent/dashboard`, request.url));
      }
      const redirectUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (isStudentRoute && userRole !== 'student') {
      if (isAdminUser) {
        return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, request.url));
      } else if (userRole === 'coach') {
        return NextResponse.redirect(new URL(`/${locale}/coach/dashboard`, request.url));
      }
      const redirectUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (isParentRoute && userRole !== 'parent') {
      if (isAdminUser) {
        return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, request.url));
      } else if (userRole === 'coach') {
        return NextResponse.redirect(new URL(`/${locale}/coach/dashboard`, request.url));
      }
      const redirectUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response
}

export const config = {
  // Matcher ignoring static files, api, auth, etc.
  matcher: [
    '/',
    '/(ar|en)/:path*',
    '/((?!api|auth|_next|_vercel|.*\\..*).*)'
  ]
};
