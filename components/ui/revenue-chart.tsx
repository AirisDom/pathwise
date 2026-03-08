'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/line-charts-9';
import { TrendUp, TrendDown, Minus, Users, Eye } from '@phosphor-icons/react';
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';

// ── Types ──
export interface RevenueDataPoint {
  date: string;      // "Feb 12"
  dateKey: string;    // "2026-02-12"
  value: number;      // enrollments that day
}

export interface RevenueSummary {
  monthlyRevenue: number;
  todaysRevenue: number;
  dailyChange: number;   // % change today vs yesterday
  high: { value: number; date: string };
  low: { value: number; date: string };
}

export interface ViewsSummary {
  totalViews: number;
  monthlyViews: number;
  todaysViews: number;
  dailyChange: number;
  high: { value: number; date: string };
  low: { value: number; date: string };
}

interface RevenueChartProps {
  data?: RevenueDataPoint[];
  summary?: RevenueSummary;
  viewsData?: RevenueDataPoint[];
  viewsSummary?: ViewsSummary;
  loading?: boolean;
  viewsLoading?: boolean;
}

// Chart configuration
const chartConfig = {
  value: {
    label: 'Enrollments',
    color: 'rgb(37, 99, 235)', // Blue-600
  },
} satisfies ChartConfig;

const viewsChartConfig = {
  value: {
    label: 'Views',
    color: 'rgb(16, 185, 129)', // Emerald-500
  },
} satisfies ChartConfig;

// ── Default empty state (30 days of zeros) ──
function buildEmptyData(): RevenueDataPoint[] {
  const points: RevenueDataPoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    points.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateKey: d.toISOString().slice(0, 10),
      value: 0,
    });
  }
  return points;
}

const defaultSummary: RevenueSummary = {
  monthlyRevenue: 0,
  todaysRevenue: 0,
  dailyChange: 0,
  high: { value: 0, date: '' },
  low: { value: 0, date: '' },
};

// Custom Tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: RevenueDataPoint }>;
  unitLabel?: string;
}

