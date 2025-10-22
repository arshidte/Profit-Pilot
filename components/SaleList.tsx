import React, { useState, useMemo } from 'react';
import { type Sale, type Partner } from '../types';
import { ArrowDownTrayIcon } from './icons';

interface SaleListProps {
  sales: Sale[];
  partners: Partner[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

type SortOption = 'date-desc' | 'date-asc' | 'profit-desc' | 'profit-asc' | 'sold-desc' | 'sold-asc';

export const SaleList: React.FC<SaleListProps> = ({ sales, partners }) => {
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredAndSortedSales = useMemo(() => {
    let processedSales = [...sales];

    // Filter by date range
    if (startDate) {
      const startTimestamp = new Date(startDate).setHours(0, 0, 0, 0);
      processedSales = processedSales.filter(sale => sale.timestamp >= startTimestamp);
    }
    if (endDate) {
      const endTimestamp = new Date(endDate).setHours(23, 59, 59, 999);
      processedSales = processedSales.filter(sale => sale.timestamp <= endTimestamp);
    }

    // Sort the filtered sales
    switch (sortOption) {
      case 'date-asc':
        processedSales.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'profit-desc':
        processedSales.sort((a, b) => b.profit - a.profit);
        break;
      case 'profit-asc':
        processedSales.sort((a, b) => a.profit - b.profit);
        break;
      case 'sold-desc':
        processedSales.sort((a, b) => b.soldPrice - a.soldPrice);
        break;
      case 'sold-asc':
        processedSales.sort((a, b) => a.soldPrice - b.soldPrice);
        break;
      case 'date-desc':
      default:
        processedSales.sort((a, b) => b.timestamp - a.timestamp);
        break;
    }

    return processedSales;
  }, [sales, sortOption, startDate, endDate]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSortOption('date-desc');
  };

  const exportToCSV = () => {
    if (filteredAndSortedSales.length === 0) {
      alert("No data to export.");
      return;
    }

    const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;

    const headers = ['ID', 'Date', 'Name', 'Description', 'Purchase Price', 'Sold Price', 'Profit', ...partners.map(p => `${p.name} (${p.percentage}%) Cut`)];
    
    const rows = filteredAndSortedSales.map(sale => {
      const partnerCuts = partners.map(partner => 
        (sale.partnerIds?.includes(partner.id))
          ? ((sale.profit * partner.percentage) / 100).toFixed(2)
          : '0.00'
      );
      return [
        sale.id,
        new Date(sale.timestamp).toLocaleString(),
        escapeCSV(sale.name),
        escapeCSV(sale.description || ''),
        sale.purchasePrice.toFixed(2),
        sale.soldPrice.toFixed(2),
        sale.profit.toFixed(2),
        ...partnerCuts
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="bg-card dark:bg-dark-card rounded-2xl shadow-sm border border-border dark:border-dark-border">
      <div className="p-4 md:p-6">
        <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Sales History</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-dark-background rounded-xl border border-border dark:border-dark-border">
            <div className="sm:col-span-2">
                <label htmlFor="sort-sales" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Sort by</label>
                <select 
                    id="sort-sales" 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="mt-1 block w-full px-3 py-2 bg-card dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm text-text-primary dark:text-dark-text-primary"
                >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="profit-desc">Highest Profit</option>
                    <option value="profit-asc">Lowest Profit</option>
                    <option value="sold-desc">Highest Sale Price</option>
                    <option value="sold-asc">Lowest Sale Price</option>
                </select>
            </div>
            <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Start Date</label>
                <input 
                    type="date" 
                    id="start-date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 bg-card dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm text-text-primary dark:text-dark-text-primary"
                />
            </div>
            <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">End Date</label>
                <input 
                    type="date" 
                    id="end-date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 bg-card dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm text-text-primary dark:text-dark-text-primary"
                />
            </div>
            <div className="sm:col-span-2 flex items-end gap-2">
                <button 
                    onClick={handleClearFilters}
                    className="w-full h-[42px] px-4 py-2 border border-border dark:border-dark-border rounded-lg shadow-sm text-sm font-medium text-text-secondary dark:text-dark-text-secondary bg-card dark:bg-dark-card hover:bg-slate-100 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                    Clear Filters
                </button>
                <button 
                    onClick={exportToCSV}
                    className="w-full h-[42px] px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowDownTrayIcon className="w-5 h-5"/>
                    Export CSV
                </button>
            </div>
        </div>

        {filteredAndSortedSales.length === 0 ? (
          <div className="text-center py-10">
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                {sales.length === 0 ? "No sales recorded yet. Add one on the dashboard!" : "No sales match the current filters."}
              </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedSales.map(sale => {
              const assignedPartners = partners.filter(p => sale.partnerIds?.includes(p.id));
              return (
              <div key={sale.id} className="p-4 border border-border dark:border-dark-border rounded-xl bg-card dark:bg-dark-input hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary dark:text-dark-text-primary">{sale.name}</p>
                    {sale.description && (
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">{sale.description}</p>
                    )}
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">{new Date(sale.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-secondary-dark dark:text-secondary-dark-dark bg-secondary-light dark:bg-secondary-dark-light px-3 py-1 rounded-full">
                      {formatCurrency(sale.profit)}
                    </p>
                     <p className="text-sm text-text-primary dark:text-dark-text-primary mt-1">
                        {formatCurrency(sale.soldPrice)}
                    </p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                      Cost: {formatCurrency(sale.purchasePrice)}
                    </p>
                  </div>
                </div>
                {assignedPartners.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border dark:border-dark-border">
                    <h4 className="text-xs font-semibold text-text-primary dark:text-dark-text-primary mb-1 uppercase tracking-wider">Partner Cuts</h4>
                    <ul className="text-xs space-y-1">
                      {assignedPartners.map(partner => (
                        <li key={partner.id} className="flex justify-between">
                          <span className="text-text-secondary dark:text-dark-text-secondary">{partner.name} ({partner.percentage}%):</span>
                          <span className="font-medium text-text-primary dark:text-dark-text-primary">
                            {formatCurrency((sale.profit * partner.percentage) / 100)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};