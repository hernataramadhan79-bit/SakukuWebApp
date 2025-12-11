import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Transaction, TransactionType, CurrencyCode, LanguageCode, ThemeMode, TransactionFilter } from '../types';
import { ArrowUpRight, ArrowDownRight, Plus, ChevronRight, TrendingUp, Wallet, Eye, EyeOff, X, Calendar } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis, XAxis } from 'recharts';
import { t } from '../utils/i18n';

interface DashboardProps {
  transactions: Transaction[];
  onOpenTransactionModal: (type: TransactionType) => void;
  onNavigateFilter: (filter: TransactionFilter) => void;
  currency: CurrencyCode;
  language: LanguageCode;
  theme: ThemeMode;
  username: string;
  avatar: string | null;
  getDisplayAmount: (transaction: Transaction) => number;
}


export const DashboardView: React.FC<DashboardProps> = ({ transactions, onOpenTransactionModal, onNavigateFilter, currency, language, theme, username, avatar, getDisplayAmount }) => {
  const [showBalance, setShowBalance] = useState(true);
  
  // Dynamic Island States
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close header
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node) && isHeaderExpanded) {
        setIsHeaderExpanded(false);
      }
    };

    if (isHeaderExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHeaderExpanded]);

  const { totalBalance, totalIncome, totalExpense, chartData } = useMemo(() => {
    let chartPoints: { date: number; balance: number }[] = [];
    let globalIncome = 0;
    let globalExpense = 0;

    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    transactions.forEach(tx => {
      const displayAmount = getDisplayAmount(tx);
      if (tx.type === TransactionType.INCOME) globalIncome += displayAmount;
      else globalExpense += displayAmount;
    });

    const currentBalance = globalIncome - globalExpense;
    const now = new Date();

    let runningBalance = 0;
    if (sorted.length === 0) {
        chartPoints.push({ date: now.getTime(), balance: 0 });
    } else {
        sorted.forEach(tx => {
            const displayAmount = getDisplayAmount(tx);
            runningBalance += tx.type === TransactionType.INCOME ? displayAmount : -displayAmount;
            chartPoints.push({ date: new Date(tx.date).getTime(), balance: runningBalance });
        });
        chartPoints.push({ date: now.getTime(), balance: runningBalance });
    }

    return {
      totalBalance: currentBalance,
      totalIncome: globalIncome,
      totalExpense: globalExpense,
      chartData: chartPoints
    };
  }, [transactions, getDisplayAmount]);

  const formatCurrency = (val: number, forceShow: boolean = false) => {
    if (!showBalance && !forceShow) return 'Rp.•••••••';

    if (currency === 'IDR') {
      return 'Rp.' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(val);
    } else if (currency === 'USD') {
      return '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(val);
    } else if (currency === 'EUR') {
      return '€' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(val);
    }
    return val.toString();
  };
  
  const formatValue = (val: number) => {
    if (currency === 'IDR') {
      return 'Rp.' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(val);
    } else if (currency === 'USD') {
      return '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(val);
    } else if (currency === 'EUR') {
      return '€' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(val);
    }
    return val.toString();
  };


  const isLight = theme === 'light';

  const incomeBtnClass = isLight
    ? "bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 border-emerald-100 shadow-sm"
    : "bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.05)]";

  const incomeTextClass = isLight ? "text-emerald-900" : "text-green-400";
  const incomeSubTextClass = isLight ? "text-emerald-700/60" : "text-green-400/60";
  const incomeIconBg = isLight ? "bg-emerald-100 text-emerald-600" : "bg-emerald-500/20 text-emerald-400";

  const expenseBtnClass = isLight
    ? "bg-gradient-to-br from-rose-50/80 to-rose-100/50 border-rose-100 shadow-sm"
    : "bg-gradient-to-br from-rose-900/20 to-rose-800/10 border-rose-500/20 shadow-[0_4px_20px_rgba(244,63,94,0.05)]";

  const expenseTextClass = isLight ? "text-rose-900" : "text-red-400";
  const expenseSubTextClass = isLight ? "text-rose-700/60" : "text-red-400/60";
  const expenseIconBg = isLight ? "bg-rose-100 text-rose-600" : "bg-rose-500/20 text-rose-400";

  return (
    <div className="h-full flex flex-col relative w-full">
      
      {/* HEADER BACKGROUND SHIELD (Backdrop for click outside) */}
      <div 
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-500 ${
          isHeaderExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
      />

      {/* DYNAMIC ISLAND HEADER */}
      <div 
        ref={headerRef}
        className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-3 px-3 pointer-events-none"
      >
        <div 
          onClick={() => !isHeaderExpanded && setIsHeaderExpanded(true)}
          className={`pointer-events-auto shadow-[0_25px_60px_rgba(0,0,0,0.15)] border backdrop-blur-3xl overflow-hidden cursor-pointer relative group
            /* THE FLUID TRANSITION MAGIC */
            transition-[width,height,border-radius,box-shadow,transform,background-color] duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isHeaderExpanded 
              ? 'w-[92%] max-w-md h-[300px] rounded-[2.8rem] bg-opacity-100 shadow-[0_30px_80px_rgba(0,0,0,0.3)]' 
              : 'w-[90%] max-w-[360px] h-[68px] rounded-[2.2rem] hover:scale-[1.02] active:scale-[0.98]'
            }
            ${isLight 
              ? 'bg-white/95 border-white/40 ring-1 ring-black/5' 
              : 'bg-[#18181b]/95 border-white/10 ring-1 ring-white/10'
            }
          `}
        >
            {/* CONTENT 1: PILL VIEW (Restored Original Layout) */}
            <div className={`absolute inset-0 flex items-center justify-between px-6 gap-3 w-full h-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isHeaderExpanded 
                ? 'opacity-0 scale-90 blur-sm pointer-events-none' 
                : 'opacity-100 scale-100 blur-0 delay-[50ms]'
            }`}>
              {/* Left: Brand Identity */}
              <div className="flex items-center gap-3 shrink-0">
                <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center shadow-sm shrink-0 overflow-hidden relative ${
                  isLight 
                    ? 'bg-gradient-to-br from-white to-cyan-50 shadow-cyan-500/10' 
                    : 'bg-gradient-to-br from-[#18181b] to-black border border-white/10 shadow-cyan-500/10'
                }`}>
                   <Wallet 
                    size={20} 
                    strokeWidth={1.5}
                    className={`relative z-10 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} 
                  />
                </div>
                <span className={`text-base font-bold tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>Sakuku</span>
              </div>

              {/* Right: Balance (Bigger & Clearer) */}
              <div className="flex flex-col items-end mr-1 min-w-0 flex-1">
                 <span className={`text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5 leading-none ${isLight ? 'text-black' : 'text-white'}`}>
                   {t('totalBalance', language)}
                 </span>
                 <span className={`font-black tracking-tight truncate w-full text-right leading-none ${
                   isLight ? 'text-black' : 'text-white'
                 } ${
                   !showBalance ? 'blur-[3px] opacity-60' : ''
                 } text-lg sm:text-xl`}>
                   {showBalance ? formatCurrency(totalBalance, true) : '••••'}
                 </span>
              </div>
            </div>

            {/* CONTENT 2: EXPANDED VIEW (Card) */}
            <div className={`absolute inset-0 w-full h-full flex flex-col gap-6 p-7 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isHeaderExpanded 
                ? 'opacity-100 scale-100 blur-0 translate-y-0 delay-100' 
                : 'opacity-0 scale-90 blur-xl translate-y-4 pointer-events-none'
            }`}>
               {/* Top Row: User Info */}
               <div className="flex justify-between items-start shrink-0">
                  <div className="flex items-center gap-4">
                     <div className={`w-14 h-14 rounded-2xl border-2 shadow-lg shrink-0 overflow-hidden relative ${isLight ? 'bg-gray-100 border-white' : 'bg-white/10 border-white/10'}`}>
                       {avatar ? (
                         <img src={avatar} alt={username} className="w-full h-full object-cover" />
                       ) : (
                         <div className={`w-full h-full flex items-center justify-center font-bold text-xl ${isLight ? 'bg-gradient-to-tr from-cyan-100 to-blue-200 text-cyan-800' : 'bg-gradient-to-tr from-cyan-900 to-blue-900 text-cyan-200'}`}>
                           {username.charAt(0).toUpperCase()}
                         </div>
                       )}
                     </div>
                     <div>
                        <p className={`text-xs font-bold uppercase tracking-wider opacity-60 ${isLight ? 'text-black' : 'text-white'}`}>{t('hello', language)}</p>
                        <h2 className={`text-xl font-black tracking-tight leading-tight ${isLight ? 'text-black' : 'text-white'}`}>{username}</h2>
                        {/* Replaced Member Premium with Date Info */}
                        <div className={`flex items-center gap-1.5 mt-1 opacity-50 ${isLight ? 'text-black' : 'text-white'}`}>
                          <Calendar size={10} className="fill-current" />
                          <p className="text-[10px] font-medium tracking-wide">
                            {new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsHeaderExpanded(false); }}
                    className={`p-2 rounded-full transition-colors ${isLight ? 'bg-black/5 hover:bg-black/10 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  >
                     <X size={20} />
                  </button>
               </div>

               {/* Middle: Big Balance - Centered nicely in the remaining space */}
               <div className="flex flex-col items-center justify-center flex-1 -mt-2">
                  <span className={`text-xs font-bold uppercase tracking-[0.2em] mb-3 opacity-50 ${isLight ? 'text-black' : 'text-white'}`}>{t('totalBalance', language)}</span>
                  <div className="flex items-center gap-4">
                     <h1 className={`text-5xl font-black tracking-tighter ${isLight ? 'text-black' : 'text-white'}`}>
                        {showBalance ? formatCurrency(totalBalance, true) : '••••••••'}
                     </h1>
                  </div>
                  
                  {/* Currency Label & Toggle visibility in one row */}
                  <div className="flex items-center gap-2 mt-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${isLight ? 'bg-black/5 border-black/5 text-black/60' : 'bg-white/5 border-white/5 text-white/60'}`}>
                        {currency === 'IDR' ? 'INDONESIAN RUPIAH' : currency === 'USD' ? 'US DOLLAR' : 'EURO'}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowBalance(!showBalance); }}
                        className={`p-1 rounded-full transition-colors ${isLight ? 'text-black/40 hover:text-black/70' : 'text-white/40 hover:text-white/70'}`}
                      >
                        {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      {/* Adjusted top padding to accommodate taller header (pt-32) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-36 pt-32 px-6">
        <div className="space-y-6 max-w-5xl mx-auto">
          
          {/* ACTION COMMAND CENTER */}
          <div className="space-y-3">
            <button
              onClick={() => onOpenTransactionModal(TransactionType.EXPENSE)}
              className={`w-full py-5 rounded-[2rem] flex items-center justify-between px-6 liquid-hover shadow-xl transition-all duration-300 group relative overflow-hidden ${
                isLight
                  ? 'bg-black text-white hover:bg-neutral-900 shadow-black/20'
                  : 'bg-white text-black hover:bg-neutral-100 shadow-white/10'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${isLight ? 'via-white/20' : 'via-black/10'}`}></div>

              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  <Plus size={20} strokeWidth={3} />
                </div>
                <span className="font-bold text-lg">{t('addNew', language)}</span>
              </div>
              <div className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300 ${isLight ? 'bg-white/20' : 'bg-black/10'}`}>
                 <ChevronRight size={20} />
              </div>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onNavigateFilter('income')}
                className={`group relative flex flex-col justify-between p-5 rounded-[2rem] border liquid-hover overflow-hidden transition-all duration-300 cursor-pointer min-h-[140px] ${incomeBtnClass}`}
              >
                <div className="flex justify-between items-start w-full">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${incomeIconBg}`}>
                    <ArrowUpRight size={20} />
                  </div>
                  <div className={`opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 p-1 rounded-full ${isLight ? 'bg-emerald-100' : 'bg-emerald-500/20'}`}>
                    <ChevronRight size={14} className={isLight ? 'text-emerald-700' : 'text-emerald-400'} />
                  </div>
                </div>
                
                <div className="flex flex-col items-start gap-1 mt-4">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${incomeSubTextClass}`}>{t('income', language)}</span>
                  <span className={`text-xl font-bold truncate w-full text-left ${incomeTextClass}`}>
                    {showBalance ? formatValue(totalIncome) : '••••••'}
                  </span>
                </div>
              </button>

              <button 
                onClick={() => onNavigateFilter('expense')}
                className={`group relative flex flex-col justify-between p-5 rounded-[2rem] border liquid-hover overflow-hidden transition-all duration-300 cursor-pointer min-h-[140px] ${expenseBtnClass}`}
              >
                <div className="flex justify-between items-start w-full">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${expenseIconBg}`}>
                    <ArrowDownRight size={20} />
                  </div>
                  <div className={`opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 p-1 rounded-full ${isLight ? 'bg-rose-100' : 'bg-rose-500/20'}`}>
                    <ChevronRight size={14} className={isLight ? 'text-rose-700' : 'text-rose-400'} />
                  </div>
                </div>
                
                <div className="flex flex-col items-start gap-1 mt-4">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${expenseSubTextClass}`}>{t('expense', language)}</span>
                  <span className={`text-xl font-bold truncate w-full text-left ${expenseTextClass}`}>
                     {showBalance ? formatValue(totalExpense) : '••••••'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Chart Section */}
          <div className={`w-full rounded-[2.5rem] backdrop-blur-xl border shadow-xl overflow-hidden relative group transition-colors duration-300 ${isLight ? 'bg-white/70 border-white/50 shadow-black/5' : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10'}`}>
            <div className="p-6 pb-2 flex justify-between items-center z-10 relative">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isLight ? 'bg-cyan-100 text-cyan-700' : 'bg-cyan-500/20 text-cyan-400'}`}>
                  <TrendingUp size={16} />
                </div>
                <h3 className={`text-sm font-bold ${isLight ? 'text-black/80' : 'text-white/90'}`}>{t('financialTrend', language)}</h3>
              </div>
            </div>

            {/* FULL BLEED CHART CONTAINER - FIXED FOR RECHARTS CRASH */}
            {/* Using absolute positioning inside a relative container forces the chart to take exact dimensions immediately */}
            <div className="w-[calc(100%+3rem)] -mx-6 h-40 sm:h-48 mt-4 relative z-0">
               <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis type="number" dataKey="date" domain={['dataMin', 'dataMax']} hide />
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isLight ? "#0891b2" : "#22d3ee"} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={isLight ? "#0891b2" : "#22d3ee"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis hide domain={['auto', 'auto']} padding={{ top: 20, bottom: 20 }} />
                      <Tooltip 
                        cursor={{stroke: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', strokeWidth: 1}}
                        contentStyle={{ 
                          backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(18,18,18,0.8)', 
                          backdropFilter: 'blur(12px)', 
                          border: 'none', 
                          borderRadius: '16px', 
                          color: isLight ? '#000' : '#fff', 
                          boxShadow: '0 10px 40px rgba(0,0,0,0.2)', 
                          fontSize: '12px',
                          padding: '8px 12px'
                        }}
                        itemStyle={{ color: isLight ? '#0891b2' : '#22d3ee', fontWeight: 600 }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: number) => [formatValue(value), 'Saldo']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="balance" 
                        stroke={isLight ? "#0891b2" : "#22d3ee"} 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorBalance)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="pb-4">
             <div className="flex justify-between items-center mb-4 px-2">
               <h3 className={`text-sm font-bold uppercase tracking-wider opacity-60 ${isLight ? 'text-black' : 'text-white'}`}>{t('recentActivity', language)}</h3>
             </div>
            
            <div className="space-y-3">
              {transactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className={`flex justify-between items-center p-4 rounded-[1.5rem] transition-colors ${isLight ? 'bg-white/40 border border-white/50' : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === TransactionType.INCOME 
                        ? isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400' 
                        : isLight ? 'bg-rose-100 text-rose-600' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {tx.type === TransactionType.INCOME ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isLight ? 'text-black/80' : 'text-white/90'}`}>{tx.description}</p>
                      <p className={`text-xs ${isLight ? 'text-black/40' : 'text-white/40'}`}>{new Date(tx.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${
                    tx.type === TransactionType.INCOME 
                      ? isLight ? 'text-emerald-600' : 'text-emerald-400' 
                      : isLight ? 'text-black' : 'text-white'
                  }`}>
                    {showBalance 
                      ? (tx.type === TransactionType.INCOME ? '+' : '') + formatValue(getDisplayAmount(tx))
                      : '••••••'}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && (
                  <div className={`text-center py-8 rounded-[1.5rem] ${isLight ? 'bg-black/5 text-black/30' : 'bg-white/5 text-white/30'}`}>
                      {t('noActivity', language)}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};