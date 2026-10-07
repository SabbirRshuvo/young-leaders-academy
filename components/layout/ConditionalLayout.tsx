"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Do not render Navbar and Footer on the certificate page to ensure a clean PDF capture
    const isCertificatePage = pathname.includes("/certificate");

    return (
        <>
            {!isCertificatePage && <Navbar />}
            <main className="flex-1 flex flex-col">{children}</main>
            {!isCertificatePage && <Footer />}
        </>
    );
}
