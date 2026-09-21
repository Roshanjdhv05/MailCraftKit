import React from 'react';
import { motion } from 'framer-motion';
import { FileCode2, ArrowRight, Code, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HtmlImportSection: React.FC = () => {
  const navigate = useNavigate();

  const codeSnippet = `<table>
  <tr>
    <td style="padding: 24px; font-family: sans-serif;">
      <h1 style="color: #0f172a;">Welcome {{name}}</h1>
      <p style="color: #475569;">{{message}}</p>
      <a href="{{button_url}}" style="background: #2563eb; color: #fff; padding: 10px 16px; border-radius: 8px; text-decoration: none;">
        {{button_text}}
      </a>
    </td>
  </tr>
</table>`;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-900"
          >
            <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Developer Ready</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight"
          >
            Already have your email HTML? Bring it with you.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-base sm:text-lg font-medium"
          >
            Paste or upload any custom HTML layout. Mailcraft parses variables, renders live previews, and sends directly via SMTP.
          </motion.p>
        </div>

        {/* Side-by-side Code -> Render Mockup Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Column: Code Editor Mockup */}
          <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono text-slate-300">template.html</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">HTML5 + Handlebars</span>
            </div>

            <div className="p-4 font-mono text-xs text-blue-300 overflow-x-auto leading-relaxed bg-slate-900">
              <pre>
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </div>

          {/* Center Connection Indicator (Flow Arrow) */}
          <div className="hidden lg:flex items-center justify-center -mx-4 z-10">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 animate-pulse">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Right Column: Live Rendered Output */}
          <div className="lg:col-span-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
            <div className="w-full text-center pb-3 mb-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1.5 font-semibold text-emerald-400">
                <Eye className="w-3.5 h-3.5" />
                <span>Rendered HTML Output</span>
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                Live Preview
              </span>
            </div>

            {/* Email Rendered Card */}
            <div className="w-full bg-white text-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Welcome Roshan</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Thank you for trying Mailcraft. Your custom HTML template rendered perfectly!
              </p>
              <div className="pt-2">
                <span className="inline-block px-4 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-md">
                  Visit Website
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 inline-flex items-center space-x-2"
          >
            <span>Import Your HTML Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
