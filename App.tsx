import React, { useState, useEffect, useCallback } from 'react';
import { type Partner, type Sale, type Settlement, type User } from './types';
import * as api from './api';
import { AddSaleForm } from './components/AddSaleForm';
import { PartnerManagement } from './components/PartnerManagement';
import { Analytics } from './components/Analytics';
import { SaleList } from './components/SaleList';
import { BottomNavbar, type View } from './components/BottomNavbar';
import { ThemeToggle } from './components/ThemeToggle';
import { Auth } from './components/Auth';
import { ArrowRightOnRectangleIcon } from './components/icons';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          const data = await api.fetchAllData(user.id);
          setSales(data.sales);
          setPartners(data.partners);
          setSettlements(data.settlements);
        }
      } catch (error) {
        console.error("Initialization failed", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    setLoading(true);
    try {
      const data = await api.fetchAllData(user.id);
      setSales(data.sales);
      setPartners(data.partners);
      setSettlements(data.settlements);
      setCurrentView('dashboard');
    } catch (error) {
        console.error("Failed to fetch data after auth", error);
    } finally {
        setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await api.signOut();
    setCurrentUser(null);
    setSales([]);
    setPartners([]);
    setSettlements([]);
    setCurrentView('dashboard');
  };

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleAddSale = useCallback(async (newSaleData: Omit<Sale, 'id' | 'timestamp' | 'profit'>) => {
    if (!currentUser) return;
    const newSale = await api.addSale(currentUser.id, newSaleData);
    setSales(prevSales => [newSale, ...prevSales]);
  }, [currentUser]);

  const handleAddPartner = useCallback(async (newPartnerData: Omit<Partner, 'id'>) => {
    if (!currentUser) return;
    const newPartner = await api.addPartner(currentUser.id, newPartnerData);
    setPartners(prevPartners => [...prevPartners, newPartner]);
  }, [currentUser]);
  
  const handleDeletePartner = useCallback(async (id: string) => {
    if (!currentUser) return;
    await api.deletePartner(currentUser.id, id);
    
    setPartners(prev => prev.filter(p => p.id !== id));
    setSettlements(prev => prev.filter(s => s.partnerId !== id));
    setSales(prev =>
      prev.map(sale => {
        if (Array.isArray(sale.partnerIds) && sale.partnerIds.includes(id)) {
          return {
            ...sale,
            partnerIds: sale.partnerIds.filter(pid => pid !== id),
          };
        }
        return sale;
      }),
    );
  }, [currentUser]);

  const handleAddSettlement = useCallback(async (newSettlementData: Omit<Settlement, 'id' | 'timestamp'>) => {
    if (!currentUser) return;
    const newSettlement = await api.addSettlement(currentUser.id, newSettlementData);
    setSettlements(prevSettlements => [...prevSettlements, newSettlement]);
  }, [currentUser]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-primary dark:text-primary-dark animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-text-primary dark:text-dark-text-primary">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary pb-28 font-sans">
      <header className="bg-card/80 dark:bg-dark-card/80 backdrop-blur-lg sticky top-0 z-10 border-b border-border dark:border-dark-border">
        <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-dark-text-primary">Profit Pilot</h1>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Your Simple Invoice & Profit Tracker</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm font-medium hidden sm:block">Hi, {currentUser.name.split(' ')[0]}</span>
             <button
                onClick={handleSignOut}
                className="p-2 rounded-full text-text-secondary dark:text-dark-text-secondary hover:bg-slate-200/60 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:ring-offset-dark-background"
                aria-label="Sign out"
              >
               <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
          </div>
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