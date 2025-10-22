import { type Sale, type Partner, type Settlement, type User } from './types';

const LATENCY = 300; 

// --- User Management ---

const getUsers = (): User[] => {
    return JSON.parse(localStorage.getItem('users') || '[]');
};

const saveUsers = (users: User[]) => {
    localStorage.setItem('users', JSON.stringify(users));
};

const getCurrentUserSession = (): { userId: string } | null => {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
};

const setCurrentUserSession = (user: User | null) => {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify({ userId: user.id }));
    } else {
        localStorage.removeItem('currentUser');
    }
};

export const signUp = (userData: Omit<User, 'id' | 'passwordHash'> & {password: string}): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            if (users.some(u => u.email === userData.email)) {
                return reject(new Error("An account with this email already exists."));
            }
            // In a real app, hash the password securely. Here we simulate it.
            const passwordHash = `hashed_${userData.password}`;
            const newUser: User = {
                id: crypto.randomUUID(),
                name: userData.name,
                email: userData.email,
                passwordHash,
            };
            users.push(newUser);
            saveUsers(users);
            setCurrentUserSession(newUser);
            resolve(newUser);
        }, LATENCY);
    });
};

export const signIn = ({ email, password } : {email: string, password: string}): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const user = users.find(u => u.email === email);
            const passwordHash = `hashed_${password}`;
            if (user && user.passwordHash === passwordHash) {
                setCurrentUserSession(user);
                resolve(user);
            } else {
                reject(new Error("Invalid email or password."));
            }
        }, LATENCY);
    });
};

export const signOut = (): Promise<void> => {
    return new Promise(resolve => {
        setCurrentUserSession(null);
        resolve();
    });
};

export const getCurrentUser = (): Promise<User | null> => {
    return new Promise(resolve => {
        const session = getCurrentUserSession();
        if (!session) return resolve(null);

        const users = getUsers();
        const user = users.find(u => u.id === session.userId) || null;
        resolve(user);
    });
};


// --- Data Management (User-Scoped) ---

const getUserData = (userId: string): { sales: Sale[], partners: Partner[], settlements: Settlement[] } => {
  try {
    const sales = JSON.parse(localStorage.getItem(`sales_${userId}`) || '[]') as Sale[];
    const partners = JSON.parse(localStorage.getItem(`partners_${userId}`) || '[]') as Partner[];
    const settlements = JSON.parse(localStorage.getItem(`settlements_${userId}`) || '[]') as Settlement[];
    return { sales, partners, settlements };
  } catch (error) {
    console.error("Failed to parse data from localStorage", error);
    return { sales: [], partners: [], settlements: [] };
  }
};


export const fetchAllData = (userId: string): Promise<{ sales: Sale[], partners: Partner[], settlements: Settlement[] }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getUserData(userId));
    }, LATENCY);
  });
};

export const addSale = (userId: string, saleData: Omit<Sale, 'id' | 'timestamp' | 'profit'>): Promise<Sale> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const { sales } = getUserData(userId);
      const newSale: Sale = {
        ...saleData,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        profit: saleData.soldPrice - saleData.purchasePrice,
      };
      const updatedSales = [newSale, ...sales];
      localStorage.setItem(`sales_${userId}`, JSON.stringify(updatedSales));
      resolve(newSale);
    }, LATENCY);
  });
};

export const addPartner = (userId: string, partnerData: Omit<Partner, 'id'>): Promise<Partner> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const { partners } = getUserData(userId);
      const newPartner: Partner = {
        ...partnerData,
        id: crypto.randomUUID(),
      };
      const updatedPartners = [...partners, newPartner];
      localStorage.setItem(`partners_${userId}`, JSON.stringify(updatedPartners));
      resolve(newPartner);
    }, LATENCY);
  });
};

export const deletePartner = (userId: string, id: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let { sales, partners, settlements } = getUserData(userId);

            partners = partners.filter(p => p.id !== id);
            settlements = settlements.filter(s => s.partnerId !== id);
            sales = sales.map(sale => {
                if (Array.isArray(sale.partnerIds) && sale.partnerIds.includes(id)) {
                    return {
                        ...sale,
                        partnerIds: sale.partnerIds.filter(pid => pid !== id),
                    };
                }
                return sale;
            });

            localStorage.setItem(`partners_${userId}`, JSON.stringify(partners));
            localStorage.setItem(`settlements_${userId}`, JSON.stringify(settlements));
            localStorage.setItem(`sales_${userId}`, JSON.stringify(sales));
            
            resolve();
        }, LATENCY);
    });
};

export const addSettlement = (userId: string, settlementData: Omit<Settlement, 'id' | 'timestamp'>): Promise<Settlement> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const { settlements } = getUserData(userId);
            const newSettlement: Settlement = {
                ...settlementData,
                id: crypto.randomUUID(),
                timestamp: Date.now(),
            };
            const updatedSettlements = [...settlements, newSettlement];
            localStorage.setItem(`settlements_${userId}`, JSON.stringify(updatedSettlements));
            resolve(newSettlement);
        }, LATENCY);
    });
};