const CustomTooltip = ({ active, payload, unitLabel = 'enrollment' }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <div className="text-sm text-gray-500 mb-1">{data.date}</div>
        <div className="flex items-center gap-2">
          <div className="text-base font-bold">
            {data.value} {unitLabel}{data.value !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data, summary, viewsData, viewsSummary, loading, viewsLoading }: RevenueChartProps) {
  const [activeTab, setActiveTab] = useState<'enrollments' | 'views'>('enrollments');

  const isViewsTab = activeTab === 'views';
  const currentLoading = isViewsTab ? (viewsLoading ?? loading) : loading;
  const rawData = isViewsTab ? viewsData : data;
  const chartData = rawData && rawData.length > 0 ? rawData : buildEmptyData();
  const config = isViewsTab ? viewsChartConfig : chartConfig;

  // Build summary values based on active tab
  const s = isViewsTab
    ? (viewsSummary
      ? {
          total: viewsSummary.monthlyViews,
          today: viewsSummary.todaysViews,
          dailyChange: viewsSummary.dailyChange,
          high: viewsSummary.high,
          low: viewsSummary.low,
        }
      : { total: 0, today: 0, dailyChange: 0, high: { value: 0, date: '' }, low: { value: 0, date: '' } })
    : (summary
      ? {
          total: summary.monthlyRevenue,
          today: summary.todaysRevenue,
          dailyChange: summary.dailyChange,
          high: summary.high,
          low: summary.low,
        }
      : { total: 0, today: 0, dailyChange: 0, high: { value: 0, date: '' }, low: { value: 0, date: '' } });

  const unitLabel = isViewsTab ? 'view' : 'enrolment';

  const hasAnyData = chartData.some((d) => d.value > 0);
  const maxY = hasAnyData ? Math.max(...chartData.map((d) => d.value)) + 1 : 5;

  // Daily change icon
  const ChangeIcon =
    s.dailyChange > 0 ? TrendUp : s.dailyChange < 0 ? TrendDown : Minus;
  const changeColor =
    s.dailyChange > 0
      ? 'text-emerald-600'
      : s.dailyChange < 0
        ? 'text-red-600'
        : 'text-gray-500';

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardContent className="flex flex-col items-stretch gap-5 p-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'enrollments'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Enrollments
          </button>
          <button
            onClick={() => setActiveTab('views')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'views'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            Views
          </button>
        </div>

        {/* Header */}
        <div className="mb-3">
          <h1 className="text-base text-gray-600 font-medium mb-1">
            {isViewsTab ? 'Views Overview' : 'Revenue Overview'}
          </h1>
          <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-3.5">
            <span className="text-4xl font-bold">
              {s.total} {unitLabel}{s.total !== 1 ? 's' : ''}
            </span>
            <div className={`flex items-center gap-1 ${changeColor}`}>
              <ChangeIcon className="w-4 h-4" />
              <span className="font-medium">
                {s.dailyChange > 0 ? '+' : ''}
                {s.dailyChange}%
              </span>
              <span className="text-gray-500 font-normal">daily change</span>
            </div>
          </div>
        </div>

        <div className="grow">
          {/* Stats Row */}
          <div className="flex items-center justify-between flex-wrap gap-2.5 text-sm mb-2.5">
            {/* Today */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Today:</span>
                <span className="font-semibold">
                  {s.today} {unitLabel}{s.today !== 1 ? 's' : ''}
                </span>
                <div className={`flex items-center gap-1 ${changeColor}`}>
                  <ChangeIcon className="w-3 h-3" />
                  <span>
                    ({s.dailyChange > 0 ? '+' : ''}
                    {s.dailyChange}%)
                  </span>
                </div>
              </div>
            </div>

            {/* High / Low / Change */}
            <div className="flex items-center gap-6 text-gray-600">
              <span>
                High:{' '}
                <span className={`font-medium ${isViewsTab ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {s.high.value}
                  {s.high.date ? ` (${s.high.date})` : ''}
                </span>
              </span>
              <span>
                Low:{' '}
                <span className="text-yellow-600 font-medium">
                  {s.low.value}
                  {s.low.date ? ` (${s.low.date})` : ''}
                </span>
              </span>
              <span>
                Change:{' '}
                <span className={`font-medium ${changeColor}`}>
                  {s.dailyChange > 0 ? '+' : ''}
                  {s.dailyChange}%
                </span>
              </span>
            </div>
          </div>

          {/* Chart */}
          {loading ? (
            <div className="flex items-center justify-center h-96 text-gray-400">
              Loading chart…
            </div>
          ) : (
            <ChartContainer
              config={config}
              className="h-96 w-full [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
            >
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 10, left: 5, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.value.color} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={config.value.color} stopOpacity={0} />
                  </linearGradient>
                  <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.8)" />
                  </filter>
                  <filter id="lineShadow" x="-100%" y="-100%" width="300%" height="300%">
                    <feDropShadow
                      dx="4"
                      dy="6"
                      stdDeviation="25"
                      floodColor={isViewsTab ? 'rgba(16, 185, 129, 0.9)' : 'rgba(59, 130, 246, 0.9)'}
                    />
                  </filter>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 8"
                  stroke="rgb(209, 213, 219)"
                  strokeOpacity={1}
                  horizontal={true}
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: config.value.color }}
                  tickMargin={15}
                  interval={4}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: config.value.color }}
                  tickMargin={15}
                  domain={[0, maxY]}
                  allowDecimals={false}
                />

                <ChartTooltip
                  content={<CustomTooltip unitLabel={unitLabel} />}
                  cursor={{
                    strokeDasharray: '3 3',
                    stroke: 'rgb(107, 114, 128)',
                    strokeOpacity: 0.5,
                  }}
                />

                {hasAnyData ? (
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={config.value.color}
                    strokeWidth={2}
                    filter="url(#lineShadow)"
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      // Show dot on high/low points
                      if (payload.value === s.high.value || payload.value === s.low.value) {
                        return (
                          <circle
                            key={`dot-${payload.dateKey}`}
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill={config.value.color}
                            stroke="white"
                            strokeWidth={2}
                            filter="url(#dotShadow)"
                          />
                        );
                      }
                      return <g key={`dot-${payload.dateKey}`} />;
                    }}
                    activeDot={{
                      r: 6,
                      fill: config.value.color,
                      stroke: 'white',
                      strokeWidth: 2,
                      filter: 'url(#dotShadow)',
                    }}
                  />
                ) : (
                  // No data — show a flat line at 0
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="rgb(209, 213, 219)"
                    strokeWidth={1}
                    strokeDasharray="6 4"
                    dot={false}
                    activeDot={false}
                  />
                )}
              </ComposedChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
