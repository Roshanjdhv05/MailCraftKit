import React from 'react';
import { motion } from 'framer-motion';
import { Code2, LayoutGrid, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProblemSection: React.FC = () => {
  const navigate = useNavigate();

  const problems = [
    {
      icon: Code2,
      title: 'Starting from zero',
      description: 'Writing email-compatible HTML with nested tables and inline CSS by hand takes hours of debugging.',
      badge: 'Time Consuming',
    },
    {
      icon: LayoutGrid,
      title: 'Designing from scratch',
      description: 'You shouldn’t have to rebuild the exact same email structure and boilerplate for every single campaign.',
      badge: 'Repetitive',
    },
    {
      icon: EyeOff,
      title: 'Previewing emails',
      description: 'What looks good in a standard desktop browser isn’t always how Outlook, Gmail, or iOS Mail renders it.',
      badge: 'Unpredictable',
    },
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-800"
          >
            <span>The Developer Problem</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight"
          >
            Email HTML shouldn’t be this complicated.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-base sm:text-lg font-medium"
          >
            Traditional email creation forces developers to spend hours tinkering with fragile tables, MSO conditional comments, and inline CSS fixes.
          </motion.p>
        </div>

        {/* 3 Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, idx) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200">
                      {problem.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {problem.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* The Solution Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-blue-900 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
        >
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center justify-center md:justify-start space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Mailcraft Solution</span>
            </span>
            <h3 className="text-2xl font-bold text-white">Choose a template. Customize. Preview. Send.</h3>
            <p className="text-sm text-slate-300">
              Skip the frustration. Use battle-tested, client-compatible email layouts designed to look pixel-perfect everywhere.
            </p>
          </div>

          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 shrink-0 flex items-center space-x-2 group"
          >
            <span>Start Building Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
