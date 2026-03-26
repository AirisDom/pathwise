'use client';

import React from 'react';
import AreaChartCard from './area-chart-1';
import { Users, Clock, TrendUp } from '@phosphor-icons/react';

const now = new Date();
const generateDate = (offsetDays: number): Date => {
  const date = new Date(now);
  date.setDate(now.getDate() - offsetDays);
  return date;
};

const UpTrendIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }> = ({ baseColor, strokeColor, className }) => (
  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${className}`} style={{ backgroundColor: baseColor }}>
    <TrendUp className="w-4 h-4" style={{ color: strokeColor }} />
  </div>
);

interface ApiDataPoint {
  date: string;
  value: number;
}

interface StudentGrowthChartProps {
  apiData?: {
    chartData: {
      newStudents: ApiDataPoint[];
      activeStudents: ApiDataPoint[];
      returningStudents: ApiDataPoint[];
    };
    metrics: {
      totalStudents: number;
      newEnrollments: number;
      completionRate: number;
    };
  };
}

const StudentGrowthChart: React.FC<StudentGrowthChartProps> = ({ apiData }) => {
  const chartData = apiData
    ? [
        {
          key: 'New Students',
          data: apiData.chartData.newStudents.map((d) => ({
            key: new Date(d.date),
            data: d.value,
          })),
        },
        {
          key: 'Active Students',
          data: apiData.chartData.activeStudents.map((d) => ({
            key: new Date(d.date),
            data: d.value,
          })),
        },
        {
          key: 'Returning Students',
          data: apiData.chartData.returningStudents.map((d) => ({
            key: new Date(d.date),
            data: d.value,
          })),
        },
      ]
    : [
        {
          key: 'New Students',
          data: [
            { key: generateDate(13), data: 95 }, { key: generateDate(12), data: 112 },
            { key: generateDate(11), data: 128 }, { key: generateDate(10), data: 145 },
            { key: generateDate(9), data: 138 }, { key: generateDate(8), data: 156 },
            { key: generateDate(7), data: 172 }, { key: generateDate(6), data: 165 },
            { key: generateDate(5), data: 188 }, { key: generateDate(4), data: 195 },
            { key: generateDate(3), data: 210 }, { key: generateDate(2), data: 198 },
            { key: generateDate(1), data: 225 }, { key: generateDate(0), data: 218 },
          ]
        },
        {
          key: 'Active Students',
          data: [
            { key: generateDate(13), data: 720 }, { key: generateDate(12), data: 765 },
            { key: generateDate(11), data: 810 }, { key: generateDate(10), data: 850 },
            { key: generateDate(9), data: 895 }, { key: generateDate(8), data: 920 },
            { key: generateDate(7), data: 975 }, { key: generateDate(6), data: 1010 },
            { key: generateDate(5), data: 1065 }, { key: generateDate(4), data: 1120 },
            { key: generateDate(3), data: 1180 }, { key: generateDate(2), data: 1225 },
            { key: generateDate(1), data: 1285 }, { key: generateDate(0), data: 1340 },
          ]
        },
        {
          key: 'Returning Students',
          data: [
            { key: generateDate(13), data: 380 }, { key: generateDate(12), data: 410 },
            { key: generateDate(11), data: 445 }, { key: generateDate(10), data: 475 },
            { key: generateDate(9), data: 495 }, { key: generateDate(8), data: 520 },
            { key: generateDate(7), data: 555 }, { key: generateDate(6), data: 580 },
            { key: generateDate(5), data: 610 }, { key: generateDate(4), data: 645 },
            { key: generateDate(3), data: 675 }, { key: generateDate(2), data: 705 },
            { key: generateDate(1), data: 740 }, { key: generateDate(0), data: 770 },
          ]
        },
      ];

  const metrics = apiData
    ? [
        {
          id: 'total-students',
          Icon: Users,
          label: 'Total Students',
          tooltip: 'Total enrolled students',
          value: apiData.metrics.totalStudents.toLocaleString(),
          TrendIcon: UpTrendIcon,
          trendBaseColor: 'rgba(34, 197, 94, 0.1)',
          trendStrokeColor: '#22c55e',
          delay: 0,
        },
        {
          id: 'new-enrollments',
          Icon: TrendUp,
          label: 'New Enrollments',
          tooltip: 'New students this month',
          value: `+${apiData.metrics.newEnrollments}`,
          TrendIcon: UpTrendIcon,
          trendBaseColor: 'rgba(34, 197, 94, 0.1)',
          trendStrokeColor: '#22c55e',
          delay: 0.05,
        },
        {
          id: 'completion-rate',
          Icon: Clock,
          label: 'Completion Rate',
          tooltip: 'Course completion rate',
          value: `${apiData.metrics.completionRate}%`,
          TrendIcon: UpTrendIcon,
          trendBaseColor: 'rgba(34, 197, 94, 0.1)',
          trendStrokeColor: '#22c55e',
          delay: 0.1,
        },
      ]
    : [
        {
          id: 'total-students',
          Icon: Users,
          label: 'Total Students',
          tooltip: 'Total enrolled students',
          value: '2,543',
          TrendIcon: UpTrendIcon,
          trendBaseColor: 'rgba(34, 197, 94, 0.1)',
          trendStrokeColor: '#22c55e',
          delay: 0,
        },
        {
          id: 'new-enrollments',
          Icon: TrendUp,
          label: 'New Enrollments',
          tooltip: 'New students this month',
          value: '+195',
          TrendIcon: UpTrendIcon,
          trendBaseColor: 'rgba(34, 197, 94, 0.1)',
          trendStrokeColor: '#22c55e',
          delay: 0.05,
        },
        {
          id: 'completion-rate',
          Icon: Clock,
          label: 'Completion Rate',
          tooltip: 'Course completion rate',
          value: '78%',
          TrendIcon: UpTrendIcon,
          trendBaseColor: 'rgba(34, 197, 94, 0.1)',
          trendStrokeColor: '#22c55e',
          delay: 0.1,
        },
      ];

  return (
    <AreaChartCard
      title="Student Growth"
      legendItems={[
        { name: 'New Students', color: '#3b82f6' },
        { name: 'Active Students', color: '#8b5cf6' },
        { name: 'Returning', color: '#a855f7' },
      ]}
      chartData={chartData}
      metrics={metrics}
      colorScheme={['#3b82f6', '#a855f7', '#8b5cf6']}
    />
  );
};

export default StudentGrowthChart;
