import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, TransactionType, CurrencyCode, LanguageCode, ThemeMode, TransactionFilter } from '../types';
import { ArrowUpRight, ArrowDownRight, Plus, ChevronRight, TrendingUp, Wallet, Eye, EyeOff } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
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

type TimeRange = '7D' | '1M' | '3M' | 'ALL';

export const DashboardView: React.FC<DashboardProps> = ({ transactions, onOpenTransactionModal, onNavigateFilter, currency, language, theme, username, avatar, getDisplayAmount }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');
  const [showBalance, setShowBalance] = useState(true);

  // Dynamic island animation is now handled purely with CSS classes and state

  const { totalBalance, totalIncome, totalExpense, chartData } = useMemo(() => {
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
    let startDate: Date | null = null;

    if (timeRange === '7D') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '1M') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else if (timeRange === '3M') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    }

    let chartPoints: { date: string, balance: number }[] = [];

    if (startDate) {
        let startBalance = 0;
        const prePeriodTx = sorted.filter(tx => new Date(tx.date) < startDate!);
        prePeriodTx.forEach(tx => {
          const displayAmount = getDisplayAmount(tx);
          startBalance += tx.type === TransactionType.INCOME ? displayAmount : -displayAmount;
        });

        chartPoints.push({ date: startDate.toISOString(), balance: startBalance });

        let runningBalance = startBalance;
        const inPeriodTx = sorted.filter(tx => new Date(tx.date) >= startDate!);
        
        inPeriodTx.forEach(tx => {
          const displayAmount = getDisplayAmount(tx);
          runningBalance += tx.type === TransactionType.INCOME ? displayAmount : -displayAmount;
          chartPoints.push({ date: tx.date, balance: runningBalance });
        });

        chartPoints.push({ date: now.toISOString(), balance: runningBalance });
    } else {
        let runningBalance = 0;
        if (sorted.length === 0) {
            chartPoints.push({ date: now.toISOString(), balance: 0 });
        } else {
            sorted.forEach(tx => {
                const displayAmount = getDisplayAmount(tx);
                runningBalance += tx.type === TransactionType.INCOME ? displayAmount : -displayAmount;
                chartPoints.push({ date: tx.date, balance: runningBalance });
            });
            chartPoints.push({ date: now.toISOString(), balance: runningBalance });
        }
    }

    return {
      totalBalance: currentBalance,
      totalIncome: globalIncome,
      totalExpense: globalExpense,
      chartData: chartPoints
    };
  }, [transactions, timeRange]);

  const formatCurrency = (val: number, forceShow: boolean = false) => {
    if (!showBalance && !forceShow) return 'Rp.•••••••';

    if (currency === 'IDR') {
      return 'Rp.' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(val);
    } else if (currency === 'USD') {
      return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    } else if (currency === 'EUR') {
      return '€' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    }
    return val.toString();
  };
  
  const formatValue = (val: number) => {
    if (currency === 'IDR') {
      return 'Rp.' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(val);
    } else if (currency === 'USD') {
      return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    } else if (currency === 'EUR') {
      return '€' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    }
    return val.toString();
  };

  const RANGES = [
    { key: '7D', label: t('timeRange_7D', language) },
    { key: '1M', label: t('timeRange_1M', language) },
    { key: '3M', label: t('timeRange_3M', language) },
    { key: 'ALL', label: t('timeRange_ALL', language) },
  ] as const;

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
      
      {/* STATIC HEADER - Clean Compact Pill */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-4 px-3 sm:px-4 pointer-events-none">
        <div className={`dynamic-island-button pointer-events-auto w-full max-w-[98%] sm:max-w-md rounded-full py-3 sm:py-3.5 backdrop-blur-3xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border ${
          isLight
            ? 'bg-gradient-to-b from-white/80 to-white/60 border-white/40 shadow-black/5 ring-1 ring-black/5'
            : 'bg-gradient-to-b from-[#18181b]/80 to-[#121212]/70 border-white/20 ring-1 ring-white/10'
        }`}>
          <div className="flex items-center justify-between px-5 sm:px-6">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xl overflow-hidden relative ${
                  isLight
                    ? 'bg-gradient-to-br from-white to-cyan-50 shadow-cyan-500/20'
                    : 'bg-gradient-to-br from-[#18181b] to-black border border-white/10 shadow-cyan-500/20'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-shimmer rounded-xl opacity-60"></div>
                  <Wallet size={20} strokeWidth={1.5} className={`relative z-10 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-base font-black tracking-wide leading-none ${isLight ? 'text-black' : 'text-white'}`}>Sakuku</span>
              </div>
            </div>

            {/* Right: Compact Balance & Profile */}
            <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
              <div className="flex flex-col items-end min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wider ${
                    isLight ? 'bg-black/5 text-black/60' : 'bg-white/10 text-white/60'
                  }`}>
                    {currency}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider hidden xs:inline ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                    {t('totalBalance', language)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBalance(!showBalance);
                    }}
                    className={`transition-colors active:scale-90 p-0.5 rounded ${isLight ? 'text-black/30 hover:text-black/60 hover:bg-black/5' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
                  >
                    {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </div>
                <span className={`font-black tracking-tight truncate w-full text-right leading-none ${
                  isLight ? 'text-black' : 'text-white'
                } ${!showBalance ? 'blur-[2px] opacity-60' : ''} text-base sm:text-xl`}>
                  {showBalance ? formatCurrency(totalBalance, true) : '••••••'}
                </span>
              </div>

              <div className={`w-10 h-10 rounded-full border shadow-lg shrink-0 overflow-hidden ${isLight ? 'bg-gray-100 border-white' : 'bg-white/10 border-white/10'}`}>
                {avatar ? (
                  <img src={avatar} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center font-bold text-sm ${isLight ? 'bg-gradient-to-tr from-cyan-100 to-blue-200 text-cyan-800' : 'bg-gradient-to-tr from-cyan-900 to-blue-900 text-cyan-200'}`}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-36 px-6 pt-24 sm:pt-28">
        <div className="space-y-6 max-w-5xl mx-auto">
          
          {/* ACTION COMMAND CENTER */}
          <div className="space-y-3">
            <button
              onClick={() => onOpenTransactionModal(TransactionType.EXPENSE)}
              className={`w-full p-5 rounded-[2rem] flex items-center justify-between p-5 liquid-hover shadow-xl transition-all duration-300 group relative overflow-hidden ${
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
              
              <div className={`flex rounded-full p-1 gap-1 ${isLight ? 'bg-black/5' : 'bg-white/10'}`}>
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setTimeRange(r.key as TimeRange)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${
                      timeRange === r.key 
                        ? isLight 
                            ? 'bg-white text-black shadow-sm' 
                            : 'bg-white text-black shadow-md'
                        : isLight
                            ? 'text-black/40 hover:text-black hover:bg-black/5'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FULL BLEED CHART CONTAINER - FIXED FOR RECHARTS CRASH */}
            {/* Using absolute positioning inside a relative container forces the chart to take exact dimensions immediately */}
            <div className="w-[calc(100%+3rem)] -mx-6 h-40 sm:h-48 mt-4 relative z-0" style={{ minHeight: '192px' }}>
               <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={192} debounce={100}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        animationDuration={800}
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