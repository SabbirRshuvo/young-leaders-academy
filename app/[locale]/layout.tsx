import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Cairo } from "next/font/google";
import "@/app/globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Providers } from "@/components/layout/Providers";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from "react-hot-toast";

const montserrat = Montserrat({
    variable: "--font-sans",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    display: "swap",
});

const playfair = Playfair_Display({
    variable: "--font-serif",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    display: "swap",
});

const cairo = Cairo({
    variable: "--font-arabic",
    subsets: ["arabic", "latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
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
    const isAr = locale === "ar";
    const messages = await getMessages();

    return (
        <html
            lang={locale}
            dir="ltr"
            className={`${montserrat.variable} ${playfair.variable} ${cairo.variable} h-full antialiased`}
        >
            <body
                dir="ltr"
                className={`${isAr ? 'font-arabic' : 'font-sans'} antialiased min-h-full flex flex-col`}
                suppressHydrationWarning
            >
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        <Toaster />
                        <ConditionalLayout>
                            {children}
                        </ConditionalLayout>
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
