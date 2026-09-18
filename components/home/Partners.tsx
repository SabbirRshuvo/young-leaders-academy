'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Partners() {
  const t = useTranslations('Partners');
  const partners = [
    { name: "HARVARD", sub: "UNIVERSITY", color: "text-[#A51C30]" },
    { name: "KSU", sub: "King Saud University", color: "text-[#184F8D]" },
    { name: "Stanford", sub: "University", color: "text-[#8C1515]" },
    { name: "KAUST", sub: "King Abdullah University", color: "text-[#005570]" },
    { name: "MIT", sub: "Massachusetts Institute of Technology", color: "text-[#A31F34]" },
    { name: "KFUPM", sub: "King Fahd University", color: "text-[#006A4D]" },
    { name: "Yale", sub: "University", color: "text-[#00356B]" },
    { name: "OXFORD", sub: "UNIVERSITY OF", color: "text-[#002147]" },
    { name: "Cambridge", sub: "University", color: "text-[#A3C1AD]" },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-[#FAFAFA]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1440px] text-center">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center justify-center space-y-4 mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="h-[1.5px] w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[11px] uppercase">
              {t('badge')}
            </span>
            <div className="h-[1.5px] w-12 bg-[#D4AF37]"></div>
          </div>
          <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl md:text-5xl text-[#0B2545]">
            {t('title')}
          </h2>
          <p className="max-w-[750px] text-[#6B7B8F] md:text-lg">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* ================= SLIDER SECTION ================= */}
        {/* CRITICAL FIX: Added STRICT height (h-[160px]) to the main wrapper to stop ANY page jumping */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative flex items-center justify-center px-8 md:px-16 mt-14 w-full h-[160px]"
        >

          <button
            type="button"
            className="partner-prev absolute left-0 z-10 w-12 h-12 flex items-center justify-center text-gray-400 hover:text-[#0B2545] transition-colors cursor-pointer bg-white rounded-full shadow-sm border border-gray-300 hover:shadow-md"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </button>

          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            loop={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            navigation={{
              prevEl: '.partner-prev',
              nextEl: '.partner-next',
            }}
            pagination={{
              el: '.partner-pagination',
              clickable: true,
            }}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 20 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 30 },
              1024: { slidesPerView: 4, spaceBetween: 30 },
              1280: { slidesPerView: 5, spaceBetween: 30 },
            }}
            // STRICT height on Swiper component
            className="w-full max-w-[1150px] h-[140px] pt-4 pb-4"
          >
            {partners.map((partner, i) => (
              // STRICT height on Slides
              <SwiperSlide key={i} className="flex justify-center h-[110px]">
                {/* Changed transition-all to transition-shadow to prevent size shifting */}
                <div className="w-full h-[110px] bg-white border border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-shadow duration-300">

                  {partner.sub === "UNIVERSITY OF" && (
                    <div className="text-[10px] font-bold text-gray-500 mb-1">{partner.sub}</div>
                  )}

                  <div className={`text-2xl md:text-3xl font-serif font-extrabold leading-none tracking-tight ${partner.color}`}>
                    {partner.name}
                  </div>

                  {partner.sub !== "UNIVERSITY OF" && (
                    <div className="text-[11px] md:text-[12px] font-sans font-semibold text-gray-500 mt-1.5 text-center leading-tight">
                      {partner.sub}
                    </div>
                  )}

                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            type="button"
            className="partner-next absolute right-0 z-10 w-12 h-12 flex items-center justify-center text-gray-400 hover:text-[#0B2545] transition-colors cursor-pointer bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={2} />
          </button>
        </motion.div>

        {/* Pagination Dots - Added fixed height h-[20px] */}
        <div className="partner-pagination h-[20px] flex justify-center items-center gap-3 mt-4 [&_.swiper-pagination-bullet]:w-2.5 [&_.swiper-pagination-bullet]:h-2.5 [&_.swiper-pagination-bullet]:bg-gray-300 [&_.swiper-pagination-bullet]:opacity-50 [&_.swiper-pagination-bullet-active]:!bg-[#D4AF37] [&_.swiper-pagination-bullet-active]:!opacity-100 [&_.swiper-pagination-bullet]:transition-all" />

      </div>
    </section>
  );
}