import React from 'react';
import { Heart, Github } from 'lucide-react';

const Footer = () => {
   const currentYear = new Date().getFullYear();

   return (
     <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           {/* Brand */}
           <div className="max-w-md">
             <div className="flex items-center space-x-3 mb-4">
               <div className="w-10 h-10 bg-gradient-to-br from-[#1E2A5A] to-[#2A3A7A] rounded-lg flex items-center justify-center shadow-lg">
                 <span className="text-white font-bold text-lg">S</span>
               </div>
               <div>
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">SpeakWise</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400">AI Speech Coach</p>
               </div>
             </div>
             <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
               Transform your speech, one word at a time. Our AI-powered platform helps you improve your speaking skills through personalized analysis and progress tracking.
             </p>
             <div className="flex space-x-4">
               <a
                 href="https://github.com/ayush23chaudhary/SpeakWise-Speech-AI-Coach"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
               >
                 <Github className="w-5 h-5" />
               </a>
             </div>
           </div>
         </div>

         {/* Bottom */}
         <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
           <div className="flex flex-col md:flex-row justify-between items-center">
             <p className="text-sm text-gray-600 dark:text-gray-400">
               © {currentYear} SpeakWise. All rights reserved.
             </p>
             <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 md:mt-0 flex items-center">
               Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> by the SpeakWise Team
             </p>
           </div>
         </div>
       </div>
     </footer>
   );
};

export default Footer;

