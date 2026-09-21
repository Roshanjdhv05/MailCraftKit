import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TemplateShowcase: React.FC = () => {
  const navigate = useNavigate();

  const templates = [
    {
      title: 'Welcome Email',
      category: 'Onboarding',
      gradient: 'from-blue-600 via-indigo-600 to-blue-700',
      tag: 'Popular',
      previewHeading: 'Welcome to Mailcraft 🎉',
      previewBody: 'We are thrilled to have you onboard. Explore your dashboard and build your first email campaign.',
      buttonText: 'Get Started',
    },
    {
      title: 'Promotion & Sale',
      category: 'E-commerce',
      gradient: 'from-blue-700 via-indigo-700 to-blue-800',
      tag: 'High CTR',
      previewHeading: 'Exclusive 30% Off Today',
      previewBody: 'Unlock special autumn discounts on all premium features. Offer expires at midnight.',
      buttonText: 'Claim Discount',
    },
    {
      title: 'Monthly Newsletter',
      category: 'Content',
      gradient: 'from-blue-600 via-cyan-600 to-blue-700',
      tag: 'Editorial',
      previewHeading: 'September Tech Digest',
      previewBody: 'Here is what we shipped this month: live preview updates, bulk CSV sending, and fresh template designs.',
      buttonText: 'Read Digest',
    },
    {
      title: 'Event Invitation',
      category: 'Events',
      gradient: 'from-indigo-600 via-blue-600 to-indigo-700',
      tag: 'Interactive',
      previewHeading: 'Join Our Live Webinar',
      previewBody: 'Learn how top SaaS founders design high-converting email sequences from scratch.',
      buttonText: 'Reserve Seat',
    },
    {
      title: 'Milestone Achievement',
      category: 'SaaS',
      gradient: 'from-blue-500 via-teal-600 to-blue-700',
      tag: 'Engaging',
      previewHeading: 'You Hit 10,000 Sends! 🚀',
      previewBody: 'Congratulations on reaching a major email milestone. Your audience engagement is growing fast.',
      buttonText: 'View Analytics',
    },
    {
      title: 'Business Proposal',
      category: 'B2B Corporate',
      gradient: 'from-slate-800 via-blue-950 to-slate-900',
      tag: 'Professional',
      previewHeading: 'Q4 Partnership Plan',
      previewBody: 'Attached is our revised proposal for enterprise integration and dedicated SMTP configuration.',
      buttonText: 'Review Proposal',
    },
  ];

  return (
    <section id="templates" className="py-24 bg-blue-50/40 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-900"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Pre-Built Email Layouts</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight"
            >
              Start with a template.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 text-base sm:text-lg font-medium"
            >
              Choose from ready-to-send email designs engineered to render cleanly across all major email clients.
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onClick={() => navigate('/auth')}
            className="px-5 py-3 bg-white hover:bg-slate-50 text-blue-700 font-semibold text-sm rounded-xl border border-blue-200 transition-all flex items-center space-x-2 shrink-0 group shadow-sm"
          >
            <span>Browse Templates</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* 6 Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tmpl, idx) => (
            <motion.div
              key={tmpl.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-400 transition-all duration-300 group flex flex-col justify-between shadow-md hover:shadow-xl"
            >
              {/* Miniature Render Card Top Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {tmpl.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {tmpl.tag}
                  </span>
                </div>

                {/* Mini Email Visual Box */}
                <div className="bg-white text-slate-900 p-4 rounded-xl space-y-2.5 shadow-sm border border-slate-200">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${tmpl.gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                    M
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{tmpl.previewHeading}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{tmpl.previewBody}</p>
                  <div className="pt-1">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white font-semibold text-[10px] rounded-md shadow-sm">
                      {tmpl.buttonText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Details Footer */}
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Ready to customize & send</p>
                </div>

                <button
                  onClick={() => navigate('/auth')}
                  className="p-2.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl transition-all group-hover:scale-105 border border-blue-100"
                  title="Use template"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
