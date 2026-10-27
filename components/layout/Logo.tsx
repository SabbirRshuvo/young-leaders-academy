"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export interface LogoProps {
  /**
   * Color variant for the primary text:
   * - 'navy': dark navy text for light backgrounds (Navbar)
   * - 'white': white text for dark backgrounds (Footer)
   */
  variant?: "navy" | "white";
  /**
   * Target URL when clicking the logo. Defaults to the localized home page.
   */
  href?: string;
  /**
   * Priority loading for above-the-fold logo (e.g., Navbar).
   */
  priority?: boolean;
  /**
   * Additional wrapper class names.
   */
  className?: string;
  /**
   * Additional class names for the shield emblem image.
   */
  imageClassName?: string;
  /**
   * Additional class names for the text container.
   */
  textClassName?: string;
  /**
   * Whether to display the brand text on mobile screens as well.
   * By default, text is hidden on small mobile screens (`hidden sm:flex`).
   */
  showTextOnMobile?: boolean;
  /**
   * Image source for English / default locale.
   */
  src?: string;
  /**
   * Optional image source for Arabic locale if a dedicated Arabic asset is used.
   */
  srcAr?: string;
  /**
   * Explicit override for Line 1 text.
   */
  line1?: string;
  /**
   * Explicit override for Line 2 text.
   */
  line2?: string;
}

export default function Logo({
  variant = "navy",
  href,
  priority = false,
  className = "",
  imageClassName = "",
  textClassName = "",
  showTextOnMobile = false,
  src = "/logo.jpeg",
  srcAr,
  line1,
  line2,
}: LogoProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  let tNav: ((key: string) => string) | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tNav = useTranslations("Navigation");
  } catch {
    tNav = null;
  }

  // Determine Line 1 and Line 2 text
  let translatedLine1 = isAr ? "قادة الشباب" : "YOUNG LEADERS";
  let translatedLine2 = isAr ? "الأكاديمية" : "ACADEMY";

  if (tNav) {
    try {
      const l1 = tNav("logoLine1");
      if (l1 && !l1.includes("logoLine1")) translatedLine1 = l1;
    } catch {
      // Keep fallback
    }
    try {
      const l2 = tNav("logoLine2");
      if (l2 && !l2.includes("logoLine2")) translatedLine2 = l2;
    } catch {
      // Keep fallback
    }
  }

  const textLine1 = line1 ?? translatedLine1;
  const textLine2 = line2 ?? translatedLine2;

  // Resolve target link with proper locale prefix
  const targetHref =
    href ?? (locale === "en" ? "/" : `/${locale}`);

  // Image source: if an Arabic-specific image asset is provided and locale is ar, use it
  const imageSource = isAr && srcAr ? srcAr : src;

  const textColorClass = variant === "white" ? "text-white" : "text-navy";

  return (
    <Link
      href={targetHref}
      className={`flex items-center gap-0 select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded ${className}`}
      aria-label={isAr ? "أكاديمية قادة الشباب" : "Young Leaders Academy"}
    >
      {/* Shield Emblem */}
      <Image
        src={imageSource}
        alt={isAr ? "شعار أكاديمية قادة الشباب" : "Young Leaders Academy Logo"}
        width={150}
        height={150}
        priority={priority}
        className={`w-16 h-16 md:w-[120px] md:h-[70px] object-contain shrink-0 transition-transform duration-200 group-hover:scale-[1.02] ${imageClassName}`}
      />

      {/* Brand Typography */}
      <div
        className={`${
          showTextOnMobile ? "flex" : "hidden sm:flex"
        } flex-col justify-center -ml-3 md:-ml-4 ${textClassName}`}
      >
        {/* Line 1: Primary Brand Name */}
        <div
          className={`leading-none mb-[5px] whitespace-nowrap ${textColorClass} ${
            isAr
              ? "font-arabic font-bold text-[15px] md:text-[17px] tracking-normal"
              : "font-sans font-extrabold text-[14px] md:text-[16px] tracking-[0.05em]"
          }`}
        >
          {textLine1}
        </div>

        {/* Line 2: Entity Subtitle framed by gold accent lines */}
        {textLine2 ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-3.5 md:w-4 bg-gold shrink-0" />
            <div
              className={`font-bold text-gold leading-none whitespace-nowrap ${
                isAr
                  ? "font-arabic text-[10px] md:text-[11px] tracking-normal"
                  : "text-[9px] md:text-[10px] tracking-[0.2em]"
              }`}
            >
              {textLine2}
            </div>
            <div className="h-[1px] w-3.5 md:w-4 bg-gold shrink-0" />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
