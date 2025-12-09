import { Transaction, TransactionType, AppSettings } from '../types';

const STORAGE_KEY = 'glassfinance_data_id';
const SETTINGS_KEY = 'glassfinance_settings';

// Mock data removed for production deployment
const MOCK_DATA: Transaction[] = [];

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'IDR',
  language: 'id',
  theme: 'dark',
  username: 'User',
  avatar: null
};

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // Return empty array for new users - no mock data
    return [];
  }
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    // Data Sanitization: Ensure all required fields exist to prevent UI crashes
    return parsed.map((t: any) => ({
      id: t.id || crypto.randomUUID(),
      amount: Number(t.amount) || 0,
      description: t.description || 'Tanpa Keterangan',
      category: t.category || 'Lainnya',
      date: t.date || new Date().toISOString(),
      type: t.type === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE,
      currency: t.currency || 'IDR' // Default to IDR for backward compatibility
    }));
  } catch (e) {
    console.error("Failed to parse transactions", e);
    return [];
  }
};

export const saveTransaction = (transaction: Transaction): Transaction[] => {
  const current = getTransactions();
  const updated = [transaction, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// Override all transactions (used for currency conversion)
export const overrideTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const deleteTransaction = (id: string): Transaction[] => {
  const current = getTransactions();
  const updated = current.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const clearAllTransactions = (): void => {
  // Store empty array explicitly to prevent mock data from reloading
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) return DEFAULT_SETTINGS;
  try {
    // Merge with DEFAULT_SETTINGS to ensure new fields (like username/avatar) exist for old data
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};