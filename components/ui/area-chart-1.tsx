'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
  LinearYAxis,
  LinearYAxisTickSeries,
  AreaSeries,
  Area,
  Gradient,
  GradientStop,
  GridlineSeries,
  Gridline,
  ChartDataTypes, 
} from 'reaviz';
import { TrendUp, TrendDown, Warning, Clock, Users } from '@phosphor-icons/react';

interface ChartDataPoint {
  key: Date;
  data: number | null | undefined; 
}

interface ChartSeries {
  key: string;
  data: ChartDataPoint[];
}

const UpTrendIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }> = ({ baseColor, strokeColor, className }) => (
  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${className}`} style={{ backgroundColor: baseColor }}>
    <TrendUp className="w-4 h-4" style={{ color: strokeColor }} />
  </div>
);

const DownTrendIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }> = ({ baseColor, strokeColor, className }) => (
  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${className}`} style={{ backgroundColor: baseColor }}>
    <TrendDown className="w-4 h-4" style={{ color: strokeColor }} />
  </div>
);

const now = new Date();
const generateDate = (offsetDays: number): Date => {
  const date = new Date(now);
  date.setDate(now.getDate() - offsetDays);
  return date;
};

const validateChartData = (data: ChartSeries[]): any[] => {
  return data.map(series => ({
    ...series,
    data: series.data.map(item => ({
      ...item,
      data: (typeof item.data !== 'number' || isNaN(item.data)) ? 0 : item.data,
    })),
  }));
};

interface MetricInfo {
  id: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  tooltip: string;
  value: string;
  TrendIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }>;
  trendBaseColor: string;
  trendStrokeColor: string;
  delay: number;
}

interface AreaChartCardProps {
  title: string;
  legendItems: Array<{ name: string; color: string }>;
  chartData: ChartSeries[];
  metrics: MetricInfo[];
  colorScheme: string[];
}

const AreaChartCard: React.FC<AreaChartCardProps> = ({ title, legendItems, chartData, metrics, colorScheme }) => {
  const validatedChartData = validateChartData(chartData);

  return (
    <>
      <style jsx global>{`
        :root {
          --reaviz-tick-fill: #6B7280;
          --reaviz-gridline-stroke: rgba(156, 163, 175, 0.3);
        }
        .reaviz-chart-container .recharts-tooltip-wrapper {
          z-index: 1000;
        }
        .reaviz-chart-container .recharts-default-tooltip {
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          padding: 0.75rem !important;
          opacity: 1 !important;
        }
        .reaviz-chart-container .recharts-tooltip-item {
          color: #374151 !important;
          font-size: 0.875rem !important;
        }
        .reaviz-chart-container .recharts-tooltip-label {
          color: #1f2937 !important;
          font-weight: 600 !important;
          margin-bottom: 0.25rem !important;
        }
      `}</style>
      <div className="flex flex-col pt-4 pb-4 bg-white rounded-xl shadow-lg w-full overflow-hidden">
        <h3 className="text-xl text-left px-6 pt-4 pb-6 font-semibold text-gray-900">
          {title}
        </h3>
        <div className="flex justify-between w-full px-6 mb-4">
          {legendItems.map((item) => (
            <div key={item.name} className="flex gap-2 items-center">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-gray-500 text-xs">{item.name}</span>
            </div>
          ))}
        </div>
        <div className="reaviz-chart-container h-45">
          <AreaChart
            height={180}
            id={`area-chart-${title.replace(/\s/g, '-').toLowerCase()}`}
            data={validatedChartData}
            xAxis={
              <LinearXAxis
                type="time"
                tickSeries={
                  <LinearXAxisTickSeries
                    label={
                      <LinearXAxisTickLabel
                        format={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        fill="var(--reaviz-tick-fill)"
                      />
                    }
                    tickSize={10} 
                  />
                }
              />
            }
            yAxis={
              <LinearYAxis
                axisLine={null}
                tickSeries={<LinearYAxisTickSeries line={null} label={null} tickSize={10} />} 
              />
            }
            series={
              <AreaSeries
                type="grouped"
                interpolation="smooth"
                area={
                  <Area
                    gradient={
                      <Gradient
                        stops={[
                          <GradientStop key={1} stopOpacity={0} />,
                          <GradientStop key={2} offset="100%" stopOpacity={0.4} />,
                        ]}
                      />
                    }
                  />
                }
                colorScheme={colorScheme} 
              />
            }
            gridlines={<GridlineSeries line={<Gridline strokeColor="var(--reaviz-gridline-stroke)" />} />}
          />
        </div>
        <div className="flex flex-col px-6 pt-6 divide-y divide-gray-100">
          {metrics.map((metric) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: metric.delay }}
              className="flex w-full py-3 items-center gap-2"
            >
              <div className="flex flex-row gap-2 items-center text-sm w-3/5 text-gray-600">
                <metric.Icon className="w-4 h-4 text-gray-500" />
                <span className="truncate" title={metric.tooltip}>
                  {metric.label}
                </span>
              </div>
              <div className="flex gap-2 w-2/5 justify-end items-center">
                <span className="font-semibold text-base text-gray-900">{metric.value}</span>
                <metric.TrendIcon baseColor={metric.trendBaseColor} strokeColor={metric.trendStrokeColor} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AreaChartCard;
