import { type Sale, type Partner, type Settlement } from './types';

const LATENCY = 300; // ms

// Helper function to get all data from localStorage
const getAllData = (): { sales: Sale[], partners: Partner[], settlements: Settlement[] } => {
  try {
    const sales = JSON.parse(localStorage.getItem('sales') || '[]') as Sale[];
    const partners = JSON.parse(localStorage.getItem('partners') || '[]') as Partner[];
    const settlements = JSON.parse(localStorage.getItem('settlements') || '[]') as Settlement[];
    return { sales, partners, settlements };
  } catch (error) {
    console.error("Failed to parse data from localStorage", error);
    return { sales: [], partners: [], settlements: [] };
  }
};

// --- Public API ---

export const fetchAllData = (): Promise<{ sales: Sale[], partners: Partner[], settlements: Settlement[] }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getAllData());
    }, LATENCY);
  });
};

export const addSale = (saleData: Omit<Sale, 'id' | 'timestamp' | 'profit'>): Promise<Sale> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const { sales } = getAllData();
      const newSale: Sale = {
        ...saleData,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        profit: saleData.soldPrice - saleData.purchasePrice,
      };
      const updatedSales = [newSale, ...sales];
      localStorage.setItem('sales', JSON.stringify(updatedSales));
      resolve(newSale);
    }, LATENCY);
  });
};

export const addPartner = (partnerData: Omit<Partner, 'id'>): Promise<Partner> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const { partners } = getAllData();
      const newPartner: Partner = {
        ...partnerData,
        id: crypto.randomUUID(),
      };
      const updatedPartners = [...partners, newPartner];
      localStorage.setItem('partners', JSON.stringify(updatedPartners));
      resolve(newPartner);
    }, LATENCY);
  });
};

export const deletePartner = (id: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let { sales, partners, settlements } = getAllData();

            // Filter out the partner
            partners = partners.filter(p => p.id !== id);
            
            // Filter out related settlements
            settlements = settlements.filter(s => s.partnerId !== id);

            // Remove partner from sales
            sales = sales.map(sale => {
                if (Array.isArray(sale.partnerIds) && sale.partnerIds.includes(id)) {
                    return {
                        ...sale,
                        partnerIds: sale.partnerIds.filter(pid => pid !== id),
                    };
                }
                return sale;
            });

            localStorage.setItem('partners', JSON.stringify(partners));
            localStorage.setItem('settlements', JSON.stringify(settlements));
            localStorage.setItem('sales', JSON.stringify(sales));
            
            resolve();
        }, LATENCY);
    });
};

export const addSettlement = (settlementData: Omit<Settlement, 'id' | 'timestamp'>): Promise<Settlement> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const { settlements } = getAllData();
            const newSettlement: Settlement = {
                ...settlementData,
                id: crypto.randomUUID(),
                timestamp: Date.now(),
            };
            const updatedSettlements = [...settlements, newSettlement];
            localStorage.setItem('settlements', JSON.stringify(updatedSettlements));
            resolve(newSettlement);
        }, LATENCY);
    });
};
