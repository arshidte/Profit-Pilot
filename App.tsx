import React, { useState, useEffect, useCallback } from 'react';
import { type Partner, type Sale, type Settlement } from './types';
import { AddSaleForm } from './components/AddSaleForm';
import { PartnerManagement } from './components/PartnerManagement';
import { Analytics } from './components/Analytics';
import { SaleList } from './components/SaleList';
import { BottomNavbar, type View } from './components/BottomNavbar';
import { ThemeToggle } from './components/ThemeToggle';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  useEffect(() => {
    try {
      const storedSales = localStorage.getItem('sales');
      if (storedSales) {
        setSales(JSON.parse(storedSales));
      }
      const storedPartners = localStorage.getItem('partners');
      if (storedPartners) {
        setPartners(JSON.parse(storedPartners));
      }
      const storedSettlements = localStorage.getItem('settlements');
      if (storedSettlements) {
        setSettlements(JSON.parse(storedSettlements));
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('partners', JSON.stringify(partners));
  }, [partners]);
  
  useEffect(() => {
    localStorage.setItem('settlements', JSON.stringify(settlements));
  }, [settlements]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleAddSale = useCallback((newSaleData: Omit<Sale, 'id' | 'timestamp' | 'profit'>) => {
    const newSale: Sale = {
      ...newSaleData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      profit: newSaleData.soldPrice - newSaleData.purchasePrice,
    };
    setSales(prevSales => [newSale, ...prevSales]);
  }, []);

  const handleAddPartner = useCallback((newPartnerData: Omit<Partner, 'id'>) => {
    const newPartner: Partner = {
      ...newPartnerData,
      id: crypto.randomUUID(),
    };
    setPartners(prevPartners => [...prevPartners, newPartner]);
  }, []);
  
  const handleDeletePartner = useCallback((id: string) => {
    setPartners(prev => prev.filter(p => p.id !== id));
    setSettlements(prev => prev.filter(s => s.partnerId !== id));
    setSales(prev =>
      prev.map(sale => {
        // Check if partnerIds is an array and includes the partner to be deleted.
        if (Array.isArray(sale.partnerIds) && sale.partnerIds.includes(id)) {
          // If so, return a new sale object with the partner ID filtered out.
          return {
            ...sale,
            partnerIds: sale.partnerIds.filter(pid => pid !== id),
          };
        }
        // Otherwise, return the original sale object, preserving its reference.
        return sale;
      }),
    );
  }, []);

  const handleAddSettlement = useCallback((newSettlementData: Omit<Settlement, 'id' | 'timestamp'>) => {
    const newSettlement: Settlement = {
      ...newSettlementData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setSettlements(prevSettlements => [...prevSettlements, newSettlement]);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'sales':
        return <SaleList sales={sales} partners={partners} />;
      case 'analytics':
        return <Analytics sales={sales} />;
      case 'partners':
        return (
          <PartnerManagement 
            partners={partners}
            sales={sales}
            settlements={settlements}
            onAddPartner={handleAddPartner}
            onDeletePartner={handleDeletePartner}
            onAddSettlement={handleAddSettlement}
          />
        );
      case 'dashboard':
      default:
        return (
          <AddSaleForm onAddSale={handleAddSale} partners={partners} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary pb-28 font-sans">
      <header className="bg-card/80 dark:bg-dark-card/80 backdrop-blur-lg sticky top-0 z-10 border-b border-border dark:border-dark-border">
        <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-dark-text-primary">Profit Pilot</h1>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Your Simple Invoice & Profit Tracker</p>
          </div>
          <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {renderContent()}
      </main>

      <BottomNavbar currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
};

export default App;