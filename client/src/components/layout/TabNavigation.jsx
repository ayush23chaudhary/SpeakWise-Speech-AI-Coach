import React from 'react';
import { Mic, BarChart3, TrendingUp, Target } from 'lucide-react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'studio',
      label: 'Performance Studio',
      icon: Mic,
      description: 'Record and practice your speech'
    },
    {
      id: 'analysis',
      label: 'Analysis Dashboard',
      icon: BarChart3,
      description: 'View your latest analysis results'
    },
    {
      id: 'progress',
      label: 'Progress Tracker',
      icon: TrendingUp,
      description: 'Track your improvement over time'
    },
    {
      id: 'practice',
      label: 'Practice Hub',
      icon: Target,
      description: 'Personalized exercises and challenges'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Scrollable container with fade indicators */}
        <div className="relative">
          <div className="flex justify-around sm:justify-start sm:space-x-1 overflow-x-auto scrollbar-hide scroll-smooth">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center justify-center sm:justify-start space-x-0 sm:space-x-2 lg:space-x-3 
                    px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm font-medium rounded-t-lg transition-all duration-200
                    flex-shrink-0 min-w-[60px] sm:min-w-[80px] lg:min-w-0
                    ${isActive 
                      ? 'tab-active shadow-lg' 
                      : 'tab-inactive hover:shadow-md'
                    }
                  `}
                  title={tab.label} // Tooltip for mobile
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                  
                  {/* Full text with description - Desktop only (lg+) */}
                  <div className="hidden lg:block text-left">
                    <div className={`whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {tab.label}
                    </div>
                    <div className={`text-xs whitespace-nowrap ${isActive ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {tab.description}
                    </div>
                  </div>
                  
                  {/* Compact label - Tablet only (sm to lg) */}
                  <span className={`hidden sm:block lg:hidden text-xs sm:text-sm ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'} whitespace-nowrap ml-1 sm:ml-2 max-w-[80px] sm:max-w-[100px] truncate`}>
                    {tab.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Optional: Fade indicators for scroll on mobile/tablet */}
          <div className="absolute top-0 left-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-gray-800 to-transparent pointer-events-none sm:hidden"></div>
          <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none sm:hidden"></div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
