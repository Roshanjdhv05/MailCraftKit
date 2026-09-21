import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowDown, User, Building, Heading, MessageSquare } from 'lucide-react';

export const PersonalizationSection: React.FC = () => {
  const [activeVar, setActiveVar] = useState<'name' | 'company' | 'heading' | 'message'>('name');

  const variables = [
    {
      key: '{{name}}',
      id: 'name',
      label: 'Recipient Name',
      sampleVal: 'Roshan',
      templateText: 'Hello {{name}}, welcome to Mailcraft!',
      renderedText: 'Hello Roshan, welcome to Mailcraft!',
      icon: User,
    },
    {
      key: '{{company}}',
      id: 'company',
      label: 'Company Name',
      sampleVal: 'Acme Studio',
      templateText: 'Thank you for choosing {{company}} for email automation.',
      renderedText: 'Thank you for choosing Acme Studio for email automation.',
      icon: Building,
    },
    {
      key: '{{heading}}',
      id: 'heading',
      label: 'Email Heading',
      sampleVal: 'Autumn Release 2.0',
      templateText: 'Subject: {{heading}} is now live!',
      renderedText: 'Subject: Autumn Release 2.0 is now live!',
      icon: Heading,
    },
    {
      key: '{{message}}',
      id: 'message',
      label: 'Message Body',
      sampleVal: 'Your subscription status is active.',
      templateText: 'Notice: {{message}}',
      renderedText: 'Notice: Your subscription status is active.',
      icon: MessageSquare,
    },
  ];

  const current = variables.find((v) => v.id === activeVar) || variables[0];

  return (
    <section className="py-24 bg-blue-50/50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-900"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Dynamic Variable Replacement</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight"
          >
            Personalize every email at scale.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-base sm:text-lg font-medium"
          >
            Embed Handlebars placeholders into your text or HTML, and let Mailcraft replace them automatically for each recipient.
          </motion.p>
        </div>

        {/* Variable Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {variables.map((v) => {
            const Icon = v.icon;
            const isActive = v.id === activeVar;
            return (
              <button
                key={v.id}
                onClick={() => setActiveVar(v.id as any)}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all flex items-center space-x-2 border shadow-sm ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{v.key}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Visual Transformation Demo */}
        <motion.div
          layout
          className="bg-white border border-slate-200 rounded-3xl p-8 max-w-3xl mx-auto shadow-xl space-y-6"
        >
          {/* Step 1: Raw Template Code */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1. Raw Template Variable
            </span>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-blue-900 flex items-center justify-between shadow-inner">
              <span>{current.templateText}</span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                Variable Mode
              </span>
            </div>
          </div>

          {/* Transformation Arrow */}
          <div className="flex justify-center my-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shadow-sm">
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>
          </div>

          {/* Step 2: Live Replaced Result */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              2. Rendered Recipient Result
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-blue-50/60 text-slate-900 p-5 rounded-xl border border-blue-200 shadow-sm font-sans text-sm font-bold"
              >
                {current.renderedText}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
