import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const traditionalSteps = ['Design from scratch', 'Hand-code tables', 'Test across clients', 'Fix broken styling', 'Send'];
  const mailerCraftSteps = ['Choose Template', 'Customize Content', 'Live Preview', 'Send Instantly'];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-900"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Workflow Optimization</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight"
          >
            A faster way to ship emails.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-base sm:text-lg font-medium"
          >
            Eliminate repetitive boilerplate coding and manual debugging loops with our streamlined 4-stage pipeline.
          </motion.p>
        </div>

        {/* Side by Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Workflow Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Traditional Email Workflow</h3>
              <span className="text-xs text-rose-600 font-mono font-bold">5 Steps • Hours of work</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-700">
              {traditionalSteps.map((step, idx) => (
                <React.Fragment key={step}>
                  <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm font-semibold">
                    {step}
                  </span>
                  {idx < traditionalSteps.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                </React.Fragment>
              ))}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-2 font-normal">
              Requires writing nested table structures, resolving MSO conditional bugs, and re-testing HTML files across multiple email clients manually.
            </p>
          </motion.div>

          {/* Mailcraft Workflow Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950 border border-blue-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden text-white"
          >
            <div className="flex items-center justify-between pb-4 border-b border-blue-800/80">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Mailcraft Workflow</span>
              </h3>
              <span className="text-xs text-emerald-400 font-mono font-bold">4 Steps • 2 Minutes</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-white">
              {mailerCraftSteps.map((step, idx) => (
                <React.Fragment key={step}>
                  <span className="px-3 py-1.5 bg-blue-600/40 border border-blue-500/50 rounded-lg font-bold text-blue-100 shadow-sm">
                    {step}
                  </span>
                  {idx < mailerCraftSteps.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-blue-400" />}
                </React.Fragment>
              ))}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-2 font-normal">
              Pre-tested responsive templates handle all email client quirks out of the box. Simply edit, preview, and send instantly.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
