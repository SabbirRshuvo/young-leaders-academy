"use client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <main className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
