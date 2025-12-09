import React, { useState } from 'react';
import { Transaction, TransactionType, CurrencyCode, LanguageCode, ThemeMode, TransactionFilter } from '../types';
import { Plus, Search, Trash2, AlertCircle, CheckCircle2, Circle, X, CheckSquare } from 'lucide-react';
import { t } from '../utils/i18n';

interface TransactionsProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onClearAll: () => void;
  onOpenTransactionModal: () => void;
  currency: CurrencyCode;
  language: LanguageCode;
  theme: ThemeMode;
  activeFilter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
  getDisplayAmount: (transaction: Transaction) => number;
}

export const TransactionsView: React.FC<TransactionsProps> = ({
  transactions,
  onDelete,
  onDeleteMultiple,
  onClearAll,
  onOpenTransactionModal,
  currency,
  language,
  theme,
  activeFilter,
  onFilterChange,
  getDisplayAmount
}) => {
  const [searchText, setSearchText] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Advanced filtering logic
  const filteredTransactions = transactions.filter(tx => {
    // 1. Text Search
    const desc = (tx.description || '').toLowerCase();
    const cat = (tx.category || '').toLowerCase();
    const search = searchText.toLowerCase();
    const matchesSearch = desc.includes(search) || cat.includes(search);

    // 2. Type Filter
    let matchesType = true;
    if (activeFilter === 'income') matchesType = tx.type === TransactionType.INCOME;
    if (activeFilter === 'expense') matchesType = tx.type === TransactionType.EXPENSE;

    return matchesSearch && matchesType;
  });

  const formatCurrency = (val: number) => {
    if (currency === 'IDR') {
      return 'Rp.' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(val);
    } else if (currency === 'USD') {
      return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    } else if (currency === 'EUR') {
      return '€' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    }
    return val.toString();
  };

  const isLight = theme === 'light';

  // Toggle selection for a single item
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Toggle Selection Mode
  const handleToggleSelectionMode = () => {
    if (isSelectionMode) {
      setIsSelectionMode(false);
      setSelectedIds(new Set()); // Clear selection
    } else {
      setIsSelectionMode(true);
    }
  };

  // Select All / Deselect All Logic
  const handleSelectAll = () => {
    const allIds = filteredTransactions.map(tx => tx.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id));

    if (allSelected) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all filtered
      const newSelected = new Set(selectedIds);
      allIds.forEach(id => newSelected.add(id));
      setSelectedIds(newSelected);
    }
  };

  // Check if all are currently selected
  const isAllSelected = filteredTransactions.length > 0 && filteredTransactions.every(tx => selectedIds.has(tx.id));

  const handleBulkDelete = () => {
    if (selectedIds.size > 0) {
      onDeleteMultiple(Array.from(selectedIds));
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    }
  };

  // Helper for filter position
  const getFilterOffset = () => {
    if (activeFilter === 'all') return 'left-1';
    if (activeFilter === 'income') return 'left-[33.33%]';
    return 'left-[66.66%]'; // expense
  };

  const getFilterColor = () => {
    if (activeFilter === 'all') return isLight ? 'bg-white shadow-sm ring-1 ring-black/5' : 'bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]';
    if (activeFilter === 'income') return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)] ring-1 ring-green-500/30';
    return 'bg-gradient-to-r from-red-500/20 to-rose-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] ring-1 ring-red-500/30';
  };

  return (
    <div className="h-full flex flex-col pt-6 px-6 relative">
      <div className="max-w-5xl mx-auto w-full">
        <header className="flex justify-between items-center mb-4 sm:mb-6 shrink-0 relative z-20">
          <h1 className={`text-2xl sm:text-3xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>{t('wallet', language)}</h1>
        <div className="flex items-center gap-2">
          
          {/* Select Mode Toggle */}
          {transactions.length > 0 && (
            <button
              onClick={handleToggleSelectionMode}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                isSelectionMode
                  ? (isLight ? 'bg-black text-white border-black' : 'bg-white text-black border-white')
                  : (isLight ? 'bg-white text-black border-black/10' : 'bg-white/10 text-white border-white/20 hover:bg-white/20')
              }`}
            >
              {isSelectionMode ? t('cancelSelection', language) : t('select', language)}
            </button>
          )}

          {/* Select All Button (Only in Selection Mode) */}
          {isSelectionMode && filteredTransactions.length > 0 && (
             <button
               onClick={handleSelectAll}
               className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center justify-center border animate-smooth-appear ${
                 isLight
                    ? 'bg-black/5 border-black/5 text-black hover:bg-black/10'
                    : 'bg-white/10 border-white/5 text-white hover:bg-white/20'
               }`}
             >
               {isAllSelected ? t('deselectAll', language) : t('selectAll', language)}
             </button>
          )}

          {/* Delete Selected Button (Only in Selection Mode & Items Selected) */}
          {isSelectionMode && selectedIds.size > 0 && (
             <button
                onClick={handleBulkDelete}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 border animate-smooth-appear ${
                  isLight
                    ? 'bg-red-500 text-white border-red-500 shadow-sm'
                    : 'bg-red-500 text-white border-red-500 shadow-md'
                }`}
              >
                 <Trash2 size={12} />
                 <span>{selectedIds.size}</span>
              </button>
          )}

          {/* Hide Add Button when in Selection Mode */}
          {!isSelectionMode && (
            <>
              <button 
                onClick={onOpenTransactionModal}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center liquid-hover shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-colors active:scale-95 ${isLight ? 'bg-black text-white hover:bg-black/80' : 'bg-white text-black hover:bg-cyan-400'}`}
              >
                <Plus size={20} className="sm:w-6 sm:h-6" />
              </button>
            </>
          )}
          </div>
        </header>

        {/* LIQUID FILTER SEGMENTED CONTROL */}
        <div className={`relative shrink-0 mb-4 p-1 rounded-2xl grid grid-cols-3 isolate overflow-hidden transition-all duration-300 ${isSelectionMode ? 'opacity-50 pointer-events-none grayscale' : ''} ${isLight ? 'bg-black/5 border border-black/5' : 'bg-black/40 border border-white/5'}`}>
         {/* Sliding Background Blob */}
         <div 
           className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] rounded-[0.8rem] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${getFilterOffset()} ${getFilterColor()}`}
         />
         
         <button onClick={() => onFilterChange('all')} className={`relative z-10 py-2.5 text-xs font-bold text-center transition-colors duration-300 ${activeFilter === 'all' ? (isLight ? 'text-black' : 'text-white') : (isLight ? 'text-black/40' : 'text-white/40')}`}>{t('filterAll', language)}</button>
         <button onClick={() => onFilterChange('income')} className={`relative z-10 py-2.5 text-xs font-bold text-center transition-colors duration-300 ${activeFilter === 'income' ? 'text-green-500' : (isLight ? 'text-black/40' : 'text-white/40')}`}>{t('income', language)}</button>
         <button onClick={() => onFilterChange('expense')} className={`relative z-10 py-2.5 text-xs font-bold text-center transition-colors duration-300 ${activeFilter === 'expense' ? 'text-red-500' : (isLight ? 'text-black/40' : 'text-white/40')}`}>{t('expense', language)}</button>
       </div>

       {/* Search Bar */}
       <div className={`relative mb-4 sm:mb-6 shrink-0 z-10 transition-all duration-300 ${isSelectionMode ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isLight ? 'text-black/30' : 'text-white/40'}`}>
          <Search size={16} />
        </div>
        <input 
          type="text" 
          placeholder={t('searchPlaceholder', language)} 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={`w-full border rounded-2xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-sm sm:text-base placeholder:text-opacity-30 focus:outline-none transition-all backdrop-blur-md ${isLight ? 'bg-white/60 border-black/5 text-black focus:bg-white focus:border-black/10' : 'bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:bg-white/20 focus:border-white/30'}`}
        />
        </div>

        {/* Transaction List with Internal Scroll */}
        <div className="flex-1 overflow-y-auto pb-32 space-y-2 sm:space-y-3 pr-1 custom-scrollbar">
        {filteredTransactions.map((tx, idx) => {
          const isSelected = selectedIds.has(tx.id);
          return (
            <div 
              key={tx.id} 
              onClick={() => isSelectionMode && toggleSelection(tx.id)}
              className={`group relative flex items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-300 backdrop-blur-md overflow-hidden ${isSelectionMode ? 'cursor-pointer' : 'cursor-default'} ${
                 isSelected
                    ? isLight 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-blue-500/10 border-blue-500/30'
                    : isLight 
                        ? 'bg-gradient-to-br from-white/80 to-white/40 border-black/5 hover:bg-white hover:border-black/10' 
                        : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 relative z-10 overflow-hidden min-w-0 flex-1">
                {/* Checkbox (Visible only in Selection Mode) */}
                <div className={`transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSelectionMode ? 'w-6 opacity-100 mr-2' : 'w-0 opacity-0 mr-0 overflow-hidden'}`}>
                   {isSelected ? (
                     <CheckCircle2 className={`text-blue-500 ${isSelectionMode ? 'scale-100' : 'scale-0'}`} size={24} fill={isLight ? "white" : "currentColor"} />
                   ) : (
                     <Circle className={`text-gray-400 ${isSelectionMode ? 'scale-100' : 'scale-0'}`} size={24} />
                   )}
                </div>

                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl font-bold shadow-inner shrink-0 transition-transform duration-300 ${
                  isSelectionMode && isSelected ? 'scale-90' : 'scale-100'
                } ${
                  tx.type === TransactionType.INCOME 
                    ? isLight ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-gradient-to-br from-green-500/20 to-emerald-900/20 text-green-400 border border-green-500/20'
                    : isLight ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gradient-to-br from-red-500/20 to-rose-900/20 text-red-400 border border-red-500/20'
                }`}>
                  {(tx.category && tx.category[0]) ? tx.category[0] : '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-sm sm:text-base font-medium truncate pr-2 ${isLight ? 'text-black' : 'text-white'}`}>{tx.description || t('noActivity', language)}</h3>
                  <p className={`text-[10px] sm:text-xs truncate ${isLight ? 'text-black/40' : 'text-white/40'}`}>{tx.category} • {new Date(tx.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {day: 'numeric', month: 'short'})}</p>
                </div>
              </div>
              <div className="flex flex-col items-end relative z-10 shrink-0 ml-2">
                 <span className={`font-semibold text-xs sm:text-base ${
                   tx.type === TransactionType.INCOME
                     ? isLight ? 'text-green-600' : 'text-green-400'
                     : isLight ? 'text-red-600' : 'text-white'
                 }`}>
                  {tx.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(getDisplayAmount(tx))}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Empty State */}
        {transactions.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-20 text-center ${isLight ? 'opacity-30' : 'opacity-40'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isLight ? 'bg-black/5' : 'bg-white/5'}`}>
              <AlertCircle size={32} />
            </div>
            <p className={`text-sm ${isLight ? 'text-black' : 'text-white'}`}>{t('emptyTransactions', language)}</p>
            <p className={`text-xs mt-1 ${isLight ? 'text-black' : 'text-white'}`}>{t('startPrompt', language)}</p>
          </div>
        )}
        
          {transactions.length > 0 && filteredTransactions.length === 0 && (
            <div className={`text-center py-10 text-sm ${isLight ? 'text-black/30' : 'text-white/30'}`}>
              {t('notFound', language)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};