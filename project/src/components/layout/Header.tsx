import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuIcon, X, ActivitySquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-gradient-to-r from-primary-600 to-primary-500 py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2"
            aria-label="Cervical Fracture Detection"
          >
            <ActivitySquare
              className={`w-8 h-8 ${isScrolled ? 'text-primary-500' : 'text-white'}`}
            />
            <span
              className={`font-bold text-xl ${
                isScrolled ? 'text-gray-800' : 'text-white'
              }`}
            >
              CervicalScan
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {[
              { name: 'Home', path: '/' },
              { name: 'Upload', path: '/upload' },
              { name: 'Dashboard', path: '/dashboard' },
              { name: 'About', path: '/about' },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`font-medium transition-colors ${
                  isScrolled
                    ? 'text-gray-700 hover:text-primary-600'
                    : 'text-white hover:text-primary-100'
                } ${
                  location.pathname === item.path && 'underline underline-offset-4'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Button
              variant={isScrolled ? 'default' : 'outline'}
              size="default"
              className={isScrolled ? '' : 'text-white border-white hover:bg-primary-600/20'}
            >
              Login
            </Button>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? 'text-gray-800' : 'text-white'} />
            ) : (
              <MenuIcon className={isScrolled ? 'text-gray-800' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-white shadow-lg py-4"
        >
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Upload', path: '/upload' },
                { name: 'Dashboard', path: '/dashboard' },
                { name: 'About', path: '/about' },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-medium text-gray-700 hover:text-primary-600 ${
                    location.pathname === item.path &&
                    'text-primary-600 font-semibold'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Button variant="default" size="default" className="w-full">
                Login
              </Button>
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;