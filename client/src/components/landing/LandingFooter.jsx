import React from 'react';
import { 
  Github, 
  Mail, 
  MapPin
} from 'lucide-react';

/**
 * LandingFooter Component
 * Enhanced footer for the landing page with contact info and social links
 */
const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/ayush23chaudhary/SpeakWise-Speech-AI-Coach',
      color: 'hover:text-gray-800 dark:hover:text-gray-200'
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section - Brand & Contact Info */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Brand & Description */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1E2A5A] to-[#2A3A7A] rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">SpeakWise</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Transform your speaking skills with AI-powered analysis, personalized feedback, and gamified learning. Master the art of effective communication.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-[#1FB6A6]" />
                <a 
                  href="mailto:speakwise.aicoach@gmail.com"
                  className="hover:text-[#1FB6A6] transition-colors font-medium"
                >
                  speakwise.aicoach@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-[#1FB6A6]" />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Connect With Us
              </h4>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-all duration-300 ${social.color} hover:bg-gray-200 dark:hover:bg-gray-700 transform hover:scale-110`}
                      title={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Newsletter Signup (Optional) */}
            <div className="mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Get updates on new features and improvements
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1FB6A6]"
                />
                <button className="px-4 py-2 bg-[#1FB6A6] hover:bg-[#17A293] text-white rounded-lg transition-colors font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} SpeakWise. All rights reserved.
            </p>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Made with passion for better communication
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

