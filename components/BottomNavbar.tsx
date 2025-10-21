import React from 'react';
import { HomeIcon, ListBulletIcon, UsersIcon, ChartBarIcon } from './icons';

export type View = 'dashboard' | 'sales' | 'partners' | 'analytics';

interface BottomNavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-all duration-200 group relative ${isActive ? 'text-primary dark:text-primary-dark' : 'text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary-dark'}`}
    aria-current={isActive ? 'page' : undefined}
  >
    <div className={`absolute top-0 h-1 w-8 bg-primary dark:bg-primary-dark rounded-b-full transition-all duration-300 ${isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}/>
    <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-primary/10 dark:bg-primary-dark-light' : ''}`}>
        {icon}
    </div>
    <span className="text-xs mt-1 font-medium">{label}</span>
  </button>
);

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/70 dark:bg-dark-card/70 backdrop-blur-lg border-t border-border dark:border-dark-border shadow-[0_-1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_-1px_3px_rgba(0,0,0,0.2)] z-50 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm md:rounded-2xl md:border md:shadow-lg">
      <div className="max-w-3xl mx-auto flex justify-around">
        <NavItem
          label="Dashboard"
          icon={<HomeIcon className="w-6 h-6" />}
          isActive={currentView === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />
        <NavItem
          label="Sales"
          icon={<ListBulletIcon className="w-6 h-6" />}
          isActive={currentView === 'sales'}
          onClick={() => onNavigate('sales')}
        />
        <NavItem
          label="Analytics"
          icon={<ChartBarIcon className="w-6 h-6" />}
          isActive={currentView === 'analytics'}
          onClick={() => onNavigate('analytics')}
        />
        <NavItem
          label="Partners"
          icon={<UsersIcon className="w-6 h-6" />}
          isActive={currentView === 'partners'}
          onClick={() => onNavigate('partners')}
        />
      </div>
    </nav>
  );
};