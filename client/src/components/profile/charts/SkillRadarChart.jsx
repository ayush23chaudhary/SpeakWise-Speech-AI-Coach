// client/src/components/profile/charts/SkillRadarChart.jsx
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const SkillRadarChart = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No skill data available yet
      </div>
    );
  }

  // Map the available metrics and handle missing ones
  const skillMapping = {
    pronunciation: data.pronunciation || data.clarity || 0, // Fallback to clarity
    fluency: data.fluency || 0,
    clarity: data.clarity || 0,
    confidence: data.confidence || 0,
    pace: data.pace || 0,
    vocabulary: data.vocabulary || data.fluency || 0, // Fallback to fluency
    grammar: data.grammar || data.fluency || 0 // Fallback to fluency
  };

  const chartData = Object.entries(skillMapping).map(([skill, value]) => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    value: Math.round(value) || 0,
    fullMark: 100
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#d1d5db" className="dark:stroke-gray-700" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
        <Radar
          name="Your Skills"
          dataKey="value"
          stroke="#2563eb"
          fill="#3b82f6"
          fillOpacity={0.5}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default SkillRadarChart;
