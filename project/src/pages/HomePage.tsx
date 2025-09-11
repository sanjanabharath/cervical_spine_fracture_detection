import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import TechSection from '../components/home/TechSection';

const HomePage: React.FC = () => {
  return (
    <div>
      <Hero />
      <Features />
      <TechSection />
    </div>
  );
};

export default HomePage;