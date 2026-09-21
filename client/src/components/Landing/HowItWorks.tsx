import React from 'react';
import { motion } from 'framer-motion';
import { LayoutTemplate, Sliders, Eye, Send, Check } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Choose a Template',
      description: 'Select from our library of responsive email layouts designed for sales, product updates, and newsletters.',
      icon: LayoutTemplate,
      illustration: (
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <div className="h-2 w-20 bg-slate-200 rounded" />
          </div>
          <div className="h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-500 font-mono">
            [ Selected Template ]
          </div>
        </div>
      ),
    },
    {
      number: '02',
      title: 'Customize Your Email',
      description: 'Edit headlines, body content, image URLs, button CTAs, and dynamic variables effortlessly.',
      icon: Sliders,
      illustration: (
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-sm">
          <div className="h-2 w-24 bg-blue-600/80 rounded" />
          <div className="h-2 w-32 bg-slate-200 rounded" />
          <div className="h-6 bg-blue-50 border border-blue-200 rounded flex items-center px-2 text-[10px] text-blue-800 font-semibold">
            Heading: Welcome Roshan
          </div>
        </div>
      ),
    },
    {
      number: '03',
      title: 'Preview It',
      description: 'Switch between desktop and mobile viewport previews to verify your email layout renders cleanly.',
      icon: Eye,
      illustration: (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-center space-x-2 shadow-sm">
          <div className="w-16 h-12 bg-slate-50 rounded border border-blue-300 p-1 flex flex-col justify-between">
            <div className="h-1.5 w-8 bg-blue-600 rounded" />
            <div className="h-1 w-10 bg-slate-300 rounded" />
          </div>
          <div className="w-8 h-12 bg-slate-50 rounded border border-slate-300 p-1 flex flex-col justify-between">
            <div className="h-1.5 w-5 bg-blue-600 rounded" />
            <div className="h-1 w-6 bg-slate-300 rounded" />
          </div>
        </div>
      ),
    },
    {
      number: '04',
      title: 'Send',
      description: 'Enter your target recipient, press send, and track delivery in your email history log.',
      icon: Send,
      illustration: (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-emerald-600 font-bold flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Status: Delivered</span>
            </div>
            <div className="h-1.5 w-20 bg-slate-200 rounded" />
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Send className="w-3.5 h-3.5" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-900"
          >
            <span>Simple 4-Step Workflow</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight"
          >
            How Mailcraft Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-base sm:text-lg font-medium"
          >
            Go from an idea to a delivered email campaign in under two minutes.
          </motion.p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 relative group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-blue-600/30 group-hover:text-blue-600 transition-colors font-mono">
                      {step.number}
                    </span>
                    <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                {/* Step Illustration */}
                <div className="pt-2">
                  {step.illustration}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
