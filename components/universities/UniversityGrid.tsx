"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function UniversityGrid() {
  const t = useTranslations('UniversityGrid');

  const universities = [
    {
      name: 'Harvard University',
      location: '🇺🇸 United States',
      image: '/harvard.png',
      tags: ['LEADERSHIP', 'INNOVATION', 'GLOBAL IMPACT'],
      description: 'Harvard\'s multidisciplinary environment offers a powerful model for developing intellectually curious and globally minded leaders.',
      link: '#'
    },
    {
      name: 'University of Oxford',
      location: '🇬🇧 United Kingdom',
      image: '/oxford.png',
      tags: ['ACADEMIC EXCELLENCE', 'LEADERSHIP', 'GLOBAL PERSPECTIVE'],
      description: 'Oxford represents a tradition of intellectual curiosity and academic excellence, with pathways to global leadership and impact.',
      link: '#'
    },
    {
      name: 'Stanford University',
      location: '🇺🇸 United States',
      image: '/standford.png',
      tags: ['INNOVATION', 'ENTREPRENEURSHIP', 'LEADERSHIP'],
      description: 'Stanford\'s culture of innovation demonstrates how academic knowledge can translate into meaningful global impact.',
      link: '#'
    },
    {
      name: 'Massachusetts Institute of Technology',
      location: '🇺🇸 United States',
      image: '/mit.png',
      tags: ['STEM', 'INNOVATION', 'PROBLEM SOLVING'],
      description: 'MIT inspires the next generation of global thinkers and changemakers through world-class research and hands-on learning.',
      link: '#'
    },
    {
      name: 'University of Cambridge',
      location: '🇬🇧 United Kingdom',
      image: '/cambridge.png',
      tags: ['SCHOLARSHIP', 'RESEARCH', 'CRITICAL THINKING'],
      description: 'Cambridge\'s collegiate tradition emphasizes independent thought, critical thinking and interdisciplinary learning.',
      link: '#'
    },
    {
      name: 'Yale University',
      location: '🇺🇸 United States',
      image: '/yale.png',
      tags: ['LEADERSHIP', 'GLOBAL AFFAIRS', 'ACADEMIC EXCELLENCE'],
      description: 'Yale\'s diverse academic community and global perspective help students develop the skills to lead and create lasting impact.',
      link: '#'
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
              {t('badge')}
            </span>
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0B2545] leading-tight mb-6">
            {t('title')}
          </motion.h2>
          <motion.div variants={itemVariants} className="space-y-4 text-gray-600 font-sans text-base md:text-lg leading-relaxed">
            <p>
              {t('subtitle1')}
            </p>
            <p>
              {t('subtitle2')}
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
              className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-8 flex flex-col h-full hover:-translate-y-1.5 transition-transform duration-300"
            >
              {/* Header: Logo & Name */}
              <div className="flex items-start gap-4 mb-1">
                <img
                  src={uni.image}
                  alt={uni.name}
                  className="w-[50px] h-[50px] object-contain shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="flex flex-col">
                  <h3 className="font-serif text-[1.35rem] leading-tight text-[#0B2545] font-bold mb-1">
                    {uni.name}
                  </h3>
                  <div className="text-[13px] text-gray-500 font-medium flex items-center gap-1.5">
                    {uni.location}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-4 mt-6 flex-wrap flex gap-1">
                {uni.tags.join(' • ')}
              </div>

              {/* Description */}
              <p className="text-[14px] text-gray-600 leading-relaxed flex-grow mb-8">
                {uni.description}
              </p>

              {/* Button */}
              <Link
                href={uni.link}
                className="inline-flex items-center gap-2 bg-[#0B2545] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors self-start hover:bg-[#1a365d]"
              >
                {t('viewBtn')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
