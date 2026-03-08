'use client';

import React from 'react';
import AreaChartCard from './area-chart-1';
import { Video, Eye, Star } from '@phosphor-icons/react';

const now = new Date();
const generateDate = (offsetDays: number): Date => {
  const date = new Date(now);
  date.setDate(now.getDate() - offsetDays);
  return date;
};

const UpTrendIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }> = ({ baseColor, strokeColor, className }) => (
  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${className}`} style={{ backgroundColor: baseColor }}>
    <svg className="w-4 h-4" style={{ color: strokeColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  </div>
);

const DownTrendIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }> = ({ baseColor, strokeColor, className }) => (
  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${className}`} style={{ backgroundColor: baseColor }}>
    <svg className="w-4 h-4" style={{ color: strokeColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  </div>
);

const CourseEngagementChart: React.FC = () => {
  const chartData = [
    {
      key: 'Video Views',
      data: [
        { key: generateDate(13), data: 2850 }, { key: generateDate(12), data: 3120 },
        { key: generateDate(11), data: 3380 }, { key: generateDate(10), data: 3650 },
        { key: generateDate(9), data: 3920 }, { key: generateDate(8), data: 4180 },
        { key: generateDate(7), data: 4450 }, { key: generateDate(6), data: 4280 },
        { key: generateDate(5), data: 4620 }, { key: generateDate(4), data: 4880 },
        { key: generateDate(3), data: 5150 }, { key: generateDate(2), data: 5380 },
        { key: generateDate(1), data: 5620 }, { key: generateDate(0), data: 5850 },
      ]
    },
    {
      key: 'Interactions',
      data: [
        { key: generateDate(13), data: 1650 }, { key: generateDate(12), data: 1820 },
        { key: generateDate(11), data: 1980 }, { key: generateDate(10), data: 2150 },
        { key: generateDate(9), data: 2320 }, { key: generateDate(8), data: 2480 },
        { key: generateDate(7), data: 2650 }, { key: generateDate(6), data: 2540 },
        { key: generateDate(5), data: 2780 }, { key: generateDate(4), data: 2950 },
        { key: generateDate(3), data: 3120 }, { key: generateDate(2), data: 3280 },
        { key: generateDate(1), data: 3450 }, { key: generateDate(0), data: 3620 },
      ]
    },
    {
      key: 'Comments',
      data: [
        { key: generateDate(13), data: 720 }, { key: generateDate(12), data: 810 },
        { key: generateDate(11), data: 920 }, { key: generateDate(10), data: 1015 },
        { key: generateDate(9), data: 1130 }, { key: generateDate(8), data: 1240 },
        { key: generateDate(7), data: 1350 }, { key: generateDate(6), data: 1280 },
        { key: generateDate(5), data: 1425 }, { key: generateDate(4), data: 1530 },
        { key: generateDate(3), data: 1640 }, { key: generateDate(2), data: 1750 },
        { key: generateDate(1), data: 1860 }, { key: generateDate(0), data: 1975 },
      ]
    },
  ];

  const metrics = [
    {
      id: 'total-views',
      Icon: Eye,
      label: 'Total Views',
      tooltip: 'Total course views',
      value: '124.5K',
      TrendIcon: UpTrendIcon,
      trendBaseColor: 'rgba(59, 130, 246, 0.1)',
      trendStrokeColor: '#3b82f6',
      delay: 0,
    },
    {
      id: 'engagement-rate',
      Icon: Video,
      label: 'Engagement Rate',
      tooltip: 'Student engagement rate',
      value: '87%',
      TrendIcon: UpTrendIcon,
      trendBaseColor: 'rgba(59, 130, 246, 0.1)',
      trendStrokeColor: '#3b82f6',
      delay: 0.05,
    },
    {
      id: 'avg-rating',
      Icon: Star,
      label: 'Avg. Rating',
      tooltip: 'Average course rating',
      value: '4.8',
      TrendIcon: UpTrendIcon,
      trendBaseColor: 'rgba(59, 130, 246, 0.1)',
      trendStrokeColor: '#3b82f6',
      delay: 0.1,
    },
  ];

  return (
    <AreaChartCard
      title="Course Engagement"
      legendItems={[
        { name: 'Video Views', color: '#06b6d4' },
        { name: 'Interactions', color: '#0ea5e9' },
        { name: 'Comments', color: '#7dd3fc' },
      ]}
      chartData={chartData}
      metrics={metrics}
      colorScheme={['#06b6d4', '#7dd3fc', '#0ea5e9']}
    />
  );
};

export default CourseEngagementChart;
