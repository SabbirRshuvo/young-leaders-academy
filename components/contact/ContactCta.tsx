"use client";

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function ContactCta() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
  };

  return (
    <section className="relative w-full overflow-hidden flex items-center min-h-[400px] md:min-h-[450px]">

      <Image
        src="/enjoy.png"
        alt="Hikers on a mountain summit"
        fill
        sizes="100vw"
        className="object-cover"
        quality={75}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 "></div>

      {/* Content Container */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-16 md:py-20 relative z-20">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                Stay Connected
              </span>
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-white font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              Join Our Global Community
            </motion.h2>

            <motion.p variants={itemVariants} className="text-gray-200 text-sm md:text-base leading-relaxed font-sans max-w-md">
              Get the latest updates on programs, university pathways, and leadership opportunities.
            </motion.p>
          </motion.div>

          {/* Right Newsletter Input */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full lg:max-w-md ml-auto"
          >
            <form className="relative flex items-center w-full">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full h-14 md:h-16 pl-6 pr-[72px] rounded-lg bg-[#0B2545]/50 border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all backdrop-blur-md"
                required
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 w-12 md:w-14 rounded-md bg-[#D4AF37] hover:bg-[#C59B27] flex items-center justify-center transition-colors group"
                aria-label="Subscribe to newsletter"
              >
                <ArrowRight className="w-5 h-5 text-[#0B2545] transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
