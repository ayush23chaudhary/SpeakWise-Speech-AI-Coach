// client/src/components/profile/charts/PracticeHeatmap.jsx
import React from 'react';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';

const PracticeHeatmap = ({ data }) => {
  if (!data) return null;

  // Generate last 12 weeks
  const weeks = 12;
  const today = new Date();
  const startDate = subDays(today, weeks * 7);
  
  // Generate grid data
  const weekData = [];
  for (let week = 0; week < weeks; week++) {
    const weekStart = addDays(startDate, week * 7);
    const days = [];
    
    for (let day = 0; day < 7; day++) {
      const currentDate = addDays(weekStart, day);
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const count = data[dateKey] || 0;
      
      days.push({
        date: currentDate,
        count,
        label: format(currentDate, 'MMM d')
      });
    }
    
    weekData.push(days);
  }

  const getColorClass = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800';
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-700/70 border border-emerald-500 dark:border-emerald-600';
    if (count >= 3) return 'bg-emerald-600 dark:bg-emerald-600 border border-emerald-700 dark:border-emerald-500';
    return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="flex items-start space-x-2">
        {/* Day labels */}
        <div className="flex flex-col space-y-1 text-xs text-gray-500 dark:text-gray-400 pt-5">
          {dayLabels.map((label, index) => (
            <div key={index} className="h-3 flex items-center">
              {index % 2 === 1 && label}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {weekData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${getColorClass(day.count)} 
                    hover:ring-2 hover:ring-primary-500 cursor-pointer transition-all duration-150`}
                  title={`${day.label}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700/70 border border-emerald-500 dark:border-emerald-600"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-600 border border-emerald-700 dark:border-emerald-500"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default PracticeHeatmap;
