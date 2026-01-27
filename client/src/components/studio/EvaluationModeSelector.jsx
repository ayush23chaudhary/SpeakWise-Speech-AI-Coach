import React from 'react';
import { Briefcase, TrendingUp, GraduationCap } from 'lucide-react';
import Card from '../common/Card';
import { EVALUATION_MODES } from '../../utils/constants';

const EvaluationModeSelector = ({ selectedMode, onModeChange, className = '' }) => {
  const modes = [
    {
      ...EVALUATION_MODES.INTERVIEW,
      Icon: Briefcase,
      color: 'blue'
    },
    {
      ...EVALUATION_MODES.PRESENTATION,
      Icon: TrendingUp,
      color: 'purple'
    },
    {
      ...EVALUATION_MODES.VIVA,
      Icon: GraduationCap,
      color: 'green'
    }
  ];

  return (
    <Card className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Select Evaluation Context
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Different evaluators judge differently. Choose the scenario that matches your goal.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((mode) => {
          const Icon = mode.Icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left group hover:scale-105 ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  isSelected 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {mode.label}
                  </h4>
                  {isSelected && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-600 text-white">
                      Selected
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                {mode.description}
              </p>
              
              <div className="flex items-center text-xs font-medium">
                <span className={`${
                  isSelected 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {mode.riskFocus}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Benchmarks Info */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong className="text-gray-900 dark:text-white">Evaluator Benchmark:</strong>{' '}
          {selectedMode === 'interview' && EVALUATION_MODES.INTERVIEW.benchmarks.message}
          {selectedMode === 'presentation' && EVALUATION_MODES.PRESENTATION.benchmarks.message}
          {selectedMode === 'viva' && EVALUATION_MODES.VIVA.benchmarks.message}
        </p>
      </div>
    </Card>
  );
};

export default EvaluationModeSelector;
