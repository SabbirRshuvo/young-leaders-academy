"use client";

import { useLocale } from "next-intl";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div dir="ltr" className={`bg-gray-50/50 min-h-screen ${isAr ? "font-arabic" : "font-sans"}`}>
      <main className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
