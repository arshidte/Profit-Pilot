
export interface Partner {
  id: string;
  name: string;
  percentage: number;
}

export interface Sale {
  id: string;
  name: string;
  description?: string;
  purchasePrice: number;
  soldPrice: number;
  profit: number;
  timestamp: number;
  partnerIds: string[];
}

export interface Settlement {
  id:string;
  partnerId: string;
  amount: number;
  timestamp: number;
}
