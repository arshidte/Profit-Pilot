import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className }) => {
  return (
    <div className={`bg-card dark:bg-dark-card rounded-2xl shadow-sm border border-border dark:border-dark-border ${className}`}>
      <div className="p-4 md:p-6">
        <div className="flex items-center mb-4">
          <div className="bg-primary-light dark:bg-primary-dark-light text-primary dark:text-primary-dark-hover p-2 rounded-full">
            {icon}
          </div>
          <h2 className="ml-3 text-lg font-semibold text-text-primary dark:text-dark-text-primary">{title}</h2>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};