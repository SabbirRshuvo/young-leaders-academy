"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Globe,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type UserRole = "student" | "parent" | "coach" | "admin" | null;

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const tExtra = useTranslations("NavbarExtra");

  /*
  |--------------------------------------------------------------------------
  | Get authenticated Supabase user + role
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const getUserRole = async (userId: string) => {
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select(`
          role_id,
          roles (
            name
          )
        `)
        .eq("user_id", userId);

      if (roleError) {
        console.error("Navbar role lookup error:", roleError);

        if (mounted) {
          setUserRole(null);
        }

        return;
      }

      const rolesArray = roleData || [];
      const roleNames = rolesArray.map(r => {
        const roles = r.roles;
        if (Array.isArray(roles)) return roles[0]?.name;
        if (roles && typeof roles === "object") return (roles as { name?: string }).name;
        return null;
      }).filter(Boolean);
      
      let roleName: string | null = null;
      if (roleNames.includes("admin")) roleName = "admin";
      else if (roleNames.includes("coach")) roleName = "coach";
      else if (roleNames.includes("student")) roleName = "student";
      else if (roleNames.includes("parent")) roleName = "parent";
      else if (roleNames.length > 0) roleName = roleNames[0] || null;

      if (
        roleName === "student" ||
        roleName === "parent" ||
        roleName === "coach" ||
        roleName === "admin"
      ) {
        if (mounted) {
          setUserRole(roleName);
        }
      } else {
        if (mounted) {
          setUserRole(null);
        }
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Get initial session
    |--------------------------------------------------------------------------
    */

    const getInitialSession = async () => {
      try {
        setRoleLoading(true);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "Navbar session lookup error:",
            sessionError
          );

          if (mounted) {
            setUser(null);
            setUserRole(null);
            setRoleLoading(false);
          }

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | No session = logged out
        |--------------------------------------------------------------------------
        */

        if (!session?.user) {
          if (mounted) {
            setUser(null);
            setUserRole(null);
            setRoleLoading(false);
          }

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | Session exists
        |--------------------------------------------------------------------------
        */

        if (mounted) {
          setUser(session.user);
        }

        await getUserRole(session.user.id);

      } catch (error) {
        console.error(
          "Failed to fetch navbar session/role:",
          error
        );

        if (mounted) {
          setUser(null);
          setUserRole(null);
        }

      } finally {
        if (mounted) {
          setRoleLoading(false);
        }
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Initial session check
    |--------------------------------------------------------------------------
    */

    getInitialSession();

    /*
    |--------------------------------------------------------------------------
    | Listen for authentication changes
    |--------------------------------------------------------------------------
    */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      /*
      |--------------------------------------------------------------------------
      | User logged out
      |--------------------------------------------------------------------------
      */

      if (!session?.user) {
        setUser(null);
        setUserRole(null);
        setRoleLoading(false);

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | User logged in / session restored
      |--------------------------------------------------------------------------
      */

      setUser(session.user);
      setRoleLoading(true);

      /*
      |--------------------------------------------------------------------------
      | Fetch role
      |--------------------------------------------------------------------------
      */

      setTimeout(async () => {
        if (!mounted) return;

        await getUserRole(session.user.id);

        if (mounted) {
          setRoleLoading(false);
        }
      }, 0);
    });

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Locale
  |--------------------------------------------------------------------------
  */

  const switchLocale = (targetLocale?: string) => {
    const nextLocale = typeof targetLocale === "string" ? targetLocale : (locale === "en" ? "ar" : "en");

    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;

    let rawPath = pathname || "/";
    if (rawPath === `/${locale}`) {
      rawPath = "/";
    } else if (rawPath.startsWith(`/${locale}/`)) {
      rawPath = rawPath.replace(`/${locale}/`, "/");
    }

    let newPath = rawPath;
    if (nextLocale !== "en") {
      newPath = `/${nextLocale}${rawPath === "/" ? "" : rawPath}`;
    }

    window.location.href = newPath;
  };

  const getLocalizedHref = (href: string) => {
    if (locale === "en") return href;
    return `/${locale}${href === "/" ? "" : href}`;
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
  };

  /*
  |--------------------------------------------------------------------------
  | Public navigation
  |--------------------------------------------------------------------------
  */

  const publicNavLinks = [
    {
      name: t("home"),
      href: "/",
    },
    {
      name: t("about"),
      href: "/about",
    },
    {
      name: t("programs"),
      href: "/programs",
    },
    {
      name: t("universities"),
      href: "/universities",
    },
    {
      name: t("contact"),
      href: "/contact",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Student navigation
  |--------------------------------------------------------------------------
  */

  const isAr = locale === "ar";

  const studentNavLinks = [
    {
      name: isAr ? "لوحة التحكم" : "Dashboard",
      href: "/student/dashboard",
    },
    {
      name: isAr ? "البرامج المسجلة" : "Enrolled Programs",
      href: "/student/enrolled-programs",
    },
    {
      name: isAr ? "جلسات التوجيه" : "1-on-1 Coaching",
      href: "/student/coaching",
    },
    {
      name: t("programs"),
      href: "/programs",
    },
    {
      name: t("universities"),
      href: "/universities",
    },
    {
      name: isAr ? "طلباتي" : "My Applications",
      href: "/student/applications",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Parent navigation
  |--------------------------------------------------------------------------
  |
  | Parents do NOT get Programs or Universities here because
  | they should not apply to programs from the parent portal.
  |
  */

  const parentNavLinks = [
    {
      name: isAr ? "لوحة التحكم" : "Dashboard",
      href: "/parent/dashboard",
    },
    {
      name: isAr ? "أبنائي" : "My Children",
      href: "/parent/children",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Coach navigation
  |--------------------------------------------------------------------------
  */

  const coachNavLinks = [
    {
      name: isAr ? "لوحة التحكم" : "Dashboard",
      href: "/coach/dashboard",
    },
    {
      name: isAr ? "جدول الجلسات" : "1-on-1 Calendar",
      href: "/coach/sessions",
    },
    {
      name: isAr ? "الوحدات التدريبية" : "My Modules",
      href: "/coach/modules",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Admin navigation
  |--------------------------------------------------------------------------
  */

  const adminNavLinks = [
    {
      name: isAr ? "لوحة التحكم" : "Dashboard",
      href: "/admin/dashboard",
    },
    {
      name: isAr ? "المستخدمين" : "Users",
      href: "/admin/users",
    },
    {
      name: isAr ? "المدربون" : "Coaches",
      href: "/admin/coaches",
    },
    {
      name: t("programs"),
      href: "/programs",
    },
    {
      name: t("universities"),
      href: "/universities",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Select navigation based on role
  |--------------------------------------------------------------------------
  */

  const getNavLinks = () => {
    /*
    |--------------------------------------------------------------------------
    | Logged out
    |--------------------------------------------------------------------------
    */

    if (!user) {
      return publicNavLinks;
    }

    /*
    |--------------------------------------------------------------------------
    | User exists but role is still loading
    |--------------------------------------------------------------------------
    |
    | Do not show role-specific navigation until the role is known.
    | This prevents the navbar from temporarily showing the wrong
    | navigation immediately after login.
    |
    */

    if (roleLoading) {
      return publicNavLinks;
    }

    /*
    |--------------------------------------------------------------------------
    | Role-based navigation
    |--------------------------------------------------------------------------
    */

    switch (userRole) {
      case "student":
        return studentNavLinks;

      case "parent":
        return parentNavLinks;

      case "coach":
        return coachNavLinks;

      case "admin":
        return adminNavLinks;

      default:
        return publicNavLinks;
    }
  };

  const navLinks = getNavLinks();

  /*
  |--------------------------------------------------------------------------
  | Profile name
  |--------------------------------------------------------------------------
  */

  const userName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "User";

  /*
  |--------------------------------------------------------------------------
  | Profile path
  |--------------------------------------------------------------------------
  */

  const getProfilePath = () => {
    switch (userRole) {
      case "student":
        return "/student/profile";

      case "parent":
        return "/parent/profile";

      case "coach":
        return "/coach/profile";

      case "admin":
        return "/admin/profile";

      default:
        return null;
    }
  };

  const profilePath = getProfilePath();

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    setUser(null);
    setUserRole(null);

    router.push(getLocalizedHref("/"));
    router.refresh();
  };

  /*
  |--------------------------------------------------------------------------
  | Profile image
  |--------------------------------------------------------------------------
  */

  const profileImage =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">

      <div className="max-w-[1440px] mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-12">

        {/* ============================================================
            LOGO
        ============================================================ */}

        <div className="flex-1 flex items-center justify-start">

          <Link
            href={getLocalizedHref("/")}
            className="flex items-center gap-0"
          >

            <Image
              src="/logo.jpeg"
              alt="Logo"
              width={150}
              height={150}
              priority
              className="w-16 h-16 md:w-[120px] md:h-[70px] object-contain"
            />

            <div className="hidden sm:flex flex-col justify-center -ml-3 md:-ml-4">

              <div className="text-[14px] md:text-[16px] font-extrabold text-navy leading-none tracking-[0.05em] mb-[6px]">
                YOUNG LEADERS
              </div>

              <div className="flex items-center justify-center gap-2">

                <div className="h-[1px] w-4 bg-gold" />

                <div className="text-[9px] md:text-[10px] font-bold text-gold tracking-[0.2em] leading-none">
                  ACADEMY
                </div>

                <div className="h-[1px] w-4 bg-gold" />

              </div>

            </div>

          </Link>

        </div>

        {/* ============================================================
            DESKTOP NAVIGATION
        ============================================================ */}

        <div className="hidden lg:flex items-center justify-center gap-8 text-[15px] font-bold text-navy">

          {navLinks.map((link) => (

            <Link
              key={link.name}
              href={getLocalizedHref(link.href)}
              className={`relative transition-colors hover:text-gold py-1 group ${isActive(link.href)
                ? "text-gold"
                : ""
                }`}
            >

              {link.name}

              <span
                className={`absolute left-1/2 bottom-[-4px] h-[3px] bg-gold rounded-full transition-all duration-300 -translate-x-1/2 ${isActive(link.href)
                  ? "w-full"
                  : "w-0 group-hover:w-full"
                  }`}
              />

            </Link>

          ))}

        </div>

        {/* ============================================================
            DESKTOP RIGHT ACTIONS
        ============================================================ */}

        <div className="hidden lg:flex flex-1 items-center justify-end gap-4">

          {/* Language */}

          <button
            onClick={() => switchLocale()}
            className="flex items-center justify-center gap-2 px-4 py-[10px] rounded-full border border-gray-200/80 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >

            <Globe className="w-[18px] h-[18px] text-navy" />

            <span
              className={`text-sm ${locale === "en"
                ? "text-navy font-bold"
                : "text-gray-400 font-medium"
                }`}
            >
              EN
            </span>

            <span className="text-gray-300 text-sm">
              |
            </span>

            <span
              className={`font-arabic text-[15px] ${locale === "ar"
                ? "text-navy font-bold"
                : "text-gray-400 font-medium"
                }`}
            >
              ع
            </span>

          </button>

          {/* ========================================================
              LOGGED IN
          ======================================================== */}

          {user ? (

            <div className="relative">

              {roleLoading ? (

                /*
                |--------------------------------------------------------------------------
                | Role loading state
                |--------------------------------------------------------------------------
                */

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-100">

                  <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />

                  <div className="w-20 h-4 rounded bg-gray-200 animate-pulse" />

                  <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />

                </div>

              ) : (

                /*
                |--------------------------------------------------------------------------
                | Role loaded
                |--------------------------------------------------------------------------
                */

                <button
                  onClick={() =>
                    setIsProfileMenuOpen((prev) => !prev)
                  }
                  className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors"
                >

                  {profileImage ? (

                    <Image
                      src={profileImage}
                      alt="Profile"
                      width={30}
                      height={30}
                      className="rounded-full"
                    />

                  ) : (

                    <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                      {userName[0]?.toUpperCase() || "U"}
                    </div>

                  )}

                  <span className="font-bold text-navy text-sm">
                    {userName}
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 text-navy transition-transform ${isProfileMenuOpen
                      ? "rotate-180"
                      : ""
                      }`}
                  />

                </button>

              )}

              {/* Profile dropdown */}

              {isProfileMenuOpen &&
                !roleLoading && (

                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden">

                    <div className="px-4 py-3 border-b border-gray-100">

                      <p className="text-sm font-bold text-navy">
                        {userName}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>

                      {userRole && (
                        <p className="text-xs text-gold font-semibold mt-1 capitalize">
                          {userRole}
                        </p>
                      )}

                    </div>

                    <Link
                      href={getLocalizedHref(profilePath || "")}
                      onClick={() =>
                        setIsProfileMenuOpen(false)
                      }
                      className="block px-4 py-3 text-sm font-semibold text-navy hover:bg-gray-50 hover:text-gold"
                    >
                      {isAr ? "ملفي الشخصي" : "My Profile"}
                    </Link>

                    <Link
                      href={getLocalizedHref("/settings")}
                      onClick={() =>
                        setIsProfileMenuOpen(false)
                      }
                      className="block px-4 py-3 text-sm font-semibold text-navy hover:bg-gray-50 hover:text-gold"
                    >
                      {isAr ? "الإعدادات" : "Settings"}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm font-semibold text-navy hover:bg-gray-50 hover:text-gold border-t border-gray-100"
                    >
                      {isAr ? "تسجيل الخروج" : "Logout"}
                    </button>

                  </div>

                )}

            </div>

          ) : (

            /* ========================================================
               LOGGED OUT
            ======================================================== */

            <button
              onClick={() =>
                router.push(getLocalizedHref("/login"))
              }
              className="whitespace-nowrap inline-flex items-center justify-center gap-2 rounded-full bg-navy text-white hover:bg-navy/90 h-[42px] px-6 text-[15px] font-semibold transition-all shadow-md cursor-pointer"
            >

              <User className="w-[18px] h-[18px]" />

              {tExtra("login")}

            </button>

          )}

        </div>

        {/* ============================================================
            MOBILE
        ============================================================ */}

        <div className="lg:hidden flex flex-1 items-center justify-end gap-3">

          <button
            onClick={() => switchLocale()}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-navy hover:bg-gray-50 transition-colors"
          >

            {locale === "en" ? (
              <span className="text-xs font-bold">
                EN
              </span>
            ) : (
              <span className="text-sm font-bold font-arabic">
                ع
              </span>
            )}

          </button>

          <button
            onClick={() =>
              setIsMobileMenuOpen(!isMobileMenuOpen)
            }
            className="flex items-center justify-center w-10 h-10 text-navy bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Toggle menu"
          >

            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}

          </button>

        </div>

      </div>

      {/* ==============================================================
          MOBILE MENU
      ============================================================== */}

      <div
        className={`lg:hidden absolute top-20 left-0 w-full bg-white border-t border-gray-100 shadow-xl flex flex-col z-50 overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen
          ? "max-h-[700px] opacity-100 py-4"
          : "max-h-0 opacity-0 py-0 border-t-0"
          }`}
      >

        <div className="px-4 flex flex-col gap-4">

          {/* Navigation */}

          <div className="flex flex-col space-y-1 pb-4 border-b border-gray-100">

            {navLinks.map((link) => (

              <Link
                key={link.name}
                href={getLocalizedHref(link.href)}
                className={`font-bold hover:bg-gray-50 hover:text-gold transition-colors px-4 py-3 rounded-lg flex items-center ${isActive(link.href)
                  ? "text-gold bg-gray-50"
                  : "text-navy"
                  }`}
                onClick={() =>
                  setIsMobileMenuOpen(false)
                }
              >

                <span
                  className={`w-2 h-2 rounded-full mr-3 shrink-0 ${isActive(link.href)
                    ? "bg-gold"
                    : "bg-transparent"
                    }`}
                />

                {link.name}

              </Link>

            ))}

          </div>

          {/* Language */}

          <div className="flex items-center gap-3">

            <button
              onClick={() => switchLocale("en")}
              className={`flex-1 py-3 rounded-full border ${locale === "en"
                ? "border-navy bg-navy/5 text-navy font-bold"
                : "border-gray-200 text-gray-500"
                }`}
            >
              English
            </button>

            <button
              onClick={() => switchLocale("ar")}
              className={`flex-1 py-3 rounded-full border ${locale === "ar"
                ? "border-navy bg-navy/5 text-navy font-bold"
                : "border-gray-200 text-gray-500"
                }`}
            >
              العربية
            </button>

          </div>

          {/* ========================================================
              MOBILE AUTH
          ======================================================== */}

          {user ? (

            <div className="flex flex-col gap-2">

              {roleLoading ? (

                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">

                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />

                  <div className="flex flex-col gap-2">

                    <div className="w-24 h-3 rounded bg-gray-200 animate-pulse" />

                    <div className="w-16 h-2 rounded bg-gray-200 animate-pulse" />

                  </div>

                </div>

              ) : (

                <>

                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">

                    {profileImage ? (

                      <Image
                        src={profileImage}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />

                    ) : (

                      <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                        {userName[0]?.toUpperCase() || "U"}
                      </div>

                    )}

                    <div>

                      <p className="text-sm font-bold text-navy">
                        {userName}
                      </p>

                      {userRole && (
                        <p className="text-xs text-gold capitalize">
                          {userRole}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* My Profile */}

                  {profilePath && (

                    <Link
                      href={getLocalizedHref(profilePath || "")}
                      onClick={() =>
                        setIsMobileMenuOpen(false)
                      }
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-gray-50 text-navy h-[48px] font-semibold border border-gray-200"
                    >
                      {isAr ? "ملفي الشخصي" : "My Profile"}
                    </Link>

                  )}

                  {/* Settings */}

                  <Link
                    href={getLocalizedHref("/settings")}
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-gray-50 text-navy h-[48px] font-semibold border border-gray-200"
                  >
                    {isAr ? "الإعدادات" : "Settings"}
                  </Link>

                  {/* Logout */}

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-full bg-gray-100 text-navy h-[48px] font-semibold border border-gray-200"
                  >
                    {isAr ? `تسجيل الخروج (${userName})` : `Logout (${userName})`}
                  </button>

                </>

              )}

            </div>

          ) : (

            <button
              onClick={() =>
                router.push(getLocalizedHref("/login"))
              }
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-navy text-white h-[48px] font-semibold shadow-md"
            >

              <User className="w-[18px] h-[18px]" />

              {tExtra("login")}

            </button>

          )}

        </div>

      </div>

    </nav>
  );
}
