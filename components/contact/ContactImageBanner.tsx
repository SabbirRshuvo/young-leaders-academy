"use client";

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ContactImageBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress across this specific section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Map scroll progress (0 to 1) to a Y translation for the image
  // The image will move from -15% to 15% creating a smooth parallax effect
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section
      ref={containerRef}
      className="w-full relative h-[400px] md:h-[50vh] min-h-[350px] overflow-hidden border-y-2 border-[#D4AF37]"
    >
      {/* 
        We make the image container taller than its parent (-top-[15%] and -bottom-[15%]) 
        so that it has room to translate up and down without revealing empty space.
      */}
      <motion.div
        style={{ y }}
        className="absolute -top-[15%] -bottom-[15%] left-0 right-0 z-0"
      >
        <Image
          src="/university.png" // Placeholder panoramic image
          alt="University Campus Panorama"
          fill
          sizes="100vw"
          className="object-cover object-center"
          quality={80}
        />
      </motion.div>

      {/* Optional subtle overlay to ensure the image blends perfectly into the design */}
      <div className="absolute inset-0 bg-[#0B2545]/10 z-10 pointer-events-none"></div>
    </section>
  );
}
