"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function UniversityGrid() {
  const universities = [
    {
      name: "Harvard University",
      country: "United States",
      flag: "🇺🇸",
      logo: "/harvard.png",
      tags: ["Leadership", "Innovation", "Global Impact"],
      desc: "Harvard's multidisciplinary environment offers a powerful model for developing intellectually curious and globally minded leaders."
    },
    {
      name: "University of Oxford",
      country: "United Kingdom",
      flag: "🇬🇧",
      logo: "/oxford.png",
      tags: ["Academic Excellence", "Leadership", "Global Perspective"],
      desc: "Oxford represents a tradition of intellectual curiosity and academic excellence, with pathways to global leadership and impact."
    },
    {
      name: "Stanford University",
      country: "United States",
      flag: "🇺🇸",
      logo: "/stanford.png",
      tags: ["Innovation", "Entrepreneurship", "Leadership"],
      desc: "Stanford's culture of innovation demonstrates how academic knowledge can translate into meaningful global impact."
    },
    {
      name: "Massachusetts Institute of Technology",
      country: "United States",
      flag: "🇺🇸",
      logo: "/mit.png",
      tags: ["STEM", "Innovation", "Problem Solving"],
      desc: "MIT inspires the next generation of global thinkers and changemakers through world-class research and hands-on learning."
    },
    {
      name: "University of Cambridge",
      country: "United Kingdom",
      flag: "🇬🇧",
      logo: "/cambridge.png",
      tags: ["Scholarship", "Research", "Critical Thinking"],
      desc: "Cambridge's collegiate tradition emphasizes independent thought, critical thinking and interdisciplinary learning."
    },
    {
      name: "Yale University",
      country: "United States",
      flag: "🇺🇸",
      logo: "/yale.png",
      tags: ["Leadership", "Global Affairs", "Academic Excellence"],
      desc: "Yale's diverse academic community and global perspective help students develop the skills to lead and create lasting impact."
    }
  ];

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
    <section className="w-full py-16 md:py-24 bg-white overflow-hidden" id="network">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="flex flex-col items-start mb-16 max-w-3xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
            <div className="h-[1.5px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
              Our Global Network
            </span>
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0B2545] leading-tight mb-6">
            Partner Universities & World-Class Institutions
          </motion.h2>
          <motion.div variants={itemVariants} className="space-y-4 text-gray-600 font-sans text-base md:text-lg leading-relaxed">
            <p>
              The world's leading universities represent more than prestigious names — they are communities built around curiosity, intellectual ambition, innovation, and impact.
            </p>
            <p>
              Through carefully designed academic pathways and global experiences, YLA helps students understand these environments, prepare for them, and aspire to become part of them.
            </p>
          </motion.div>
        </motion.div>

        {/* 3-Column Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {universities.map((uni, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col bg-white rounded-2xl border border-gray-100 p-8 shadow-xl shadow-black/[0.04] hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#D4AF37]/30 transition-all duration-300 group"
            >
              {/* Top Row: Logo & Name */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 flex items-center justify-center shrink-0 overflow-hidden">
                  <Image
                    src={uni.logo}
                    alt={uni.name}
                    width={64}
                    height={64}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="flex flex-col pt-1">
                  <h3 className="text-[#0B2545] font-bold font-serif text-lg leading-tight mb-1">
                    {uni.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-none">{uni.flag}</span>
                    <span className="text-xs text-gray-500 font-medium">{uni.country}</span>
                  </div>
                </div>
              </div>

              {/* Tags separated by dots */}
              <div className="flex flex-wrap items-center gap-1.5 mb-6 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {uni.tags.map((tag, i) => (
                  <span key={i} className="flex items-center">
                    {tag}
                    {i < uni.tags.length - 1 && <span className="mx-2 text-gray-300">•</span>}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed mb-8 flex-1">
                {uni.desc}
              </p>

              {/* Button */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#071931] transition-colors group/btn w-max"
                >
                  View Partnership
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
