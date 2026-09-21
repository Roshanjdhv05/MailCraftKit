import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleExploreTemplates = () => {
    const el = document.getElementById('templates');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white">
      {/* Subtle Blue Background Glow Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        {/* Trust / Product Badge Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-xs font-semibold text-blue-900 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>HTML Email Builder • Live Preview • Simple Sending</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-950 tracking-tight leading-[1.1]"
        >
          Create. Customize.{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            Send.
          </span>
        </motion.h1>

        {/* Supporting Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Build beautiful HTML emails without starting from scratch. Choose a template, customize your content, import your own HTML, preview it, and send it.
        </motion.p>

        {/* Hero Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <button
            onClick={() => navigate('/auth')}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-2xl transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 flex items-center justify-center gap-2 group"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleExploreTemplates}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-200 flex items-center justify-center"
          >
            Explore Templates
          </button>
        </motion.div>

        {/* Quick Features Micro-row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-600 font-semibold"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>No Coding Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Responsive Email Layouts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Instant SMTP Delivery</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
