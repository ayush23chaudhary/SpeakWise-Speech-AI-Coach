// client/src/components/profile/charts/ProgressTimeline.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';

const ProgressTimeline = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No practice data available yet. Start practicing to see your progress!
      </div>
    );
  }

  const chartData = data.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    score: item.score,
    duration: Math.round(item.duration / 60) // Convert to minutes
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          }}
          formatter={(value, name) => {
            if (name === 'score') return [value, 'Score'];
            if (name === 'duration') return [`${value} min`, 'Duration'];
            return value;
          }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#2563eb"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorScore)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ProgressTimeline;
