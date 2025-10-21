import React, { useState, useMemo, useEffect } from 'react';
import { type Sale, type Partner } from '../types';
import { Card } from './Card';
import { CurrencyDollarIcon, PlusIcon } from './icons';

interface AddSaleFormProps {
  onAddSale: (sale: Omit<Sale, 'id' | 'timestamp' | 'profit'>) => void;
  partners: Partner[];
}

export const AddSaleForm: React.FC<AddSaleFormProps> = ({ onAddSale, partners }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [soldPrice, setSoldPrice] = useState('');
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedPartnerIds(partners.map(p => p.id));
  }, [partners]);

  const profit = useMemo(() => {
    const p = parseFloat(purchasePrice);
    const s = parseFloat(soldPrice);
    if (!isNaN(p) && !isNaN(s) && s >= p) {
      return (s - p).toFixed(2);
    }
    return '0.00';
  }, [purchasePrice, soldPrice]);
  
  const handlePartnerToggle = (partnerId: string) => {
    setSelectedPartnerIds(prev =>
      prev.includes(partnerId)
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pPrice = parseFloat(purchasePrice);
    const sPrice = parseFloat(soldPrice);

    if (!name.trim()) {
      setError('Please enter a name for the sale.');
      return;
    }
    if (isNaN(pPrice) || isNaN(sPrice) || pPrice < 0 || sPrice < 0) {
      setError('Please enter valid positive numbers for prices.');
      return;
    }
    if (sPrice < pPrice) {
      setError('Sold price cannot be less than purchase price.');
      return;
    }

    onAddSale({ name, description, purchasePrice: pPrice, soldPrice: sPrice, partnerIds: selectedPartnerIds });
    setName('');
    setDescription('');
    setPurchasePrice('');
    setSoldPrice('');
    setError('');
    setSelectedPartnerIds(partners.map(p => p.id));
  };

  return (
    <Card title="Add New Sale" icon={<CurrencyDollarIcon className="w-6 h-6" />}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="saleName" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Sale Name</label>
          <input
            type="text"
            id="saleName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., iPhone 15 Pro"
            className="mt-1 block w-full px-3 py-2 bg-input dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm dark:text-dark-text-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="saleDescription" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Description (Optional)</label>
          <textarea
            id="saleDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., 256GB model, sold to Jane"
            rows={2}
            className="mt-1 block w-full px-3 py-2 bg-input dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm dark:text-dark-text-primary"
          />
        </div>
        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Purchase Price</label>
          <input
            type="number"
            id="purchasePrice"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="e.g., 50.00"
            className="mt-1 block w-full px-3 py-2 bg-input dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm dark:text-dark-text-primary"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <label htmlFor="soldPrice" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Sold Price</label>
          <input
            type="number"
            id="soldPrice"
            value={soldPrice}
            onChange={(e) => setSoldPrice(e.target.value)}
            placeholder="e.g., 80.00"
            className="mt-1 block w-full px-3 py-2 bg-input dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm dark:text-dark-text-primary"
            min="0"
            step="0.01"
            required
          />
        </div>

        {partners.length > 0 && (
          <div className="pt-2">
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Assign Partners</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {partners.map(partner => (
                <button
                  type="button"
                  key={partner.id}
                  onClick={() => handlePartnerToggle(partner.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors border ${
                    selectedPartnerIds.includes(partner.id)
                      ? 'bg-primary-light border-primary text-primary dark:bg-primary-dark-light dark:text-primary-dark-hover dark:border-primary'
                      : 'bg-slate-100 border-border text-text-secondary dark:bg-dark-input dark:border-dark-border dark:text-dark-text-secondary hover:border-slate-400 dark:hover:border-slate-500'
                  }`}
                >
                  {partner.name}
                </button>
              ))}
            </div>
             <p className="mt-2 text-xs text-text-secondary dark:text-dark-text-secondary">
              {selectedPartnerIds.length} of {partners.length} partners selected.
            </p>
          </div>
        )}

        <div className="p-4 bg-primary/5 dark:bg-primary-dark-light/10 border border-primary/20 dark:border-primary-dark/20 rounded-lg text-center">
          <p className="text-sm font-medium text-primary/80 dark:text-primary-dark/80">Estimated Profit</p>
          <p className="text-3xl font-bold text-primary dark:text-primary-dark">${profit}</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          Add Sale
        </button>
      </form>
    </Card>
  );
};
