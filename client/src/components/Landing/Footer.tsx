import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/favicon.png" alt="Mailcraft Icon" className="h-10 w-auto object-contain bg-transparent drop-shadow-md" />
              <span className="font-extrabold text-xl text-white tracking-tight">
                Mail<span className="text-blue-500">craft</span><span className="text-blue-500">.</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Build better emails, faster. Choose a template, customize content, preview, and send with ease.
            </p>
          </div>

          {/* Product Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleScrollTo('templates')} className="hover:text-white transition-colors">
                  Templates
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo('features')} className="hover:text-white transition-colors">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo('how-it-works')} className="hover:text-white transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">
                  Email Editor
                </button>
              </li>
            </ul>
          </div>

          {/* Company Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <button onClick={() => navigate('/admin')} className="hover:text-white transition-colors">
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Mailcraft. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span>Responsive Email Engine</span>
            <span>•</span>
            <span>SMTP Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
