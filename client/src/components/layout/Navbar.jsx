import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, LogOut, Sun, Moon, User, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  // Get first name from full name
  const getFirstName = (fullName) => {
    return fullName?.split(' ')[0] || 'User';
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#1E2A5A] to-[#2A3A7A] rounded-lg flex items-center justify-center shadow-lg">
              <Mic className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SpeakWise</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI Speech Coach</p>
            </div>
          </button>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#F8FAFF]0 to-[#17A293] hover:from-[#1FB6A6] hover:to-[#17A293] dark:from-[#1FB6A6] dark:to-[#17A293] dark:hover:from-[#17A293] dark:hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 border border-primary-400 dark:border-[#1FB6A6] group"
              >
                {/* Profile Picture or Initials with Ring Effect */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center overflow-hidden ring-2 ring-white/50 shadow-inner">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-700 text-sm font-bold">
                        {getInitials(user?.name)}
                      </span>
                    )}
                  </div>
                  {/* Pulsing indicator */}
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1FB6A6] animate-pulse"></div>
                </div>
                
                {/* First Name */}
                <span className="text-sm font-semibold text-white drop-shadow-sm">
                  {getFirstName(user?.name)}
                </span>
                
                <ChevronDown className={`w-4 h-4 text-white/90 transition-transform duration-200 group-hover:text-white ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 overflow-hidden">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#F8FAFF] to-[#F8FAFF] dark:from-primary-900/20 dark:to-blue-900/20">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#F8FAFF]0 to-[#17A293] hover:from-[#1FB6A6] hover:to-[#17A293] dark:from-[#1FB6A6] dark:to-[#17A293] dark:hover:from-[#17A293] dark:hover:to-primary-800 transition-all duration-200 group border-b border-primary-400 dark:border-[#1FB6A6]"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block font-semibold">My Profile</span>
                      <span className="text-xs opacity-90">View achievements & goals</span>
                    </div>
                    <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
