"use client";

import { useState } from 'react';
import ProgramsHero from './ProgramsHero';
import FeaturedProgram from './FeaturedProgram';
import CoreProgramsGrid from './CoreProgramsGrid';
import { AnimatePresence, motion } from 'framer-motion';

export default function ProgramsWrapper() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <>
      <ProgramsHero 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
      />
      
      <AnimatePresence mode="wait">
        {selectedCategory === 'all' && (
          <motion.div
            key="featured"
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.5, ease: [0.42, 0, 0.58, 1] }}
          >
            <FeaturedProgram />
          </motion.div>
        )}
      </AnimatePresence>

      <CoreProgramsGrid selectedCategory={selectedCategory} />
    </>
  );
}
