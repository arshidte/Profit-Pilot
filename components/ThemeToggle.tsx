import React from 'react';
import { SunIcon, MoonIcon } from './icons';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full text-text-secondary dark:text-dark-text-secondary hover:bg-slate-200/60 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:ring-offset-dark-background"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        <SunIcon className={`absolute top-0 left-0 transition-all duration-300 ${theme === 'light' ? 'opacity-100 transform rotate-0 scale-100' : 'opacity-0 transform -rotate-90 scale-0'}`} />
        <MoonIcon className={`absolute top-0 left-0 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 transform rotate-0 scale-100' : 'opacity-0 transform rotate-90 scale-0'}`} />
      </div>
    </button>
  );
};