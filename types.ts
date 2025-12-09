export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string
  type: TransactionType;
  currency: CurrencyCode; // Currency of the original transaction
}

export enum AppView {
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
  ABOUT = 'about'
}

export type TransactionFilter = 'all' | 'income' | 'expense';

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface DailyData {
  date: string;
  amount: number;
}

export type CurrencyCode = 'IDR' | 'USD' | 'EUR';
export type LanguageCode = 'id' | 'en';
export type ThemeMode = 'dark' | 'light';

export interface AppSettings {
  currency: CurrencyCode;
  language: LanguageCode;
  theme: ThemeMode;
  username: string;
  avatar: string | null; // Base64 string for the image
}

// Add global type definition for View Transition API
declare global {
  interface Document {
    startViewTransition(callback: () => void | Promise<void>): {
      ready: Promise<void>;
      finished: Promise<void>;
      updateCallbackDone: Promise<void>;
    };
  }
}