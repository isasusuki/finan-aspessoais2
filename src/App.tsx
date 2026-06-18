/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { ExpenseCategory, IncomeSource, PendingReceipt, Receivable, Transaction, BankAccount } from './types';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_INCOME_SOURCES, 
  INITIAL_PENDING, 
  INITIAL_RECEIVABLES, 
  DEMO_TRANSACTIONS,
  DEFAULT_BANKS
} from './data';

export default function App() {
  const [firstLoginCompleted, setFirstLoginCompleted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('finance_first_login_completed_v1');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [categories, setCategories] = useState<ExpenseCategory[]>(() => {
    try {
      const saved = localStorage.getItem('finance_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(() => {
    try {
      const saved = localStorage.getItem('finance_income_sources');
      return saved ? JSON.parse(saved) : DEFAULT_INCOME_SOURCES;
    } catch {
      return DEFAULT_INCOME_SOURCES;
    }
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    try {
      const saved = localStorage.getItem('finance_bank_accounts');
      return saved ? JSON.parse(saved) : DEFAULT_BANKS;
    } catch {
      return DEFAULT_BANKS;
    }
  });

  // Balanced states for functional values (start zeroed out unless demo is selected)
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>(() => {
    try {
      const saved = localStorage.getItem('finance_pending_receipts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [receivables, setReceivables] = useState<Receivable[]>(() => {
    try {
      const saved = localStorage.getItem('finance_receivables');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('finance_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('finance_first_login_completed_v1', JSON.stringify(firstLoginCompleted));
      localStorage.setItem('finance_categories', JSON.stringify(categories));
      localStorage.setItem('finance_income_sources', JSON.stringify(incomeSources));
      localStorage.setItem('finance_pending_receipts', JSON.stringify(pendingReceipts));
      localStorage.setItem('finance_receivables', JSON.stringify(receivables));
      localStorage.setItem('finance_transactions', JSON.stringify(transactions));
      localStorage.setItem('finance_bank_accounts', JSON.stringify(bankAccounts));
    } catch (e) {
      console.error('Error syncing finance states to localStorage', e);
    }
  }, [firstLoginCompleted, categories, incomeSources, pendingReceipts, receivables, transactions, bankAccounts]);

  // On onboarding complete
  const handleOnboardingComplete = (setup: { 
    categories: ExpenseCategory[]; 
    incomeSources: IncomeSource[]; 
    loadDemo: boolean 
  }) => {
    setCategories(setup.categories);
    setIncomeSources(setup.incomeSources);
    
    if (setup.loadDemo) {
      setTransactions(DEMO_TRANSACTIONS);
      setPendingReceipts(INITIAL_PENDING);
      setReceivables(INITIAL_RECEIVABLES);
      setBankAccounts(DEFAULT_BANKS);
    } else {
      // Prompt specifically asked to show columns with illustrative icon and starting value as ZERO:
      // "cada uma com ícone ilustrativo e valor inicial zerado. (...) todas as contas zeradas no login"
      setTransactions([]);
      setPendingReceipts([]);
      setReceivables([]);
      setBankAccounts(DEFAULT_BANKS.map(b => ({ ...b, balance: 0 })));
    }

    setFirstLoginCompleted(true);
  };

  // Allow resetting state to test Primeiro Login onboarding flow again (Simulate First Login)
  const handleResetToFirstLogin = () => {
    setCategories(DEFAULT_CATEGORIES);
    setIncomeSources(DEFAULT_INCOME_SOURCES);
    setTransactions([]);
    setPendingReceipts([]);
    setReceivables([]);
    setBankAccounts(DEFAULT_BANKS);
    setFirstLoginCompleted(false);
    try {
      localStorage.removeItem('finance_first_login_completed_v1');
      localStorage.removeItem('finance_categories');
      localStorage.removeItem('finance_income_sources');
      localStorage.removeItem('finance_pending_receipts');
      localStorage.removeItem('finance_receivables');
      localStorage.removeItem('finance_transactions');
      localStorage.removeItem('finance_bank_accounts');
    } catch {}
  };

  return (
    <div id="app-root-container" className="selection:bg-sky-200">
      {!firstLoginCompleted ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <Dashboard 
          categories={categories}
          incomeSources={incomeSources}
          initialPending={pendingReceipts}
          initialReceivables={receivables}
          initialTransactions={transactions}
          initialBankAccounts={bankAccounts}
          onReset={handleResetToFirstLogin}
        />
      )}
    </div>
  );
}

