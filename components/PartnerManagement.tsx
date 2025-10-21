import React, { useState, useMemo } from 'react';
import { type Partner, type Sale, type Settlement } from '../types';
import { Card } from './Card';
import { PlusIcon, TrashIcon, UsersIcon, CheckBadgeIcon } from './icons';

interface PartnerManagementProps {
  partners: Partner[];
  sales: Sale[];
  settlements: Settlement[];
  onAddPartner: (partner: Omit<Partner, 'id'>) => void;
  onDeletePartner: (id: string) => void;
  onAddSettlement: (settlement: Omit<Settlement, 'id' | 'timestamp'>) => void;
}

const PartnerAvatar: React.FC<{ name: string }> = ({ name }) => {
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    return (
        <div className="w-10 h-10 rounded-full bg-primary-light dark:bg-primary-dark-light flex items-center justify-center text-primary dark:text-primary-dark-hover font-bold text-sm">
            {initials}
        </div>
    );
};

export const PartnerManagement: React.FC<PartnerManagementProps> = ({ partners, sales, settlements, onAddPartner, onDeletePartner, onAddSettlement }) => {
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState('');
  const [error, setError] = useState('');

  const [settlementPartner, setSettlementPartner] = useState<Partner | null>(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementError, setSettlementError] = useState('');

  const totalPercentage = useMemo(() => {
    return partners.reduce((sum, p) => sum + p.percentage, 0);
  }, [partners]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const perc = parseFloat(percentage);
    if (!name.trim()) {
      setError('Partner name cannot be empty.');
      return;
    }
    if (isNaN(perc) || perc <= 0 || perc > 100) {
      setError('Percentage must be a number between 1 and 100.');
      return;
    }
    if (totalPercentage + perc > 100) {
      setError(`Adding this partner would exceed 100%. Current total: ${totalPercentage}%`);
      return;
    }

    onAddPartner({ name, percentage: perc });
    setName('');
    setPercentage('');
    setError('');
  };

  const handleDelete = (partner: Partner) => {
    if (window.confirm(`Are you sure you want to delete ${partner.name}? This action cannot be undone.`)) {
      onDeletePartner(partner.id);
    }
  };

  const partnerBalances = useMemo(() => {
    const balances = new Map<string, number>();
    partners.forEach(p => balances.set(p.id, 0));

    sales.forEach(sale => {
      if (sale.partnerIds) {
        const assignedPartners = partners.filter(p => sale.partnerIds.includes(p.id));
        if (assignedPartners.length > 0) {
          assignedPartners.forEach(partner => {
            const currentBalance = balances.get(partner.id) || 0;
            const cut = (sale.profit * partner.percentage) / 100;
            balances.set(partner.id, currentBalance + cut);
          });
        }
      }
    });

    settlements.forEach(settlement => {
      const currentBalance = balances.get(settlement.partnerId) || 0;
      balances.set(settlement.partnerId, currentBalance - settlement.amount);
    });

    return balances;
  }, [partners, sales, settlements]);
  
  const openSettleModal = (partner: Partner) => {
    const owed = partnerBalances.get(partner.id) || 0;
    setSettlementPartner(partner);
    setSettlementAmount(owed > 0 ? owed.toFixed(2) : '0.00');
  };

  const closeSettleModal = () => {
    setSettlementPartner(null);
    setSettlementAmount('');
    setSettlementError('');
  };

  const handleSettle = () => {
    if (!settlementPartner) return;
    const amount = parseFloat(settlementAmount);
    const owed = partnerBalances.get(settlementPartner.id) || 0;

    if (isNaN(amount) || amount <= 0) {
      setSettlementError('Please enter a valid positive amount.');
      return;
    }
    if (amount > owed) {
      setSettlementError(`Cannot settle more than the owed amount of $${owed.toFixed(2)}.`);
      return;
    }

    onAddSettlement({
      partnerId: settlementPartner.id,
      amount: amount
    });
    closeSettleModal();
  };

  return (
    <>
    <Card title="Partner Management" icon={<UsersIcon className="w-6 h-6" />}>
      <div className="p-4 bg-slate-50 dark:bg-dark-background rounded-xl">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex-grow">
            <label htmlFor="partnerName" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Partner Name</label>
            <input
              type="text"
              id="partnerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Doe"
              className="mt-1 block w-full px-3 py-2 bg-card dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm dark:text-dark-text-primary"
            />
          </div>
          <div className="w-24">
            <label htmlFor="percentage" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Cut %</label>
            <input
              type="number"
              id="percentage"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="e.g., 20"
              className="mt-1 block w-full px-3 py-2 bg-card dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm dark:text-dark-text-primary"
              min="1"
              max="100"
            />
          </div>
          <button type="submit" className="h-[42px] px-3 text-white bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover rounded-lg shadow-sm flex items-center justify-center">
            <PlusIcon className="w-5 h-5" />
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-md font-semibold text-text-primary dark:text-dark-text-primary">Current Partners</h3>
        {partners.length === 0 ? (
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary text-center py-4">No partners added yet.</p>
        ) : (
          <ul className="divide-y divide-border dark:divide-dark-border">
            {partners.map(partner => {
              const totalOwed = partnerBalances.get(partner.id) || 0;
              return (
              <li key={partner.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <PartnerAvatar name={partner.name} />
                    <div>
                        <p className="font-medium text-text-primary dark:text-dark-text-primary">{partner.name}</p>
                        <p className="text-sm text-secondary-dark dark:text-secondary-dark-dark">{partner.percentage}% Cut</p>
                        <p className={`text-sm font-semibold ${totalOwed > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          Owed: ${totalOwed.toFixed(2)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openSettleModal(partner)}
                    className="p-2 text-green-600/80 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10 dark:text-green-500/90 dark:hover:text-green-500 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Settle with ${partner.name}`}
                    disabled={totalOwed <= 0}
                  >
                    <CheckBadgeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(partner)}
                    className="p-2 text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:text-red-500/90 dark:hover:text-red-500 rounded-full transition-colors"
                    aria-label={`Remove ${partner.name}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            )})}
          </ul>
        )}
        <div className="pt-3 border-t border-border dark:border-dark-border flex justify-between font-bold text-text-primary dark:text-dark-text-primary text-md">
          <span>Total Assigned:</span>
          <span className="text-primary dark:text-primary-dark">{totalPercentage}%</span>
        </div>
      </div>
    </Card>
    {settlementPartner && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-sm border border-border dark:border-dark-border">
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Settle with {settlementPartner.name}</h3>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
              Total amount owed: <span className="font-bold text-primary dark:text-primary-dark">${(partnerBalances.get(settlementPartner.id) || 0).toFixed(2)}</span>
            </p>
            
            <div className="mt-4">
              <label htmlFor="settlementAmount" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Settlement Amount</label>
              <input
                type="number"
                id="settlementAmount"
                value={settlementAmount}
                onChange={(e) => setSettlementAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-input dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm dark:text-dark-text-primary"
                min="0.01"
                step="0.01"
                max={(partnerBalances.get(settlementPartner.id) || 0).toFixed(2)}
              />
            </div>

            {settlementError && <p className="mt-2 text-sm text-red-600">{settlementError}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeSettleModal}
                className="w-full px-4 py-2 border border-border dark:border-dark-border rounded-lg shadow-sm text-sm font-medium text-text-secondary dark:text-dark-text-secondary bg-card dark:bg-dark-card hover:bg-slate-100 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSettle}
                className="w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Settle Amount
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
