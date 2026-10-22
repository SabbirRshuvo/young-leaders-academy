"use client";

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { upcomingEvents, Event } from '@/data/events';
import { Calendar, MapPin, Users, Monitor, Search, Building2 } from 'lucide-react';
import EventRsvpModal from '@/components/events/EventRsvpModal';

export default function EventsPage() {
  const t = useTranslations('EventsPage');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const categories = [
    { id: 'All', label: t('filterAll') },
    { id: 'University Fairs', label: t('filterFairs') },
    { id: 'Webinars', label: t('filterWebinars') },
    { id: 'Workshops', label: t('filterWorkshops') }
  ];

  const filteredEvents = upcomingEvents.filter(event => {
    const matchesCategory = activeCategory === 'All' || event.categoryEn === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      event.titleEn.toLowerCase().includes(searchLower) || 
      event.titleAr.toLowerCase().includes(searchLower) ||
      event.hostEn.toLowerCase().includes(searchLower) ||
      event.hostAr.toLowerCase().includes(searchLower);
      
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 pt-32">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 text-left">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold font-serif text-[#0B2545] mb-4">
              {t('title')}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('subtitle')}
            </p>
          </div>

          <div className="relative w-full md:max-w-xs">
            <div className="absolute inset-y-0 flex items-center pointer-events-none left-4">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={isAr ? 'ابحث عن الفعاليات...' : 'Search events...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent pl-12 pr-4 text-left"
            />
          </div>
        </div>

        {/* Category Filters (Horizontal Scroll on Mobile) */}
        <div className="mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex gap-3 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all min-h-[44px] ${
                  activeCategory === cat.id
                    ? 'bg-[#0B2545] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-left"
              >
                {/* Card Header (Date & Type) */}
                <div className="p-6 pb-0 flex justify-between items-start">
                  <div className="bg-[#F8F9FA] px-4 py-2 rounded-xl flex flex-col items-center justify-center border border-gray-100">
                    <span className="text-[#D4AF37] font-bold text-xl leading-none">
                      {isAr ? event.dateAr.split(' ')[0] : event.dateEn.split(' ')[1].replace(',', '')}
                    </span>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">
                      {isAr ? event.dateAr.split(' ')[1] : event.dateEn.split(' ')[0]}
                    </span>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    event.type === 'virtual' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {event.type === 'virtual' ? <Monitor className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                    {isAr ? event.typeLabelAr : event.typeLabelEn}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold font-serif text-[#0B2545] mb-2 min-h-[64px] line-clamp-2" dir="ltr">
                    {isAr ? event.titleAr : event.titleEn}
                  </h3>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold text-gray-700">{t('hostLabel')}</span>
                        {isAr ? event.hostAr : event.hostEn}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        {isAr ? event.timeAr : event.timeEn}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold text-gray-700">{t('locationLabel')}</span>
                        {isAr ? event.locationAr : event.locationEn}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 mt-auto">
                  <div className="flex items-center justify-between mb-4 text-xs font-bold text-gray-500">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {event.seats} {t('seats')}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full bg-[#0B2545] text-white hover:bg-[#133055] py-3.5 rounded-xl font-bold text-sm transition-colors shadow-md min-h-[44px]"
                  >
                    {t('rsvpBtn')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#0B2545] mb-2">{t('emptyState')}</h3>
          </div>
        )}

      </div>

      <EventRsvpModal 
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </main>
  );
}
