"use client";

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

export default function ContactHero() {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
  };

  return (
    <section className="relative w-full h-[400px] md:h-[500px] xl:h-[600px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/contact-banner.png" // Placeholder
          alt="University Campus"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Deep Navy Gradient Overlay */}
        <div className="absolute inset-0 "></div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="flex flex-col items-start space-y-6 max-w-2xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-2">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
              Get In Touch
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.15]">
            We'd Love to Hear<br />From You
          </motion.h1>

          <motion.div variants={itemVariants} className="space-y-4">
            <p className="text-gray-200 font-sans text-base md:text-lg leading-relaxed max-w-xl">
              Have questions about our programs, university pathways, or global opportunities? Our team is here to help. Reach out and let's start your journey together.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
