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
  let response = intlMiddleware(request);

  // Extract locale
  const match = path.match(/^\/(en|ar)/);
  const locale = match ? match[1] : 'en';

  // Direct aliases for 1:1 coaching / sessions URLs
  if (/^\/(en\/|ar\/)?(coaching|1:1|1-on-1|one-on-one)\/?$/.test(path)) {
    return NextResponse.redirect(new URL(`/${locale}/student/coaching`, request.url));
  }

  // Explicitly allow 1:1 coaching and sessions pages to load directly without middleware redirection
  if (path.includes('/student/coaching') || path.includes('/coach/sessions') || path.includes('/coaching')) {
    return response;
  }

  // 2. Initialize Supabase SSR client to check auth status and update session cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = intlMiddleware(request);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();
  
  // 3. Route Protection Logic
  const isStudentRoute = /^\/(en\/|ar\/)?student(\/|$)/.test(path);
  const isParentRoute = /^\/(en\/|ar\/)?parent(\/|$)/.test(path);
  const isAdminRoute = /^\/(en\/|ar\/)?admin(\/|$)/.test(path);
  const isCoachRoute = /^\/(en\/|ar\/)?coach(\/|$)/.test(path);
  
  if (isStudentRoute || isParentRoute || isAdminRoute || isCoachRoute) {
    // Universal bypass for coaching and sessions
    if (path.includes('/student/coaching') || path.includes('/coach/sessions')) {
      return response;
    }

    if (!user) {
      const redirectUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Fetch user role from user_roles
    const { data: userRolesData } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id);

    const roleNames = (userRolesData || []).map((r: any) => {
      const roles = r.roles;
      if (Array.isArray(roles)) return roles[0]?.name?.toLowerCase();
      if (roles && typeof roles === 'object') return roles.name?.toLowerCase();
      return null;
    }).filter(Boolean);

    let userRole: string | null = null;
    if (roleNames.includes('admin')) userRole = 'admin';
    else if (roleNames.includes('coach')) userRole = 'coach';
    else if (roleNames.includes('student')) userRole = 'student';
    else if (roleNames.includes('parent')) userRole = 'parent';
    else if (roleNames.length > 0) userRole = roleNames[0];

    // Fallback to metadata just in case
    userRole = userRole || user.user_metadata?.role || user.app_metadata?.role;

    const isAdminUser = userRole === 'admin' || user.email === 'adminsabbir@gmail.com';

    // Admins have universal preview and management access across all routes
    if (isAdminUser) {
      return response;
    }

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

    if (isCoachRoute && userRole !== 'coach') {
      if (userRole === 'student') {
        // If student clicks coach 1:1 sessions, redirect them smoothly to student 1:1 coaching
        if (path.includes('/coach/sessions')) {
          return NextResponse.redirect(new URL(`/${locale}/student/coaching`, request.url));
        }
        return NextResponse.redirect(new URL(`/${locale}/student/dashboard`, request.url));
      } else if (userRole === 'parent') {
        return NextResponse.redirect(new URL(`/${locale}/parent/dashboard`, request.url));
      }
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    if (isStudentRoute && userRole !== 'student') {
      // Allow coaches and parents to view the student 1:1 coaching booking page
      if (path.includes('/student/coaching')) {
        return response;
      }
      if (userRole === 'coach') {
        return NextResponse.redirect(new URL(`/${locale}/coach/dashboard`, request.url));
      } else if (userRole === 'parent') {
        return NextResponse.redirect(new URL(`/${locale}/parent/dashboard`, request.url));
      }
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    if (isParentRoute && userRole !== 'parent') {
      if (userRole === 'coach') {
        return NextResponse.redirect(new URL(`/${locale}/coach/dashboard`, request.url));
      } else if (userRole === 'student') {
        return NextResponse.redirect(new URL(`/${locale}/student/dashboard`, request.url));
      }
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
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
