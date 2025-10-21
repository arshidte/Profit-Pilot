import React, { useMemo } from 'react';
import { type Sale } from '../types';
import { Card } from './Card';
import { ChartBarIcon } from './icons';
import { SalesHistoryChart } from './SalesHistoryChart';

interface AnalyticsProps {
  sales: Sale[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const AnalyticsCard: React.FC<{ title: string; value: string; subValue: string; }> = ({ title, value, subValue }) => (
  <div className="bg-slate-50 dark:bg-dark-background p-4 rounded-xl border border-border dark:border-dark-border flex-1 min-w-[120px]">
    <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">{title}</p>
    <p className="text-2xl font-bold text-primary dark:text-primary-dark my-1">{value}</p>
    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{subValue}</p>
  </div>
);


export const Analytics: React.FC<AnalyticsProps> = ({ sales }) => {
  const { dailyStats, monthlyStats } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const dailySales = sales.filter(sale => sale.timestamp >= todayStart);
    const monthlySales = sales.filter(sale => sale.timestamp >= monthStart);
    
    const calculateStats = (filteredSales: Sale[]) => {
      return filteredSales.reduce((acc, sale) => {
        acc.profit += sale.profit;
        acc.revenue += sale.soldPrice;
        return acc;
      }, { profit: 0, revenue: 0 });
    };

    return {
      dailyStats: calculateStats(dailySales),
      monthlyStats: calculateStats(monthlySales)
    };
  }, [sales]);

  return (
    <Card title="Analytics" icon={<ChartBarIcon className="w-6 h-6" />}>
      <div className="grid grid-cols-2 gap-4">
        <AnalyticsCard title="Today's Profit" value={formatCurrency(dailyStats.profit)} subValue={`${formatCurrency(dailyStats.revenue)} Revenue`} />
        <AnalyticsCard title="Month's Profit" value={formatCurrency(monthlyStats.profit)} subValue={`${formatCurrency(monthlyStats.revenue)} Revenue`}/>
      </div>
      <SalesHistoryChart sales={sales} />
    </Card>
  );
};