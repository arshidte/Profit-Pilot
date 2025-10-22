import React, { useState } from 'react';
import { type User } from '../types';
import * as api from '../api';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

type AuthView = 'signin' | 'signup';

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<AuthView>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'signup') {
        if (!name.trim()) throw new Error("Name is required.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        const user = await api.signUp({ name, email, password });
        onAuthSuccess(user);
      } else {
        const user = await api.signIn({ email, password });
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const toggleView = (newView: AuthView) => {
    setView(newView);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary dark:text-dark-text-primary">Profit Pilot</h1>
            <p className="text-md text-text-secondary dark:text-dark-text-secondary mt-2">Your Simple Invoice & Profit Tracker</p>
        </div>
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-lg border border-border dark:border-dark-border p-8">
            <div className="flex border-b border-border dark:border-dark-border mb-6">
                <button 
                    onClick={() => toggleView('signin')}
                    className={`w-1/2 pb-3 text-sm font-bold transition-colors ${view === 'signin' ? 'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark' : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'}`}
                >
                    Sign In
                </button>
                <button 
                    onClick={() => toggleView('signup')}
                    className={`w-1/2 pb-3 text-sm font-bold transition-colors ${view === 'signup' ? 'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark' : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'}`}
                >
                    Sign Up
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1 block w-full px-3 py-2 bg-input dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm text-text-primary dark:text-dark-text-primary"
                  required
                />
              </div>
            )}
             <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 block w-full px-3 py-2 bg-input dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm text-text-primary dark:text-dark-text-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 block w-full px-3 py-2 bg-input dark:bg-dark-input border border-border dark:border-dark-border rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm text-text-primary dark:text-dark-text-primary"
                  required
                />
              </div>
               {error && <p className="text-sm text-red-500 text-center">{error}</p>}
               <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {loading ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                    </>
                ) : (
                    view === 'signin' ? 'Sign In' : 'Create Account'
                )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};