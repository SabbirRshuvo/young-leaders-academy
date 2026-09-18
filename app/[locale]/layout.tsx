import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const playfair = Playfair_Display({
    variable: "--font-serif",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    display: "swap",
});

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Young Leaders Academy",
    description: "Preparing Young People For Life. One Academy. One Journey. A Lifetime of Impact.",
};

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const messages = await getMessages();

    return (
        <html
            lang={locale}
            dir="ltr"
            className={`${playfair.variable} ${inter.variable} h-full antialiased`}
        >
            <body className="font-sans antialiased min-h-full flex flex-col" suppressHydrationWarning>
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        <Navbar />
                        <main className="flex-1 flex flex-col">{children}</main>
                        <Footer />
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
