import React from 'react';
import { AlertTriangle, AlertCircle, Clock, TrendingDown } from 'lucide-react';
import Card from '../common/Card';

const TrustBreakdownTimeline = ({ criticalMoments, duration, className = '' }) => {
  if (!criticalMoments || criticalMoments.length === 0) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ✅ No Critical Trust Breaks Detected
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Evaluator confidence maintained throughout the response.
          </p>
        </div>
      </Card>
    );
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <TrendingDown className="w-4 h-4 text-orange-600" />;
      case 'moderate':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-600';
      case 'moderate':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Trust Breakdown Timeline
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Critical moments where evaluator perception weakened
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{duration ? `${duration.toFixed(1)}s` : 'N/A'}</span>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="relative mb-6">
        {/* Base timeline bar */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full relative overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-20"
            style={{ width: '100%' }}
          />
        </div>

        {/* Critical moment markers */}
        <div className="relative h-32 mt-2">
          {criticalMoments.map((moment, index) => {
            const position = duration ? (moment.timestamp / duration) * 100 : 0;
            
            return (
              <div
                key={index}
                className="absolute group cursor-pointer"
                style={{ 
                  left: `${Math.min(95, Math.max(2, position))}%`, 
                  top: `${(index % 3) * 36}px` 
                }}
              >
                {/* Marker line */}
                <div 
                  className={`absolute bottom-0 left-1/2 w-0.5 h-8 transform -translate-x-1/2 ${
                    moment.severity === 'critical' ? 'bg-red-600' :
                    moment.severity === 'high' ? 'bg-orange-600' : 'bg-yellow-600'
                  }`}
                />
                
                {/* Marker dot */}
                <div 
                  className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 transform -translate-x-1/2 group-hover:scale-125 transition-transform ${
                    getSeverityColor(moment.severity)
                  }`}
                  title={moment.description}
                />

                {/* Hover tooltip */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-4 py-3 whitespace-nowrap shadow-xl min-w-[200px]">
                    <div className="flex items-center space-x-2 mb-2">
                      {getSeverityIcon(moment.severity)}
                      <span className="font-semibold">{moment.label}</span>
                    </div>
                    <div className="text-gray-300 mb-2">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {moment.timestamp.toFixed(1)}s
                    </div>
                    <div className="text-gray-400 max-w-xs whitespace-normal">
                      {moment.description}
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                    <div className="border-8 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Moments List */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Breakdown Details ({criticalMoments.length} moments)
        </h4>
        {criticalMoments.map((moment, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border-l-4 ${
              moment.severity === 'critical' 
                ? 'bg-red-50 dark:bg-red-900/10 border-red-600'
                : moment.severity === 'high'
                ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-600'
                : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-600'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getSeverityIcon(moment.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {moment.label}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {moment.timestamp.toFixed(1)}s
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {moment.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend - Updated Labels */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-gray-700 dark:text-gray-300">Confidence Break</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-600" />
            <span className="text-gray-700 dark:text-gray-300">Listener Trust Drop</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-600" />
            <span className="text-gray-700 dark:text-gray-300">Engagement Loss</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TrustBreakdownTimeline;
