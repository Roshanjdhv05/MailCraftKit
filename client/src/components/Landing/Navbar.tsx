import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BRAND_NAME = 'MailCraftKit';

interface NavbarProps {
  onLoginClick?: () => void;
  onGetStartedClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onGetStartedClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Product', href: 'product' },
    { label: 'Templates', href: 'templates' },
    { label: 'How It Works', href: 'how-it-works' },
    { label: 'Features', href: 'features' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-blue-100 py-3 shadow-md shadow-blue-900/5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo with Black and Blue MailCraftKit Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/favicon.png"
              alt="MailCraftKit Icon"
              className="h-12 sm:h-14 w-auto object-contain bg-transparent group-hover:scale-105 transition-transform drop-shadow-md"
            />
            <span className="font-extrabold text-2xl tracking-tight text-slate-950">
              MailCraft<span className="text-blue-600">Kit</span>
              <span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="hover:text-blue-600 transition-colors py-1"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => (onLoginClick ? onLoginClick() : navigate('/auth'))}
              className="text-sm font-semibold text-slate-700 hover:text-blue-950 transition-colors px-3 py-2"
            >
              Login
            </button>
            <button
              onClick={() => (onGetStartedClick ? onGetStartedClick() : navigate('/auth'))}
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-blue-100 overflow-hidden shadow-xl"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className="text-left text-base font-semibold text-slate-700 hover:text-blue-600 py-2 border-b border-slate-100"
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/auth');
                  }}
                  className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 rounded-xl"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/auth');
                  }}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-md"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
