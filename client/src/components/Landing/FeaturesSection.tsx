import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutTemplate,
  Edit3,
  FileCode2,
  Eye,
  Smartphone,
  Send,
  Sparkles,
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: LayoutTemplate,
      title: 'Ready-Made Templates',
      description: 'Start with professionally designed, fully tested HTML email templates suited for newsletters, sales, and welcome emails.',
    },
    {
      icon: Edit3,
      title: 'Edit Without Starting Over',
      description: 'Customize headings, body text, buttons, CTA links, colors, and dynamic parameters with real-time feedback.',
    },
    {
      icon: FileCode2,
      title: 'Import Your HTML',
      description: 'Already have a custom email template? Easily upload or paste your existing HTML code to preview and send.',
    },
    {
      icon: Eye,
      title: 'Live Preview',
      description: 'Watch your email update instantaneously as you edit fields or adjust code layout parameters.',
    },
    {
      icon: Smartphone,
      title: 'Desktop & Mobile Preview',
      description: 'Toggle effortlessly between desktop widescreen and mobile viewport renders to guarantee responsiveness.',
    },
    {
      icon: Send,
      title: 'Simple Sending',
      description: 'Enter your target recipient, configure your sender details, and deliver emails immediately via connected SMTP.',
    },
  ];

  return (
    <section id="features" className="py-24 bg-blue-50/50 relative overflow-hidden">
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
            <span>Powerful Platform Capabilities</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight"
          >
            Everything you need for perfect email delivery.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-base sm:text-lg font-medium"
          >
            Designed from the ground up to streamline building, testing, and sending HTML emails.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
