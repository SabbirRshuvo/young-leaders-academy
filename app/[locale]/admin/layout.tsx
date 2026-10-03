"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutDashboard, GraduationCap, Users, Settings, LogOut, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
    router.refresh();
  };

  const navItems = [
    { name: "Overview", href: `/${locale}/admin/dashboard`, icon: LayoutDashboard },
    { name: "Manage Programs", href: `/${locale}/admin/programs`, icon: GraduationCap },
    { name: "Manage Applications", href: `/${locale}/admin/applications`, icon: FileText },
    { name: "Users", href: `/${locale}/admin/users`, icon: Users },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-[#0B2545]">Admin Portal</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#0B2545] text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0B2545]"
                }`}
              >
                <item.icon
                  className={`flex-shrink-0 w-5 h-5 mr-3 ${
                    isActive ? "text-white" : "text-gray-400 group-hover:text-[#0B2545]"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="flex-shrink-0 w-5 h-5 mr-3 text-red-500" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
        {children}
      </main>
    </div>
  );
}
