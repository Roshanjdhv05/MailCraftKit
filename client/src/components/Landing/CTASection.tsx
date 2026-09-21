import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="cta" className="py-24 bg-blue-50/50 relative overflow-hidden">
      {/* Animated Mesh Gradient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-400/20 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950 border border-blue-900 rounded-3xl p-10 sm:p-16 shadow-2xl space-y-6 relative overflow-hidden text-white"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-xs font-semibold text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Ready to transform your emails?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Your next email is only a few clicks away.
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Choose a template, make it yours, preview it, and send it.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base rounded-2xl transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center gap-2 group"
            >
              <span>Start Building for Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
