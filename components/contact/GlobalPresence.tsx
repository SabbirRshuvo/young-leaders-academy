"use client";

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function GlobalPresence() {
  const locations = [
    { city: "Dhaka", desc: "Headquarters" },
    { city: "London", desc: "Europe Office" },
    { city: "New York", desc: "Regional Office" },
    { city: "Singapore", desc: "Asia Pacific Office" },
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
    <section className="w-full py-16 md:py-24 bg-[#FCFAF6] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-12 lg:gap-8 items-center">
          
          {/* Left: Text & Stats */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
              <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                Our Global Presence
              </span>
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0B2545] leading-tight mb-6">
              A Worldwide Network
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-gray-600 font-sans text-sm md:text-base leading-relaxed mb-10 max-w-sm">
              From our headquarters to our international partners, we are connected across the globe to bring world-class opportunities closer to you.
            </motion.p>

            {/* Stats Row */}
            <motion.div variants={itemVariants} className="flex items-center gap-6 md:gap-8">
              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-serif font-bold text-[#0B2545] leading-none mb-1">6</span>
                <span className="text-xs md:text-sm font-semibold text-gray-500">Continents</span>
              </div>
              <div className="h-12 w-[1px] bg-gray-300"></div>
              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-serif font-bold text-[#0B2545] leading-none mb-1">20+</span>
                <span className="text-xs md:text-sm font-semibold text-gray-500">Countries</span>
              </div>
              <div className="h-12 w-[1px] bg-gray-300"></div>
              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-serif font-bold text-[#0B2545] leading-none mb-1">50+</span>
                <span className="text-xs md:text-sm font-semibold text-gray-500">Partner Institutions</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Middle: Map Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full relative h-[300px] md:h-[400px] lg:h-[450px]"
          >
            <Image 
              src="/map.png" // Ensure this placeholder exists or use a generic map graphic
              alt="World Map showing global presence"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain object-center opacity-90"
            />
          </motion.div>

          {/* Right: Locations List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-8 lg:pl-12"
          >
            {locations.map((loc, idx) => (
              <motion.div key={idx} variants={itemVariants} className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 bg-[#FCFAF6] flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover:bg-[#D4AF37]/10">
                  <MapPin className="w-5 h-5 text-[#D4AF37]" strokeWidth={2} />
                </div>
                <div className="flex flex-col pt-1">
                  <h4 className="text-[#0B2545] font-bold text-base md:text-lg mb-1 leading-none">{loc.city}</h4>
                  <p className="text-gray-500 text-xs md:text-sm font-medium">{loc.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
