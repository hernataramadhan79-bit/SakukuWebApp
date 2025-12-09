import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, TransactionType, CurrencyCode, LanguageCode, ThemeMode } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Sparkles, RotateCcw, Save, Trash2 } from 'lucide-react';
import { generateSpendingInsight } from '../services/gemini';
import { t } from '../utils/i18n';
import ReactMarkdown from 'react-markdown';
import { Suspense, lazy } from 'react';

// Lazy load ReactMarkdown for better performance
const LazyReactMarkdown = lazy(() => import('react-markdown'));

interface AnalyticsProps {
  transactions: Transaction[];
  currency: CurrencyCode;
  language: LanguageCode;
  theme: ThemeMode;
  getDisplayAmount: (transaction: Transaction) => number;
}

const COLORS = ['#22d3ee', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308', '#84cc16'];

export const AnalyticsView: React.FC<AnalyticsProps> = ({ transactions, currency, language, theme, getDisplayAmount }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedInsights, setSavedInsights] = useState<string[]>([]);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  // Load saved insights from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sakuku-saved-insights');
    if (saved) {
      try {
        setSavedInsights(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved insights:', e);
      }
    }
  }, []);

  // Save insights to localStorage whenever savedInsights changes
  useEffect(() => {
    localStorage.setItem('sakuku-saved-insights', JSON.stringify(savedInsights));
  }, [savedInsights]);

  // Optimized: Separate memoization for better performance
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const catMap: Record<string, number> = {};

    expenses.forEach(t => {
      const displayAmount = getDisplayAmount(t);
      catMap[t.category] = (catMap[t.category] || 0) + displayAmount;
    });

    return Object.keys(catMap).map(key => ({
      name: key,
      value: catMap[key]
    })).sort((a, b) => b.value - a.value);
  }, [transactions, getDisplayAmount]);

  const monthlyData = useMemo(() => {
    const monthMap: Record<string, { income: number, expense: number }> = {};
    const last6Months = Array.from({length: 6}, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
    }).reverse();

    // Init map
    last6Months.forEach(m => monthMap[m] = { income: 0, expense: 0 });

    transactions.forEach(t => {
       const m = new Date(t.date).toLocaleString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
       if (monthMap[m]) {
         const displayAmount = getDisplayAmount(t);
         if (t.type === TransactionType.INCOME) monthMap[m].income += displayAmount;
         else monthMap[m].expense += displayAmount;
       }
    });

    return last6Months.map(m => ({
      name: m,
      income: monthMap[m].income,
      expense: monthMap[m].expense
    }));
  }, [transactions, language, getDisplayAmount]);

  const handleAnalyze = async () => {
    setIsExpanding(true);
    setIsCollapsing(false);
    setIsAnalyzing(true);
    const result = await generateSpendingInsight(transactions, language, currency);
    setIsAnalyzing(false);
    // Small delay to show transition from loading to result
    setTimeout(() => {
      setInsight(result);
      setIsExpanding(false);
    }, 100);
  };

  const handleSaveInsight = () => {
    if (insight && !savedInsights.includes(insight)) {
      setSavedInsights(prev => [insight, ...prev]);
    }
  };

  const handleDeleteInsight = (index: number) => {
    setSavedInsights(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteCurrentInsight = () => {
    setIsCollapsing(true);
    setTimeout(() => {
      setInsight(null);
      setIsCollapsing(false);
    }, 600); // Match animation duration
  };

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

  const axisColor = theme === 'light' ? '#666666' : '#ffffff60';
  const isLight = theme === 'light';

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pt-6 pb-32 px-4 sm:px-6">
      <div className="space-y-4 sm:space-y-6 max-w-full sm:max-w-5xl mx-auto">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${isLight ? 'text-black' : 'text-white'}`}>{t('statsTitle', language)}</h1>

        {/* AI Insight Card */}
        <div className={`relative rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 overflow-hidden border shadow-xl transition-all duration-300 ${
          isLight
            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
            : 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30'
        }`}>
          {/* Decorative Glows - Simplified */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className={`text-lg font-bold ${isLight ? 'text-indigo-900' : 'text-white'}`}>{t('aiAdvisor', language)}</h2>
                <p className={`text-xs ${isLight ? 'text-indigo-900/60' : 'text-indigo-200/60'}`}>{t('aiDesc', language)}</p>
              </div>
              
              {/* Action Button */}
              {(!insight || !isAnalyzing) && (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLight
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'
                  }`}
                >
                  {insight ? <RotateCcw size={14} /> : <Sparkles size={14} />}
                  {insight ? t('regenerate', language) : t('analyzeNow', language)}
                </button>
              )}
            </div>

            {/* Content Area */}
            <div key={`content-${isCollapsing ? 'collapsing' : isExpanding ? 'expanding' : 'static'}`} className="ai-content-transition">
              {isAnalyzing ? (
                <div className="transition-all duration-300">
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-3 ${isLight ? 'border-indigo-600' : 'border-indigo-400'}`}></div>
                    <p className={`text-sm ${isLight ? 'text-indigo-900/60' : 'text-indigo-200/60'}`}>{t('analyzing', language)}</p>
                  </div>
                </div>
              ) : insight && !isCollapsing ? (
                <div className="transition-all duration-300">
                  <div className={`prose prose-sm max-w-none p-4 rounded-xl ${
                    isLight
                      ? 'prose-indigo bg-white/60 border border-indigo-100'
                      : 'prose-invert bg-black/20 border border-indigo-500/20'
                  }`}>
                    <Suspense fallback={<div className="text-sm opacity-60">Loading...</div>}>
                      <LazyReactMarkdown>{insight}</LazyReactMarkdown>
                    </Suspense>
                  </div>
                  {/* Action Buttons for Current Insight */}
                  <div className="flex gap-2 mt-3 transition-all duration-300">
                    <button
                      onClick={handleSaveInsight}
                      disabled={savedInsights.includes(insight)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
                        savedInsights.includes(insight)
                          ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                          : isLight
                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                      }`}
                    >
                      <Save size={12} />
                      {savedInsights.includes(insight) ? t('saved', language) : t('save', language)}
                    </button>
                    <button
                      onClick={handleDeleteCurrentInsight}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
                        isLight
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      }`}
                    >
                      <Trash2 size={12} />
                      {t('delete', language)}
                    </button>
                  </div>
                </div>
              ) : insight && isCollapsing ? (
                <div className="animate-liquid-collapse">
                  <div className={`prose prose-sm max-w-none p-4 rounded-xl ${
                    isLight
                      ? 'prose-indigo bg-white/60 border border-indigo-100'
                      : 'prose-invert bg-black/20 border border-indigo-500/20'
                  }`}>
                    <Suspense fallback={<div className="text-sm opacity-60">Loading...</div>}>
                      <LazyReactMarkdown>{insight}</LazyReactMarkdown>
                    </Suspense>
                  </div>
                  {/* Action Buttons for Current Insight */}
                  <div className="flex gap-2 mt-3">
                    <button
                      disabled
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 opacity-50 cursor-not-allowed ${
                        isLight
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      <Save size={12} />
                      {t('save', language)}
                    </button>
                    <button
                      disabled
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 opacity-50 cursor-not-allowed ${
                        isLight
                          ? 'bg-red-100 text-red-700'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      <Trash2 size={12} />
                      {t('delete', language)}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Saved AI Insights */}
        {savedInsights.length > 0 && (
          <div className={`rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-xl border shadow-xl p-5 sm:p-6 ${
            isLight ? 'bg-white/60 border-black/5 shadow-black/5' : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10'
          }`}>
            <h3 className={`text-base sm:text-lg font-semibold mb-4 ${isLight ? 'text-black/80' : 'text-white'}`}>
              {t('savedInsights', language)}
            </h3>
            <div className="space-y-3">
              {savedInsights.map((savedInsight, index) => (
                <div key={index} className={`p-4 rounded-xl border ${
                  isLight
                    ? 'bg-white/60 border-indigo-100'
                    : 'bg-black/20 border-indigo-500/20'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      Insight #{index + 1}
                    </span>
                    <button
                      onClick={() => handleDeleteInsight(index)}
                      className={`p-1 rounded-lg transition-colors duration-200 ${
                        isLight
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className={`text-sm whitespace-pre-line ${isLight ? 'text-black/70' : 'text-white/70'}`}>
                    {savedInsight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spending Breakdown */}
        <div className={`rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-xl border shadow-xl p-5 sm:p-6 relative overflow-hidden ${
           isLight ? 'bg-white/60 border-black/5 shadow-black/5' : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10'
        }`}>
          <h2 className={`text-base sm:text-lg font-semibold mb-2 sm:mb-4 ${isLight ? 'text-black/80' : 'text-white'}`}>{t('spendingBreakdown', language)}</h2>
          {/* Chart Container - Fixed with Absolute Positioning */}
          <div className="h-56 sm:h-64 relative z-10 -ml-2 sm:-ml-4" style={{ minHeight: '224px' }}>
             <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={224} debounce={100}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius="50%"
                      outerRadius="70%"
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(10px)',
                        border: 'none',
                        borderRadius: '12px',
                        color: isLight ? '#000' : '#fff',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        fontSize: '12px'
                      }}
                      itemStyle={{ color: isLight ? '#000' : '#fff' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
          
          {/* Legend */}
          <div className="mt-2 sm:mt-4 grid grid-cols-2 gap-2">
            {categoryData.slice(0, 6).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 group">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full group-hover:scale-125 transition-transform" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className={`text-xs sm:text-sm truncate ${isLight ? 'text-black/70' : 'text-white/70'}`}>{item.name}</span>
                <span className={`text-[10px] sm:text-xs ml-auto ${isLight ? 'text-black/50' : 'text-white/50'}`}>
                   {Math.round((item.value / transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, b) => a + getDisplayAmount(b), 0)) * 100)}%
                 </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Income vs Expense Bar Chart */}
        <div className={`rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-xl border shadow-xl p-5 sm:p-6 overflow-hidden ${
             isLight ? 'bg-white/60 border-black/5 shadow-black/5' : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10'
        }`}>
          <h2 className={`text-base sm:text-lg font-semibold mb-4 ${isLight ? 'text-black/80' : 'text-white'}`}>{t('incomeVsExpense', language)}</h2>
          {/* Chart Container - Fixed with Absolute Positioning */}
          <div className="h-64 w-full relative" style={{ minHeight: '256px' }}>
            <div className="absolute inset-0">
               <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={256} debounce={100}>
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: axisColor, fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: axisColor, fontSize: 10 }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{fill: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}} 
                    contentStyle={{ 
                      backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(18,18,18,0.8)', 
                      backdropFilter: 'blur(10px)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      color: isLight ? '#000' : '#fff', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      fontSize: '12px' 
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="income" name={t('income', language)} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={800} />
                  <Bar dataKey="expense" name={t('expense', language)} fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};