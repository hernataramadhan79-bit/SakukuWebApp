import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, LanguageCode, ThemeMode, CurrencyCode } from '../types';
import { X, Check, DollarSign, AlignLeft, Grid } from 'lucide-react';
import { t } from '../utils/i18n';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (t: Omit<Transaction, 'id'>) => void;
  initialType?: TransactionType;
  language: LanguageCode;
  theme: ThemeMode;
}

const INCOME_CATEGORIES = ['Gaji', 'Investasi', 'Hadiah', 'Pengembalian Dana', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Makanan', 'Transportasi', 'Tagihan', 'Hiburan', 'Kesehatan', 'Belanja', 'Pendidikan', 'Donasi', 'Lainnya'];

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, onSubmit, initialType = TransactionType.EXPENSE, language, theme }) => {
  // Load saved data from localStorage
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('transactionFormData');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  // Save data to localStorage
  const saveData = (data: { amount: string; description: string; category: string; type: TransactionType; currency: CurrencyCode }) => {
    try {
      localStorage.setItem('transactionFormData', JSON.stringify(data));
    } catch {
      // Ignore localStorage errors
    }
  };

  const savedData = loadSavedData();

  // Format initial amount properly
  const getInitialAmount = () => {
    const savedAmount = savedData?.amount || '';
    if (savedAmount) {
      const cleanAmount = savedAmount.replace(/\./g, '');
      const numericValue = parseInt(cleanAmount, 10);
      if (!isNaN(numericValue)) {
        return numericValue.toLocaleString('id-ID');
      }
    }
    return '';
  };

  const [amount, setAmount] = useState(getInitialAmount());
  const [description, setDescription] = useState(savedData?.description || '');
  const [type, setType] = useState<TransactionType>(savedData?.type || initialType);
  const [currency, setCurrency] = useState<CurrencyCode>(savedData?.currency || 'IDR');

  // Derive currentCategories based on type
  const currentCategories = useMemo(() => {
    return type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  }, [type]);

  const [category, setCategory] = useState(() => {
    const savedType = savedData?.type || initialType;
    const categories = savedType === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return savedData?.category && categories.includes(savedData.category) ? savedData.category : categories[0];
  });

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Validation states
  const [amountError, setAmountError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Entrance/Exit Animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      // Load saved data when modal opens
      const savedData = loadSavedData();
      if (savedData) {
        // Format saved amount properly
        const savedAmount = savedData.amount || '';
        if (savedAmount) {
          const cleanAmount = savedAmount.replace(/\./g, '');
          const numericValue = parseInt(cleanAmount, 10);
          if (!isNaN(numericValue)) {
            setAmount(numericValue.toLocaleString('id-ID'));
          } else {
            setAmount(savedAmount);
          }
        } else {
          setAmount('');
        }
        setDescription(savedData.description || '');
        setType(savedData.type || initialType);
        // Category will be set by the next useEffect
      } else {
        setAmount('');
        setDescription('');
        setType(initialType);
        // Category will be set by the next useEffect
      }
    } else {
      if (isVisible) {
        // Save data when modal closes
        saveData({ amount, description, category, type, currency });
        // Trigger closing animation
        setIsClosing(true);
        const timer = setTimeout(() => {
          setIsVisible(false);
          setIsClosing(false);
        }, 400); // Matches CSS animation duration
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, initialType]);

  // Effect to update category when type changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const savedData = loadSavedData();
      if (savedData && savedData.category && currentCategories.includes(savedData.category)) {
        setCategory(savedData.category);
      } else {
        setCategory(currentCategories[0]);
      }
    }
  }, [type, currentCategories, isOpen]);

  // Auto-save form data (debounced)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        saveData({ amount, description, category, type, currency });
      }, 300); // Debounce saves
      return () => clearTimeout(timer);
    }
  }, [amount, description, category, type, isOpen]);


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user starts typing
    if (amountError) setAmountError('');

    // Get raw input value
    const inputValue = e.target.value;

    // Remove all non-digit characters
    const digitsOnly = inputValue.replace(/\D/g, '');

    if (!digitsOnly) {
      setAmount('');
      return;
    }

    // Convert to number to remove leading zeros
    const numericValue = parseInt(digitsOnly, 10);

    if (isNaN(numericValue)) {
      setAmount('');
      return;
    }

    // Format with Indonesian thousand separator (dots)
    const formatted = numericValue.toLocaleString('id-ID');

    setAmount(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setAmountError('');

    // Validation: Amount is required
    if (!amount || amount.trim() === '') {
      setAmountError(language === 'id' ? 'Jumlah harus diisi' : 'Amount is required');
      return;
    }

    // Parse amount - handle Indonesian number format (dots as thousand separators)
    let numericAmount: number;

    try {
      // Remove thousand separators (dots) for Indonesian locale
      const cleanAmount = amount.replace(/\./g, '');
      numericAmount = parseFloat(cleanAmount);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        setAmountError(language === 'id' ? 'Jumlah tidak valid' : 'Invalid amount');
        return;
      }

      // Check for reasonable limits
      if (numericAmount > 999999999) {
        setAmountError(language === 'id' ? 'Jumlah terlalu besar' : 'Amount too large');
        return;
      }
    } catch (error) {
      console.error('Error parsing amount:', error);
      setAmountError(language === 'id' ? 'Jumlah tidak valid' : 'Invalid amount');
      return;
    }

    // Validation: Category is required
    if (!category || !currentCategories.includes(category)) {
      // Reset to first category if invalid
      setCategory(currentCategories[0]);
      return;
    }

    // Set submitting state
    setIsSubmitting(true);

    try {
      // Logic: If description is empty, use the Category name as the description
      const finalDescription = description.trim() ? description.trim() : category;

      // Submit the transaction
      await onSubmit({
        amount: numericAmount,
        description: finalDescription,
        category,
        type,
        currency,
        date: new Date().toISOString()
      });

      // Clear saved data and reset form
      try {
        localStorage.removeItem('transactionFormData');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }

      // Reset form
      setAmount('');
      setDescription('');
      setCategory(currentCategories[0]);
      setAmountError('');

    } catch (error) {
      console.error('Error submitting transaction:', error);
      // Could show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  // If NOT visible and NOT open, do not render
  if (!isVisible && !isOpen) return null;

  const isLight = theme === 'light';

  // Styles for Category Buttons
  const getCategoryBtnClass = (cat: string) => {
    const isActive = category === cat;
    
    if (isActive) {
      // In light mode: Black button, White text
      // In dark mode: White button, Black text
      return isLight 
        ? 'bg-black text-white border-black shadow-md'
        : 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]';
    } else {
      // Inactive
      return isLight
        ? 'bg-black/5 text-black/60 border-transparent hover:bg-black/10'
        : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10';
    }
  };

  const animationClass = isClosing ? 'animate-liquid-scale-down' : 'animate-liquid-pop';
  const backdropClass = isClosing ? 'animate-backdrop-out' : 'animate-backdrop';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${backdropClass}`}>
      
      {/* Floating Card Container */}
      <div className={`w-full max-w-sm bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex flex-col overflow-hidden transform-gpu ring-1 ring-white/5 ${animationClass}`}>
         
         {/* Decorative Glow */}
        <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${type === TransactionType.INCOME ? 'from-green-500/10' : 'from-red-500/10'} to-transparent pointer-events-none z-0 transition-colors duration-500`} />
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-5 pb-2 relative z-10 shrink-0">
          <h2 className={`text-lg font-bold tracking-wide ${isLight ? 'text-black' : 'text-white'}`}>{t('inputTransaction', language)}</h2>
          <button 
            onClick={onClose} 
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${isLight ? 'bg-black/5 hover:bg-black/10 text-black/60' : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-5 pb-6 overflow-y-auto max-h-[70vh] custom-scrollbar relative z-10">
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              
              {/* Type Switcher - Sliding Effect */}
              <div className={`relative p-1 rounded-xl border overflow-hidden ${isLight ? 'bg-black/5 border-black/5' : 'bg-black/40 border-white/5'}`}>
                {/* Sliding Background */}
                <div
                  className={`absolute top-1 bottom-1 w-1/2 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1.2)] ${
                    type === TransactionType.INCOME
                      ? 'left-1 bg-green-500'
                      : 'left-1/2 bg-red-500'
                  }`}
                />

                {/* Buttons */}
                <div className="relative grid grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`py-2.5 text-xs font-bold tracking-wide transition-colors duration-300 relative z-10 ${
                      type === TransactionType.INCOME
                        ? 'text-white'
                        : (isLight ? 'text-black/40 hover:text-black/60' : 'text-white/40 hover:text-white/60')
                    }`}
                  >
                    {t('income', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`py-2.5 text-xs font-bold tracking-wide transition-colors duration-300 relative z-10 ${
                      type === TransactionType.EXPENSE
                        ? 'text-white'
                        : (isLight ? 'text-black/40 hover:text-black/60' : 'text-white/40 hover:text-white/60')
                    }`}
                  >
                    {t('expense', language)}
                  </button>
                </div>
              </div>

              {/* Amount Input - Added liquid-input class */}
              <div className={`rounded-2xl p-3 border liquid-input transition-all duration-200 ${amountError ? 'border-red-500/50 bg-red-500/5' : (isLight ? 'bg-black/5 border-black/5 focus-within:bg-white focus-within:border-black/10' : 'bg-white/5 border-white/5 focus-within:border-white/20 focus-within:bg-white/10')}`}>
                <label className={`flex items-center gap-2 text-[10px] mb-1 uppercase tracking-wider font-semibold ${amountError ? 'text-red-400' : (isLight ? 'text-black/40' : 'text-white/40')}`}>
                  <DollarSign size={10} /> {t('amount', language)}
                </label>
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm font-medium transition-colors duration-300 ${type === TransactionType.INCOME ? 'text-green-500/50' : 'text-red-500/50'}`}></span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={handleAmountChange}
                    className={`w-full bg-transparent text-2xl font-bold placeholder:opacity-30 focus:outline-none ${amountError ? 'text-red-400' : (isLight ? 'text-black placeholder:text-black' : 'text-white placeholder:text-white/10')}`}
                    placeholder="0"
                  />
                </div>
                {amountError && (
                  <p className="text-red-400 text-xs mt-1 animate-fade-in">{amountError}</p>
                )}
              </div>

              {/* Currency Selector - Compact like categories */}
              <div>
                <label className={`flex items-center gap-2 text-[10px] mb-2 uppercase tracking-wider font-semibold ml-1 ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                  <DollarSign size={10} /> {t('currency', language)}
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1 custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {(['IDR', 'USD', 'EUR'] as CurrencyCode[]).map(curr => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-300 border active:scale-95 ${
                        currency === curr
                          ? (isLight ? 'bg-black text-white border-black' : 'bg-white text-black border-white')
                          : (isLight ? 'bg-black/5 text-black/60 border-transparent hover:bg-black/10' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10')
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input - Added liquid-input class */}
              <div className={`rounded-2xl p-3 border liquid-input ${isLight ? 'bg-black/5 border-black/5 focus-within:bg-white focus-within:border-black/10' : 'bg-white/5 border-white/5 focus-within:border-white/20 focus-within:bg-white/10'}`}>
                <label className={`flex items-center gap-2 text-[10px] mb-1 uppercase tracking-wider font-semibold ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                  <AlignLeft size={10} /> {t('description', language)} <span className="text-[9px] lowercase opacity-50">({t('optional', language)})</span>
                </label>
                <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full bg-transparent text-sm placeholder:opacity-40 focus:outline-none ${isLight ? 'text-black placeholder:text-black' : 'text-white placeholder:text-white/20'}`}
                    placeholder={t('exampleDesc', language)}
                  />
              </div>

              {/* Category Input */}
              <div>
                <label className={`flex items-center gap-2 text-[10px] mb-2 uppercase tracking-wider font-semibold ml-1 ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                  <Grid size={10} /> {t('category', language)}
                </label>
                <div
                  key={type}
                  className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-500"
                >
                  {currentCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-300 border active:scale-95 ${getCategoryBtnClass(cat)}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-lg transform active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  type === TransactionType.INCOME
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/20'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {language === 'id' ? 'Menyimpan...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {t('save', language)}
                  </>
                )}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};