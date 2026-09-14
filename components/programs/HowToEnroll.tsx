"use client";

import { FileText, ClipboardList, Users, GraduationCap, ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function HowToEnroll() {
  const steps = [
    {
      num: "1",
      title: "Choose Program",
      desc: "Explore our programs and find the right fit for your goals.",
      icon: FileText
    },
    {
      num: "2",
      title: "Submit Application",
      desc: "Complete the online application form with your details.",
      icon: ClipboardList
    },
    {
      num: "3",
      title: "Interview",
      desc: "Attend a short interview to help us know you better.",
      icon: Users
    },
    {
      num: "4",
      title: "Welcome Aboard",
      desc: "Get accepted and start your journey with us!",
      icon: GraduationCap
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
  };

  return (
    <section className="w-full bg-white py-16 md:py-24 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-16 md:mb-20"
        >
          <div className="flex items-center gap-4 mb-2 md:mb-4">
            <div className="h-[1.5px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
              Simple Steps to Get Started
            </span>
            <div className="h-[1.5px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#0B2545] mt-2 mb-3">
            How to Enroll
          </h2>
          <p className="text-gray-600 font-sans max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Joining Young Leaders Academy is easy. Follow these simple steps to begin your journey.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-4 relative"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center text-center relative w-full max-w-xs lg:w-1/4"
              >
                {/* Arrow Connector (Desktop only) */}
                {!isLast && (
                  <div className="hidden lg:block absolute top-[48px] left-[65%] w-[70%] xl:w-[80%] z-0">
                    <div className="relative w-full flex items-center">
                      <div className="w-full h-[1px] bg-[#D4AF37]/60"></div>
                      <ArrowRight className="absolute -right-2 text-[#D4AF37]/80 w-4 h-4" strokeWidth={2} />
                    </div>
                  </div>
                )}

                <div className="relative mb-6 md:mb-8 z-10 flex items-center justify-center">
                  {/* Number Badge */}
                  <div className="absolute -left-4 sm:-left-5 w-10 h-10 rounded-full bg-[#D4AF37] text-white flex items-center justify-center font-bold text-lg shadow-sm z-20 border-[4px] border-[#FCFAF6]">
                    {step.num}
                  </div>

                  {/* Icon Circle */}
                  <div className="w-24 h-24 rounded-full bg-white border-[1.5px] border-[#D4AF37] shadow-sm flex items-center justify-center relative z-10 p-4">
                    <Icon className="w-9 h-9 text-[#0B2545]" strokeWidth={1.2} />
                  </div>
                </div>

                <h3 className="text-lg md:text-[19px] font-serif font-bold text-[#0B2545] mb-2 md:mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 font-sans max-w-[220px] mx-auto leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
