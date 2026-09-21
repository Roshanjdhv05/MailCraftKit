import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Monitor, Send, Sparkles, RefreshCw } from 'lucide-react';

export const ProductPreview: React.FC = () => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  // Animated values state
  const [headingText, setHeadingText] = useState('Welcome to Mailcraft');
  const [nameText, setNameText] = useState('Roshan');
  const [messageText, setMessageText] = useState('Thank you for joining our platform. Your account is active.');
  const [buttonText, setButtonText] = useState('Visit Dashboard');
  const [isTyping, setIsTyping] = useState(false);

  // Auto animation sequence for preview interactive demonstration
  useEffect(() => {
    const sequence = [
      { name: 'Roshan', heading: 'Welcome to Mailcraft', message: 'Thank you for joining our platform. Your account is active.' },
      { name: 'Sarah', heading: 'Special Announcement', message: 'We just launched our new HTML email generator features.' },
      { name: 'Alex', heading: 'Your Monthly Report', message: 'Here is a quick summary of your email marketing metrics.' },
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % sequence.length;
      setIsTyping(true);
      setTimeout(() => {
        setNameText(sequence[index].name);
        setHeadingText(sequence[index].heading);
        setMessageText(sequence[index].message);
        setIsTyping(false);
      }, 500);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="product" className="py-12 relative z-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white border border-blue-100 rounded-3xl shadow-2xl shadow-blue-900/10 overflow-hidden"
        >
          {/* Mockup Window Header */}
          <div className="bg-slate-950 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">Mailcraft — Live HTML Email Builder</span>
            </div>

            {/* Desktop / Mobile Toggle Controls */}
            <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  deviceView === 'desktop' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  deviceView === 'mobile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* Main Workspace Split Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
            {/* Left Panel: Email Form / Editor Inputs */}
            <div className="md:col-span-5 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email Editor</span>
                </span>
                {isTyping && (
                  <span className="text-[11px] text-blue-600 flex items-center space-x-1 animate-pulse font-medium">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Updating...</span>
                  </span>
                )}
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={nameText}
                    onChange={(e) => setNameText(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 focus:outline-none transition-colors shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Heading</label>
                  <input
                    type="text"
                    value={headingText}
                    onChange={(e) => setHeadingText(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 focus:outline-none transition-colors shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Message Body</label>
                  <textarea
                    rows={3}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 focus:outline-none transition-colors resize-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 focus:outline-none transition-colors shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email</span>
                </button>
              </div>
            </div>

            {/* Right Panel: Live HTML Email Preview */}
            <div className="md:col-span-7 bg-blue-50/40 p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center space-x-1.5">
                <span>Real-Time Email Render</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Render Container (Desktop vs Mobile View) */}
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`bg-white text-slate-900 rounded-2xl shadow-xl p-6 transition-all border border-slate-200 ${
                  deviceView === 'mobile' ? 'w-full max-w-[320px]' : 'w-full max-w-[500px]'
                }`}
              >
                {/* Email Header */}
                <div className="border-b border-slate-100 pb-4 mb-5 text-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-2 shadow-md">
                    M
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{headingText}</h2>
                </div>

                {/* Email Content Body */}
                <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800">Hello {nameText},</p>
                  <p>{messageText}</p>
                  <p className="text-xs text-slate-500">
                    Built and delivered dynamically using Mailcraft HTML Templates.
                  </p>
                </div>

                {/* Email Call-to-Action Button */}
                <div className="mt-6 pt-2 text-center">
                  <a
                    href="#cta"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
                  >
                    {buttonText}
                  </a>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
                  © 2026 Mailcraft. All rights reserved. • <span className="underline cursor-pointer">Unsubscribe</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
