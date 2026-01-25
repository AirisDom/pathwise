'use client';

import { Badge } from '@/components/ui/badge-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  delta: number;
  lastMonth: number | string;
  positive: boolean;
  prefix?: string;
  suffix?: string;
  format?: (v: number) => string;
  lastFormat?: (v: number) => string;
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return n.toLocaleString();
  return n.toString();
}

export function StatisticsCard({ stat }: { stat: StatCardProps }) {
  return (
    <Card className="h-full shadow-lg">
      <CardHeader className="border-0 py-6">
        <CardTitle className="text-muted-foreground text-base font-medium">{stat.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 py-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-semibold text-foreground tracking-tight">
            {typeof stat.value === 'number' && stat.format
              ? stat.format(stat.value)
              : stat.prefix + (typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value) + (stat.suffix || '')}
          </span>
          <Badge variant={stat.positive ? 'success' : 'destructive'} appearance="light" size="lg">
            {stat.delta > 0 ? <ArrowUp /> : <ArrowDown />}
            {Math.abs(stat.delta)}%
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground border-t pt-4">
          Vs last month:{' '}
          <span className="font-medium text-foreground">
            {typeof stat.lastMonth === 'number' && stat.lastFormat
              ? stat.lastFormat(stat.lastMonth)
              : stat.prefix + (typeof stat.lastMonth === 'number' ? formatNumber(stat.lastMonth) : stat.lastMonth) + (stat.suffix || '')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatisticsCards({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatisticsCard key={index} stat={stat} />
      ))}
    </div>
  );
}
