import React from 'react';
import { Navbar } from '../components/Landing/Navbar';
import { Hero } from '../components/Landing/Hero';
import { ProductPreview } from '../components/Landing/ProductPreview';
import { ProblemSection } from '../components/Landing/ProblemSection';
import { FeaturesSection } from '../components/Landing/FeaturesSection';
import { HowItWorks } from '../components/Landing/HowItWorks';
import { TemplateShowcase } from '../components/Landing/TemplateShowcase';
import { HtmlImportSection } from '../components/Landing/HtmlImportSection';
import { PersonalizationSection } from '../components/Landing/PersonalizationSection';
import { WorkflowSection } from '../components/Landing/WorkflowSection';
import { CTASection } from '../components/Landing/CTASection';
import { Footer } from '../components/Landing/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Sticky Glassmorphism Navigation */}
      <Navbar />

      {/* Main Sections */}
      <main>
        <Hero />
        <ProductPreview />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorks />
        <TemplateShowcase />
        <HtmlImportSection />
        <PersonalizationSection />
        <WorkflowSection />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
