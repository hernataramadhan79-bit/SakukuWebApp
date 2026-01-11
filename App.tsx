import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Layout } from './components/Layout';
const DashboardView = lazy(() => import('./components/DashboardView').then(module => ({ default: module.DashboardView })));
const TransactionsView = lazy(() => import('./components/TransactionsView').then(module => ({ default: module.TransactionsView })));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then(module => ({ default: module.AnalyticsView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(module => ({ default: module.SettingsView })));
const AboutView = lazy(() => import('./components/AboutView').then(module => ({ default: module.AboutView })));
import { InstallPrompt } from './components/InstallPrompt';
import { TransactionFormModal } from './components/TransactionFormModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SplashScreen } from './components/SplashScreen'; // Import new component
import { UpdateNotification } from './components/UpdateNotification';
import { AppView, Transaction, TransactionType, AppSettings, CurrencyCode, TransactionFilter } from './types';
import { getTransactions, saveTransaction, deleteTransaction, clearAllTransactions, getSettings, saveSettings, overrideTransactions } from './services/storage';
import { getLatestRates } from './services/currency';
import { t } from './utils/i18n';
import { PrivacyProvider } from './components/PrivacyContext';

// Defined outside component to avoid useEffect dependency issues
const applyTheme = (theme: 'dark' | 'light') => {
  if (theme === 'light') {
    document.documentElement.classList.add('light-mode');
  } else {
    document.documentElement.classList.remove('light-mode');
  }
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true); // State for Splash Screen
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  // Wallet Filter State (Lifted Up)
  const [walletFilter, setWalletFilter] = useState<TransactionFilter>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>(TransactionType.EXPENSE);

  // Confirm Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk' | 'all' | null;
    id: string | null;
    ids?: string[];
  }>({ isOpen: false, type: null, id: null });

  // Update Notification State
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    // Load initial data
    setTransactions(getTransactions());
    const savedSettings = getSettings();
    setSettings(savedSettings);
    applyTheme(savedSettings.theme);
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      if (settings.currency) {
        setIsLoadingRates(true);
        const rates = await getLatestRates(settings.currency);
        setExchangeRates(rates);
        setIsLoadingRates(false);
      }
    };
    fetchRates();
  }, [settings.currency]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available - show custom notification instead of browser alert
                setShowUpdateNotification(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const convertAmount = (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
    if (from === to || !exchangeRates || isLoadingRates) {
      return from === to ? amount : 0; // Return 0 if rates are loading and conversion is needed
    }

    // The base currency of our fetched rates is settings.currency.
    // All rates are relative to that base.
    const fromRate = exchangeRates[from]; // Rate of 'from' currency relative to base
    const toRate = exchangeRates[to];     // Rate of 'to' currency relative to base

    if (fromRate && toRate) {
      // To convert from currency A to currency B when all rates are relative to C:
      // 1. Convert amount from A to C: amountInA / rate_A_to_C
      // 2. Convert amount from C to B: amountInC * rate_B_to_C
      // Since our rates are from C (base) to other currencies, the formula is:
      // (amount / fromRate) * toRate
      const amountInBase = amount / fromRate;
      const finalAmount = amountInBase * toRate;
      return finalAmount;
    }

    // Fallback if rates aren't available for some reason
    console.warn(`Exchange rates not found for conversion from ${from} to ${to}. Rates loading: ${isLoadingRates}. Using original amount.`);
    return amount;
  };

  // Get transaction amount converted to display currency
  const getDisplayAmount = (transaction: Transaction): number => {
    return convertAmount(transaction.amount, transaction.currency, settings.currency);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    // Check if View Transition API is supported
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        updateSettingsLogic(newSettings);
      });
    } else {
      // Fallback for browsers without support
      updateSettingsLogic(newSettings);
    }
  };

  const updateSettingsLogic = (newSettings: AppSettings) => {
    // Currency change no longer requires data conversion since each transaction has its own currency
    // The display will automatically convert amounts based on transaction.currency vs settings.currency

    setSettings(newSettings);
    saveSettings(newSettings);
    // Apply theme immediately to DOM to ensure capture by View Transition
    applyTheme(newSettings.theme);
  };

  // Polyfill for crypto.randomUUID for older browsers
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: generateUUID(),
    };
    const updated = saveTransaction(transaction);
    setTransactions(updated);
    setIsModalOpen(false);
  };

  // Trigger delete single
  const initiateDeleteTransaction = (id: string) => {
    setConfirmState({ isOpen: true, type: 'single', id });
  };

  // Trigger delete multiple
  const initiateDeleteMultiple = (ids: string[]) => {
    setConfirmState({ isOpen: true, type: 'bulk', id: null, ids });
  };

  // Trigger clear all
  const initiateClearAllData = () => {
    setConfirmState({ isOpen: true, type: 'all', id: null });
  };

  // Handle confirmation action (Single Step)
  const handleConfirmAction = () => {
    // Execute Action immediately
    if (confirmState.type === 'single' && confirmState.id) {
      const updated = deleteTransaction(confirmState.id);
      setTransactions(updated);
    } else if (confirmState.type === 'bulk' && confirmState.ids) {
      // Handle bulk deletion
      let updated = [...transactions];
      confirmState.ids.forEach(id => {
        updated = deleteTransaction(id); // This is inefficient but safer with current storage service
      });
      // Better optimization would be to update storage service to accept bulk delete
      // But for now, we just sync local state
      const finalIds = new Set(confirmState.ids);
      const remaining = transactions.filter(t => !finalIds.has(t.id));
      overrideTransactions(remaining);
      setTransactions(remaining);

    } else if (confirmState.type === 'all') {
      clearAllTransactions();
      setTransactions([]);
    }
    // Reset
    setConfirmState({ isOpen: false, type: null, id: null });
  };

  const handleCancelAction = () => {
    setConfirmState({ isOpen: false, type: null, id: null });
  };

  const openModal = (type: TransactionType = TransactionType.EXPENSE) => {
    setModalDefaultType(type);
    setIsModalOpen(true);
  };

  // Update Notification Handlers
  const handleUpdateApp = () => {
    setShowUpdateNotification(false);
    window.location.reload();
  };

  const handleDismissUpdate = () => {
    setShowUpdateNotification(false);
  };

  // Navigate from Dashboard to Filtered Wallet
  const navigateToWalletFilter = (filter: TransactionFilter) => {
    setWalletFilter(filter);
    setCurrentView(AppView.TRANSACTIONS);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <DashboardView
            transactions={transactions}
            onOpenTransactionModal={openModal}
            onNavigateFilter={navigateToWalletFilter}
            currency={settings.currency}
            language={settings.language}
            theme={settings.theme}
            username={settings.username}
            avatar={settings.avatar}
            getDisplayAmount={getDisplayAmount}
          />
        );
      case AppView.TRANSACTIONS:
        return (
          <TransactionsView
            transactions={transactions}
            onDelete={initiateDeleteTransaction}
            onDeleteMultiple={initiateDeleteMultiple}
            onClearAll={initiateClearAllData}
            onOpenTransactionModal={() => openModal(walletFilter === 'all' ? TransactionType.EXPENSE : (walletFilter === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE))}
            currency={settings.currency}
            language={settings.language}
            theme={settings.theme}
            activeFilter={walletFilter}
            onFilterChange={setWalletFilter}
            getDisplayAmount={getDisplayAmount}
          />
        );
      case AppView.ANALYTICS:
        return <AnalyticsView transactions={transactions} currency={settings.currency} language={settings.language} theme={settings.theme} getDisplayAmount={getDisplayAmount} />;
      case AppView.SETTINGS:
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearAllData={initiateClearAllData}
            onNavigateToAbout={() => setCurrentView(AppView.ABOUT)}
          />
        );
      case AppView.ABOUT:
        return (
          <AboutView
            language={settings.language}
            theme={settings.theme}
            onBack={() => setCurrentView(AppView.SETTINGS)}
          />
        );
      default:
        return (
          <DashboardView
            transactions={transactions}
            onOpenTransactionModal={openModal}
            onNavigateFilter={navigateToWalletFilter}
            currency={settings.currency}
            language={settings.language}
            theme={settings.theme}
            username={settings.username}
            avatar={settings.avatar}
            getDisplayAmount={getDisplayAmount}
          />
        );
    }
  };

  const getModalContent = () => {
    if (confirmState.type === 'all') {
      return {
        title: t('resetConfirmTitle', settings.language),
        message: t('resetConfirmMsg', settings.language)
      };
    } else if (confirmState.type === 'bulk') {
       return {
        title: t('bulkDeleteTitle', settings.language),
        message: `${confirmState.ids?.length || 0} ${t('bulkDeleteMsg', settings.language)}`
      };
    } else {
      return {
        title: t('deleteConfirmTitle', settings.language),
        message: t('deleteConfirmMsg', settings.language)
      };
    }
  };

    const modalContent = getModalContent();

  

    return (

      <PrivacyProvider>

        {/* Splash Screen - conditionally rendered on top */}

        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} theme={settings.theme} />}

  

        {/* Custom Update Notification */}

        {showUpdateNotification && (

          <UpdateNotification

            onUpdate={handleUpdateApp}

            onDismiss={handleDismissUpdate}

            language={settings.language}

            theme={settings.theme}

          />

        )}

  

        <Layout currentView={currentView} onChangeView={setCurrentView} isModalOpen={isModalOpen || currentView === AppView.ABOUT || confirmState.isOpen} language={settings.language} theme={settings.theme}>

          <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}>

            {renderView()}

          </Suspense>

  

          <TransactionFormModal

            isOpen={isModalOpen}

            onClose={() => setIsModalOpen(false)}

            onSubmit={handleAddTransaction}

            initialType={modalDefaultType}

            language={settings.language}

            theme={settings.theme}

          />

  

          <ConfirmModal

            isOpen={confirmState.isOpen}

            title={modalContent.title}

            message={modalContent.message}

            onConfirm={handleConfirmAction}

            onCancel={handleCancelAction}

            language={settings.language}

          />

  

          <InstallPrompt language={settings.language} theme={settings.theme} />

        </Layout>

      </PrivacyProvider>

    );

  }

  