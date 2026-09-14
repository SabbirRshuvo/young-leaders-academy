"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ContactImageBanner() {
  return (
    <section className="w-full py-16 md:py-24 bg-[#FCFAF6] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]"
        >
          {/* Offset Gold Border Frame */}
          <div className="absolute inset-0 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 border-2 border-[#D4AF37] rounded-xl z-0 hidden sm:block"></div>

          {/* Main Image Container */}
          <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white z-10 border-4 border-white">
            <Image
              src="/universities-banner.png" // Placeholder panoramic image
              alt="University Campus Panorama"
              fill
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="object-cover object-center"
              quality={80}
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
