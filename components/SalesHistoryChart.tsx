import React, { useState, useMemo } from 'react';
import { type Sale } from '../types';

interface SalesHistoryChartProps {
  sales: Sale[];
}

interface ChartData {
  label: string;
  monthIndex: number;
  year: number;
  profit: number;
  revenue: number;
}

export const SalesHistoryChart: React.FC<SalesHistoryChartProps> = ({ sales }) => {
  const [dataType, setDataType] = useState<'profit' | 'revenue'>('profit');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  const chartData = useMemo((): ChartData[] => {
    const data: ChartData[] = [];
    const now = new Date();
    
    // Initialize data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({
        label: date.toLocaleString('default', { month: 'short' }),
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
        profit: 0,
        revenue: 0,
      });
    }

    // Populate with sales data
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();
    const relevantSales = sales.filter(s => s.timestamp >= sixMonthsAgo);

    for (const sale of relevantSales) {
      const saleDate = new Date(sale.timestamp);
      const saleMonth = saleDate.getMonth();
      const saleYear = saleDate.getFullYear();
      
      const monthData = data.find(d => d.monthIndex === saleMonth && d.year === saleYear);
      if (monthData) {
        monthData.profit += sale.profit;
        monthData.revenue += sale.soldPrice;
      }
    }

    return data;
  }, [sales]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 1;
    const max = Math.max(...chartData.map(d => d[dataType]));
    return max > 0 ? max : 1; // Avoid division by zero and handle no data
  }, [chartData, dataType]);

  // FIX: Broaden event type to accept both MouseEvent and FocusEvent
  // to handle both onMouseOver and onFocus triggers.
  const handleMouseOver = (e: React.MouseEvent<SVGGElement> | React.FocusEvent<SVGGElement>, data: ChartData) => {
    const chartRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!chartRect) return;
    const rect = e.currentTarget.querySelector('rect')?.getBoundingClientRect();
    if(!rect) return;

    setTooltip({
      x: rect.left - chartRect.left + rect.width / 2,
      y: rect.top - chartRect.top - 10,
      label: data.label,
      value: data[dataType],
    });
  };

  const handleMouseOut = () => {
    setTooltip(null);
  };


  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold text-text-primary dark:text-dark-text-primary">Sales History (6 Months)</h3>
        <div className="flex text-sm bg-slate-100 dark:bg-dark-border p-1 rounded-lg">
          <button 
            onClick={() => setDataType('profit')}
            className={`px-3 py-1 rounded-md transition-colors text-sm font-medium ${dataType === 'profit' ? 'bg-card dark:bg-dark-card shadow-sm text-primary dark:text-primary-dark' : 'text-text-secondary dark:text-dark-text-secondary hover:bg-slate-200/50 dark:hover:bg-dark-card/50'}`}
            aria-pressed={dataType === 'profit'}
          >
            Profit
          </button>
          <button 
            onClick={() => setDataType('revenue')}
            className={`px-3 py-1 rounded-md transition-colors text-sm font-medium ${dataType === 'revenue' ? 'bg-card dark:bg-dark-card shadow-sm text-primary dark:text-primary-dark' : 'text-text-secondary dark:text-dark-text-secondary hover:bg-slate-200/50 dark:hover:bg-dark-card/50'}`}
            aria-pressed={dataType === 'revenue'}
          >
            Revenue
          </button>
        </div>
      </div>
      
      <div className="relative">
        <svg viewBox="0 0 400 200" className="w-full h-auto" aria-label={`Bar chart showing ${dataType} for the last 6 months.`} role="graphics-document">
          {chartData.map((data, index) => {
            const barHeight = data[dataType] > 0 ? (data[dataType] / maxValue) * 180 : 0;
            const x = index * (400 / chartData.length);
            const y = 200 - barHeight - 20;
            const barWidth = (400 / chartData.length) * 0.6;

            return (
              <g 
                key={data.label}
                className="cursor-pointer group"
                onMouseOver={(e) => handleMouseOver(e, data)}
                onMouseOut={handleMouseOut}
                onFocus={(e) => handleMouseOver(e, data)}
                onBlur={handleMouseOut}
                tabIndex={0}
                aria-label={`${data.label}: ${dataType} of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data[dataType])}`}
                >
                <rect
                  x={x + ( (400 / chartData.length) * 0.2 )}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="currentColor"
                  className="text-primary-light dark:text-primary-dark/20 group-hover:text-primary/80 dark:group-hover:text-primary-dark/40 group-focus:text-primary/80 dark:group-focus:text-primary-dark/40 transition-colors"
                  rx="4"
                />
                <text x={x + 200/chartData.length} y="195" textAnchor="middle" className="text-xs fill-current text-text-secondary dark:text-dark-text-secondary pointer-events-none">{data.label}</text>
              </g>
            );
          })}
        </svg>

        {tooltip && (
          <div 
            className="absolute p-2 text-xs text-white bg-slate-800/90 dark:bg-slate-200/90 dark:text-slate-900 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-full pointer-events-none transition-opacity"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <span className="font-bold">{tooltip.label}:</span> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tooltip.value)}
          </div>
        )}
        
      </div>
      <div className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2 text-center">
        Hover or focus on bars for details.
      </div>
    </div>
  );
};