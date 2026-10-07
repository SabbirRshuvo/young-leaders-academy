"use client";

import { useState } from 'react';
import ProgramsHero from './ProgramsHero';
import CoreProgramsGrid from './CoreProgramsGrid';

export default function ProgramsWrapper() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <>
      <ProgramsHero 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
      />
      <CoreProgramsGrid selectedCategory={selectedCategory} />
    </>
  );
}
