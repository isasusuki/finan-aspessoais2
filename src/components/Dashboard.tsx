import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  TrendingUp, 
  Calendar, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Filter, 
  AlertTriangle, 
  Check, 
  Bell, 
  BellOff, 
  RotateCcw,
  Sparkles,
  DollarSign,
  Briefcase,
  HelpCircle,
  X,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  SlidersHorizontal,
  ThumbsUp,
  Coins
} from 'lucide-react';
import { 
  ExpenseCategory, 
  IncomeSource, 
  PendingReceipt, 
  Receivable, 
  Transaction,
  BankAccount
} from '../types';

interface DashboardProps {
  categories: ExpenseCategory[];
  incomeSources: IncomeSource[];
  initialPending: PendingReceipt[];
  initialReceivables: Receivable[];
  initialTransactions: Transaction[];
  initialBankAccounts: BankAccount[];
  onReset: () => void;
}

export default function Dashboard({ 
  categories: startingCategories, 
  incomeSources: startingSources, 
  initialPending, 
  initialReceivables, 
  initialTransactions,
  initialBankAccounts,
  onReset 
}: DashboardProps) {
  
  // App state
  const [categories, setCategories] = useState<ExpenseCategory[]>(startingCategories);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(startingSources);
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>(initialPending);
  const [receivables, setReceivables] = useState<Receivable[]>(initialReceivables);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);

  // Sync state back to local storage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem('finance_categories', JSON.stringify(categories));
      localStorage.setItem('finance_income_sources', JSON.stringify(incomeSources));
      localStorage.setItem('finance_pending_receipts', JSON.stringify(pendingReceipts));
      localStorage.setItem('finance_receivables', JSON.stringify(receivables));
      localStorage.setItem('finance_transactions', JSON.stringify(transactions));
      localStorage.setItem('finance_bank_accounts', JSON.stringify(bankAccounts));
    } catch (e) {
      console.error('Error syncing local state from dashboard', e);
    }
  }, [categories, incomeSources, pendingReceipts, receivables, transactions, bankAccounts]);

  // Selected bank states
  const [txBankAccount, setTxBankAccount] = useState('');
  const [selectedBankForPending, setSelectedBankForPending] = useState<Record<string, string>>({});
  const [selectedBankForReceivable, setSelectedBankForReceivable] = useState<Record<string, string>>({});

  // Quick Bank Balance Adjustment State
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [editingBankValue, setEditingBankValue] = useState('');

  // Active section for detailed operations / mobile view focus
  const [focusedSection, setFocusedSection] = useState<'pending' | 'revenue' | 'receivables' | 'expenses'>('expenses');
  
  // Transaction search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Interactive quick adding states
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategoryOrSource, setTxCategoryOrSource] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Quick addition states inside lists
  const [newPendingTitle, setNewPendingTitle] = useState('');
  const [newPendingAmount, setNewPendingAmount] = useState('');
  const [newPendingSource, setNewPendingSource] = useState('');

  const [newReceivableTitle, setNewReceivableTitle] = useState('');
  const [newReceivableAmount, setNewReceivableAmount] = useState('');
  const [newReceivableDate, setNewReceivableDate] = useState('');
  const [newReceivableSource, setNewReceivableSource] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger temporary notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Calculations
  const totalPendingSum = useMemo(() => {
    return pendingReceipts.reduce((sum, item) => sum + item.amount, 0);
  }, [pendingReceipts]);

  const totalRevenueSum = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [transactions]);

  const totalReceivableSum = useMemo(() => {
    return receivables
      .filter(r => r.status === 'pending')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [receivables]);

  const totalExpensesSum = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [transactions]);

  // Dynamically calculate spent on each category from transactions
  const updatedCategories = useMemo(() => {
    return categories.map(cat => {
      const totalSpentForCat = transactions
        .filter(t => t.type === 'expense' && t.categoryOrSource === cat.name)
        .reduce((sum, item) => sum + item.amount, 0);
      return {
        ...cat,
        spent: totalSpentForCat
      };
    });
  }, [categories, transactions]);

  // Dynamically calculated total received for each sources to display statistics
  const sourceRealizedSales = useMemo(() => {
    const stats: Record<string, number> = {};
    incomeSources.forEach(src => {
      stats[src.name] = transactions
        .filter(t => t.type === 'income' && t.categoryOrSource === src.name)
        .reduce((sum, item) => sum + item.amount, 0);
    });
    return stats;
  }, [incomeSources, transactions]);

  // Filtered transactions list
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.categoryOrSource.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'all' ? true : tx.type === typeFilter;
      return matchSearch && matchType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, typeFilter]);

  // Handle confirm pending receipt -> translates to a real confirmed Income transaction
  const handleConfirmPending = (pendingId: string, bankName: string) => {
    const pending = pendingReceipts.find(p => p.id === pendingId);
    if (!pending) return;

    // Remove from pending
    setPendingReceipts(pendingReceipts.filter(p => p.id !== pendingId));

    // Add to actual transactions
    const newTx: Transaction = {
      id: `real-${Date.now()}`,
      type: 'income',
      title: `[Confirmado] ${pending.title}`,
      amount: pending.amount,
      date: new Date().toISOString().split('T')[0],
      categoryOrSource: pending.source,
      bankAccount: bankName,
    };

    setTransactions([...transactions, newTx]);
    setBankAccounts(prev => prev.map(b => b.name === bankName ? { ...b, balance: b.balance + pending.amount } : b));
    triggerToast(`Recebimento de ${formatCurrency(pending.amount)} confirmado no ${bankName}!`);
  };

  // Add customized pending receipt
  const handleAddPending = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPendingTitle.trim() || !newPendingAmount) return;

    const newPending: PendingReceipt = {
      id: `p-${Date.now()}`,
      title: newPendingTitle.trim(),
      amount: Number(newPendingAmount),
      source: newPendingSource || incomeSources[0]?.name || 'Outros',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    };

    setPendingReceipts([...pendingReceipts, newPending]);
    setNewPendingTitle('');
    setNewPendingAmount('');
    triggerToast('Lançamento para "Receber Pendente" adicionado com sucesso!');
  };

  // Convert A Receber future item to confirmed today receipt
  const handleReceiveReceivable = (receivableId: string, bankName: string) => {
    const rec = receivables.find(r => r.id === receivableId);
    if (!rec) return;

    // Set status to received in state
    setReceivables(receivables.map(r => r.id === receivableId ? { ...r, status: 'received' } : r));

    // Add confirmed transaction
    const newTx: Transaction = {
      id: `real-${Date.now()}`,
      type: 'income',
      title: `[Compromisso Recebido] ${rec.title}`,
      amount: rec.amount,
      date: new Date().toISOString().split('T')[0],
      categoryOrSource: rec.source,
      bankAccount: bankName,
    };

    setTransactions([...transactions, newTx]);
    setBankAccounts(prev => prev.map(b => b.name === bankName ? { ...b, balance: b.balance + rec.amount } : b));
    triggerToast(`Valor futuro de ${formatCurrency(rec.amount)} recebido no ${bankName}!`);
  };

  // Add customized receivable
  const handleAddReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceivableTitle.trim() || !newReceivableAmount || !newReceivableDate) return;

    const newRec: Receivable = {
      id: `r-${Date.now()}`,
      title: newReceivableTitle.trim(),
      amount: Number(newReceivableAmount),
      dueDate: newReceivableDate,
      source: newReceivableSource || incomeSources[0]?.name || 'Outros',
      reminderActive: true,
      status: 'pending',
    };

    setReceivables([...receivables, newRec]);
    setNewReceivableTitle('');
    setNewReceivableAmount('');
    setNewReceivableDate('');
    triggerToast('Futuro "A Receber" agendado com lembrete!');
  };

  // Toggle reminder trigger
  const toggleReminder = (id: string) => {
    setReceivables(receivables.map(r => {
      if (r.id === id) {
        const nextState = !r.reminderActive;
        triggerToast(nextState ? `Notificação ativa para: ${r.title}` : `Aviso desativo para: ${r.title}`);
        return { ...r, reminderActive: nextState };
      }
      return r;
    }));
  };

  // Add a direct Transaction from Modal
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount) return;

    const amt = Number(txAmount);
    const selCatOrSrc = txCategoryOrSource || (txType === 'expense' ? updatedCategories[0]?.name : incomeSources[0]?.name);
    const selBankAccount = txBankAccount || bankAccounts[0]?.name || 'Nubank';

    // If it's an expense, check if we have enough balance in the bank account!
    if (txType === 'expense') {
      const selectedAccount = bankAccounts.find(acc => acc.name === selBankAccount);
      if (selectedAccount && selectedAccount.balance < amt) {
        triggerToast(`❌ Erro: Saldo insuficiente no banco ${selBankAccount}! Saldo disponível: ${formatCurrency(selectedAccount.balance)}`);
        return; // Halt transaction registration!
      }
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: txType,
      title: txTitle.trim(),
      amount: amt,
      date: txDate,
      categoryOrSource: selCatOrSrc,
      bankAccount: selBankAccount,
    };

    setTransactions([...transactions, newTx]);

    // Update the selected bank balance
    setBankAccounts(prev => prev.map(acc => {
      if (acc.name === selBankAccount) {
        return { 
          ...acc, 
          balance: txType === 'expense' ? acc.balance - amt : acc.balance + amt 
        };
      }
      return acc;
    }));

    setShowAddTransactionModal(false);
    setTxTitle('');
    setTxAmount('');
    setTxCategoryOrSource('');
    setTxBankAccount('');

    // If it's an expense, check if it triggers limit warning
    if (txType === 'expense') {
      const matchCat = updatedCategories.find(c => c.name === selCatOrSrc);
      if (matchCat) {
        const nextSpent = matchCat.spent + amt;
        if (nextSpent > matchCat.limit) {
          triggerToast(`⚠️ Alerta: A categoria "${selCatOrSrc}" ultrapassou o orçamento limite de ${formatCurrency(matchCat.limit)}!`);
          return;
        }
      }
    }

    triggerToast(`Lançamento de ${txType === 'expense' ? 'Gasto' : 'Receita'} registrado!`);
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(transactions.filter(t => t.id !== id));

    // Reverse bank balance modification
    setBankAccounts(prev => prev.map(acc => {
      if (acc.name === tx.bankAccount) {
        return {
          ...acc,
          balance: tx.type === 'expense' ? acc.balance + tx.amount : acc.balance - tx.amount
        };
      }
      return acc;
    }));

    triggerToast('Lançamento removido permanentemente.');
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getUrgentWarnings = useMemo(() => {
    return updatedCategories.filter(c => c.spent > c.limit);
  }, [updatedCategories]);

  // Quick SVG coordinates builder for the evolution chart (evolution of receitas/gastos over 7 days)
  // We'll calculate mock aggregated sums for visual timeline.
  const chartData = useMemo(() => {
    // Generate last 7 days representation
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    return days.map(dayStr => {
      const dayTransactions = transactions.filter(t => t.date === dayStr);
      const inc = dayTransactions.filter(t => t.type === 'income').reduce((s, item) => s + item.amount, 0);
      const exp = dayTransactions.filter(t => t.type === 'expense').reduce((s, item) => s + item.amount, 0);
      return {
        label: dayStr.split('-').slice(1, 3).reverse().join('/'), // format as DD/MM
        income: inc,
        expense: exp,
      };
    });
  }, [transactions]);

  return (
    <div id="dashboard-container" className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      
      {/* Dynamic Toast Alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            id="toast-alert"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700/50 flex items-center gap-3 max-w-sm"
          >
            <div className="p-1 rounded-full bg-emerald-500 text-white">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold leading-tight">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Top Header */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Title Group */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E8FA] border border-sky-300 flex items-center justify-center text-sky-800 shadow-xs">
              <Sparkles className="w-5.5 h-5.5 text-sky-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Finanças Pessoais</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF7EE] text-emerald-700 border border-emerald-200/30">Primeiro Acesso Concluído</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Controle de caixa pastel simples, leve e acolhedor.</p>
            </div>
          </div>

          {/* Quick Header Navigation Actions */}
          <div className="flex items-center gap-3">
            
            {/* Direct Quick Add Launch */}
            <button
              id="btn-open-quick-add"
              onClick={() => {
                setTxType('expense');
                setShowAddTransactionModal(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Novo Lançamento
            </button>

            {/* Back to First Login Simulator (Onboarding) */}
            <button
              id="btn-simulate-first-login"
              onClick={onReset}
              className="px-3.5 py-2 text-xs font-bold text-purple-700 hover:text-purple-800 bg-[#F5EEFB] border border-purple-200/50 hover:border-purple-300 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              title="Voltar para a simulação de Primeiro Login"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Simular Primeiro Login
            </button>

          </div>

        </div>
      </header>

      {/* Content Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Urgent Warning Announcement if any Category is Overdrafted */}
        {getUrgentWarnings.length > 0 && (
          <motion.div 
            id="overdraft-warning-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3.5 text-amber-900 shadow-xs"
          >
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 mt-0.5 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800">Atenção ao Limite Orçamentário</h4>
              <p className="text-sm font-medium mt-1">
                Suas categorias de gastos ultrapassaram o teto planejado para este mês:{' '}
                {getUrgentWarnings.map((c, idx) => (
                  <span key={c.id} className="font-extrabold text-amber-950">
                    {c.name} ({formatCurrency(c.spent)} de {formatCurrency(c.limit)})
                    {idx < getUrgentWarnings.length - 1 ? ', ' : '.'}
                  </span>
                ))}
              </p>
            </div>
          </motion.div>
        )}

        {/* 1. Main 4 Pastel Cards Showcase - Bento Grid 2x2 layout matching design guidelines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-wider text-[#636E72]/85 uppercase block">Resumo Financeiro • Bento Grid</span>
            <span className="text-xs text-[#636E72]/70 font-medium">Selecione uma carta para ver o detalhamento interativo abaixo</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Receber Pendente (Lilás) */}
            <motion.div 
              id="card-receber-pendente"
              whileHover={{ scale: 1.015 }}
              onClick={() => setFocusedSection('pending')}
              className={`rounded-[40px] p-8 flex flex-col justify-between min-h-[190px] cursor-pointer transition-all border-2 ${
                focusedSection === 'pending' 
                  ? 'bg-[#F3E8FF] border-[#C084FC] ring-8 ring-[#F3E8FF]/60 shadow-md scale-[1.01]' 
                  : 'bg-[#F3E8FF]/90 border-[#D8B4FE]/80 hover:border-[#C084FC] hover:scale-[1.01] shadow-xs'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xs text-purple-600 shrink-0">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#5B21B6]">Receber Pendente</h3>
                  <span className="text-xs text-[#7C3AED]/70 font-semibold">{pendingReceipts.length} transações aguardando</span>
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-xs text-[#7C3AED] font-semibold uppercase tracking-wider mb-1">Aguardando Liberação</p>
                  <p className="text-4xl md:text-5xl font-extrabold text-[#4C1D95] font-sans">{formatCurrency(totalPendingSum)}</p>
                </div>
                <ChevronRight className={`w-6 h-6 text-purple-600 transition-transform ${focusedSection === 'pending' ? 'translate-x-1.5' : ''}`} />
              </div>
            </motion.div>
 
            {/* Receita Confirmed (Verde) */}
            <motion.div 
              id="card-receita"
              whileHover={{ scale: 1.015 }}
              onClick={() => setFocusedSection('revenue')}
              className={`rounded-[40px] p-8 flex flex-col justify-between min-h-[190px] cursor-pointer transition-all border-2 ${
                focusedSection === 'revenue' 
                  ? 'bg-[#DCFCE7] border-[#4ADE80] ring-8 ring-[#DCFCE7]/60 shadow-md scale-[1.01]' 
                  : 'bg-[#DCFCE7]/90 border-[#86EFAC]/80 hover:border-[#4ADE80] hover:scale-[1.01] shadow-xs'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xs text-emerald-600 shrink-0">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#166534]">Receita</h3>
                  <span className="text-xs text-[#15803D]/70 font-semibold">Entradas consolidadas</span>
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-xs text-[#15803D] font-semibold uppercase tracking-wider mb-1">Total Confirmado</p>
                  <p className="text-4xl md:text-5xl font-extrabold text-[#064E3B] font-sans">{formatCurrency(totalRevenueSum)}</p>
                </div>
                <ChevronRight className={`w-6 h-6 text-emerald-600 transition-transform ${focusedSection === 'revenue' ? 'translate-x-1.5' : ''}`} />
              </div>
            </motion.div>
 
            {/* A Receber Future (Pêssego) */}
            <motion.div 
              id="card-a-receber"
              whileHover={{ scale: 1.015 }}
              onClick={() => setFocusedSection('receivables')}
              className={`rounded-[40px] p-8 flex flex-col justify-between min-h-[190px] cursor-pointer transition-all border-2 ${
                focusedSection === 'receivables' 
                  ? 'bg-[#FFEDD5] border-[#FB923C] ring-8 ring-[#FFEDD5]/60 shadow-md scale-[1.01]' 
                  : 'bg-[#FFEDD5]/90 border-[#FDBA74]/80 hover:border-[#FB923C] hover:scale-[1.01] shadow-xs'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xs text-amber-600 shrink-0">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#9A3412]">A Receber</h3>
                  <span className="text-xs text-[#C2410C]/70 font-semibold">{receivables.filter(r => r.status === 'pending').length} agendamentos futuros</span>
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-xs text-[#C2410C] font-semibold uppercase tracking-wider mb-1">Previsão Mensal</p>
                  <p className="text-4xl md:text-5xl font-extrabold text-[#7C2D12] font-sans">{formatCurrency(totalReceivableSum)}</p>
                </div>
                <ChevronRight className={`w-6 h-6 text-amber-600 transition-transform ${focusedSection === 'receivables' ? 'translate-x-1.5' : ''}`} />
              </div>
            </motion.div>
 
            {/* Gastos (Azul) */}
            <motion.div 
              id="card-gastos"
              whileHover={{ scale: 1.015 }}
              onClick={() => setFocusedSection('expenses')}
              className={`rounded-[40px] p-8 flex flex-col justify-between min-h-[190px] cursor-pointer transition-all border-2 ${
                focusedSection === 'expenses' 
                  ? 'bg-[#E0F2FE] border-[#38BDF8] ring-8 ring-[#E0F2FE]/60 shadow-md scale-[1.01]' 
                  : 'bg-[#E0F2FE]/90 border-[#7DD3FC]/80 hover:border-[#38BDF8] hover:scale-[1.01] shadow-xs'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xs text-sky-600 shrink-0">
                  <TrendingDown className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#075985]">Gastos</h3>
                  <span className="text-xs text-[#0369A1]/70 font-semibold">Orçamento consumido</span>
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-xs text-[#0369A1] font-semibold uppercase tracking-wider mb-1">Despesas Lançadas</p>
                  <p className="text-4xl md:text-5xl font-extrabold text-[#0C4A6E] font-sans">{formatCurrency(totalExpensesSum)}</p>
                </div>
                <ChevronRight className={`w-6 h-6 text-sky-600 transition-transform ${focusedSection === 'expenses' ? 'translate-x-1.5' : ''}`} />
              </div>
            </motion.div>
 
          </div>
        </div>

        {/* CONTAS BANCÁRIAS E SALDOS DISPONÍVEIS */}
        <div id="bank-accounts-bento-section" className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm md:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-indigo-500 shrink-0" />
                Contas Bancárias e Saldos Ativos
              </h2>
              <p className="text-[11px] md:text-xs text-slate-500 font-medium">
                Saldos disponíveis para débito. Lançamentos de despesa são validados contra esses limites para evitar estouro de saldo.
              </p>
            </div>
            <div className="text-[10px] uppercase font-extrabold text-slate-450 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-full self-start flex items-center gap-1.5">
              <span>Saldos Consolidados:</span> 
              <span className="font-mono text-xs font-black text-slate-900">
                {formatCurrency(bankAccounts.reduce((sum, a) => sum + a.balance, 0))}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bankAccounts.map(account => {
              const isEditing = editingBankId === account.id;

              return (
                <div 
                  key={account.id}
                  id={`bank-card-${account.id}`}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[110px] ${account.color} hover:shadow-xs`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black tracking-wider uppercase text-slate-700/85">{account.name}</span>
                    <span className="text-[9px] py-0.5 px-1.5 bg-white/70 text-slate-800 rounded font-extrabold uppercase tracking-widest shrink-0">
                      Ok
                    </span>
                  </div>

                  <div className="mt-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          id={`input-adjust-balance-${account.id}`}
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={editingBankValue}
                          onChange={(e) => setEditingBankValue(e.target.value)}
                          className="w-full bg-white text-slate-800 font-mono text-xs font-bold rounded-lg px-2 py-1 outline-hidden border border-slate-300 focus:ring-1 focus:ring-slate-400"
                        />
                        <button
                          id={`btn-save-balance-${account.id}`}
                          onClick={() => {
                            const newBalance = Number(editingBankValue);
                            if (!isNaN(newBalance)) {
                              setBankAccounts(prev => prev.map(b => b.id === account.id ? { ...b, balance: newBalance } : b));
                              triggerToast(`Saldo de ${account.name} ajustado manualmente para ${formatCurrency(newBalance)}`);
                            }
                            setEditingBankId(null);
                            setEditingBankValue('');
                          }}
                          className="p-1 px-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-black text-xs"
                          title="Salvar"
                        >
                          Salvar
                        </button>
                        <button
                          id={`btn-cancel-balance-${account.id}`}
                          onClick={() => {
                            setEditingBankId(null);
                            setEditingBankValue('');
                          }}
                          className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-semibold text-xs"
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xl md:text-2xl font-black font-mono tracking-tight text-slate-900">
                          {formatCurrency(account.balance)}
                        </span>
                        <button
                          id={`btn-edit-balance-${account.id}`}
                          onClick={() => {
                            setEditingBankId(account.id);
                            setEditingBankValue(account.balance.toString());
                          }}
                          className="text-[9px] font-bold text-slate-500 hover:text-slate-900 bg-white/70 hover:bg-white border border-slate-200/60 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                          title="Ajustar saldo inicial"
                        >
                          Ajustar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Double-column: Interactive Charts vs Categories & Limits Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Visual SVG Chart of evolution & cash flow (Evolution of Receita vs Gastos over the past days) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Histórico de Fluxo de Caixa</h3>
                <p className="text-xs text-slate-500 font-medium">Visualização intuitiva rápida de entradas vs saídas registrados.</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-3 h-3 rounded bg-emerald-400 inline-block"></span>
                  <span className="text-slate-600">Receitas</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-3 h-3 rounded bg-sky-400 inline-block"></span>
                  <span className="text-slate-600">Gastos</span>
                </div>
              </div>
            </div>

            {/* SVG Visual Graphic Chart (Safe, perfectly aligned responsive custom graphic) */}
            <div className="h-64 w-full relative pt-2">
              <svg className="w-full h-full" viewBox="0 0 540 180" preserveAspectRatio="none">
                {/* Horizontal guide grids */}
                <line x1="20" y1="20" x2="520" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="70" x2="520" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="120" x2="520" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="160" x2="520" y2="160" stroke="#f8fafc" strokeWidth="1.5" />

                {/* Draw side value captions */}
                <text x="5" y="24" className="text-[9px] fill-slate-300 font-mono font-bold">R$ 4k</text>
                <text x="5" y="74" className="text-[9px] fill-slate-300 font-mono font-bold">R$ 2k</text>
                <text x="5" y="124" className="text-[9px] fill-slate-300 font-mono font-bold">R$ 0</text>

                {/* Draw bar representations / Line representations for data dynamically */}
                {chartData.map((day, idx) => {
                  const padding = 65;
                  const x = 50 + idx * padding;
                  
                  // Math scales to represent maximum mock limits
                  const maxValForScale = 4500;
                  const revenueY = 160 - (Math.min(day.income, maxValForScale) / maxValForScale) * 130;
                  const expenseY = 160 - (Math.min(day.expense, maxValForScale) / maxValForScale) * 130;

                  return (
                    <g key={idx}>
                      {/* Revenue Bar - Emerald Green Pastel */}
                      {day.income > 0 && (
                        <rect 
                          x={x - 8} 
                          y={revenueY} 
                          width="7" 
                          height={160 - revenueY} 
                          fill="#D4F0DB" 
                          stroke="#a7e3b6"
                          strokeWidth="0.5"
                          rx="2"
                        />
                      )}
                      
                      {/* Expense Bar - Sky Blue Pastel */}
                      {day.expense > 0 && (
                        <rect 
                          x={x + 1} 
                          y={expenseY} 
                          width="7" 
                          height={160 - expenseY} 
                          fill="#D3E8FA" 
                          stroke="#9fcbf5"
                          strokeWidth="0.5"
                          rx="2"
                        />
                      )}

                      {/* Interactive dot tooltips */}
                      {day.income > 0 && <circle cx={x - 4.5} cy={revenueY} r="2.5" fill="#10b981" />}
                      {day.expense > 0 && <circle cx={x + 4.5} cy={expenseY} r="2.5" fill="#0284c7" />}

                      {/* Day Label Text */}
                      <text 
                        x={x} 
                        y="176" 
                        textAnchor="middle" 
                        className="text-[10px] fill-slate-400 font-semibold font-mono"
                      >
                        {day.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Zeroed alert label if currently dry */}
              {totalRevenueSum === 0 && totalExpensesSum === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100/50 backdrop-blur-[1px] text-center p-4">
                  <div className="max-w-xs">
                    <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />
                      App pronto para novos lançamentos
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      Crie um Novo Lançamento ou adicione transações para ver o gráfico de fluxo se formar dinamicamente.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Budget Categories limit overview container - De onde sai o dinheiro check */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
                  <span>Limites Estimados</span>
                  <span className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">Gastos</span>
                </h3>
                <p className="text-xs text-slate-500">De onde está saindo o seu dinheiro e o progresso em relação aos limites de aviso.</p>
              </div>

              {/* Progress bars list */}
              <div className="space-y-4.5 pt-2">
                {updatedCategories.map(cat => {
                  const percentage = Math.min((cat.spent / cat.limit) * 100, 100);
                  const isOver = cat.spent > cat.limit;
                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{cat.name}</span>
                        <div className="font-mono text-[11px] text-slate-500">
                          <span className={`${isOver ? 'text-rose-600 font-extrabold' : 'text-slate-700 font-bold'}`}>
                            {formatCurrency(cat.spent)}
                          </span>{' '}
                          / <span className="font-medium text-slate-400">{formatCurrency(cat.limit)}</span>
                        </div>
                      </div>
                      
                      {/* Bar Track */}
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/30">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6 }}
                          className={`h-full rounded-full ${
                            isOver 
                              ? 'bg-gradient-to-r from-rose-400 to-rose-500' 
                              : percentage > 80 
                                ? 'bg-[#FDF1EB]' // orange warning pastel
                                : 'bg-[#D3E8FA]' // sky blue safe pastel
                          }`}
                        />
                      </div>

                      {/* Warning indicators */}
                      {isOver ? (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-rose-600">
                          <AlertTriangle className="w-3 h-3 shrink-0" /> Excedeu teto planejado em {formatCurrency(cat.spent - cat.limit)}
                        </div>
                      ) : percentage > 85 ? (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-amber-500">
                          <AlertTriangle className="w-3 h-3 shrink-0" /> Restam apenas {formatCurrency(cat.limit - cat.spent)}
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-400">Até agora consumiu {percentage.toFixed(0)}% do planejado</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick action to configure limits or add category */}
            <div className="pt-4 border-t border-slate-100/80 mt-4">
              <button 
                id="btn-add-cat-dash"
                onClick={() => {
                  setTxType('expense');
                  setShowAddTransactionModal(true);
                }}
                className="w-full text-center py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Registrar Gasto</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* 3. Section focus interaction & detailed list of transactions / pending / receivables */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          
          {/* Dynamic selector banner - matching the 4 categories explicitly */}
          <div className="bg-slate-50 border-b border-slate-200/60 p-4 flex flex-wrap items-center justify-between gap-3">
            
            {/* Action Segmented Controller Selector */}
            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200/50 shadow-2xs">
              <button
                id="btn-focus-expenses"
                onClick={() => setFocusedSection('expenses')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  focusedSection === 'expenses' 
                    ? 'bg-[#ECF5FC] text-sky-800 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TrendingDown className="w-4 h-4" /> Gastos
              </button>
              
              <button
                id="btn-focus-revenue"
                onClick={() => setFocusedSection('revenue')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  focusedSection === 'revenue' 
                    ? 'bg-[#EAF7EE] text-emerald-800 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Receitas
              </button>

              <button
                id="btn-focus-receivables"
                onClick={() => setFocusedSection('receivables')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  focusedSection === 'receivables' 
                    ? 'bg-[#FDF1EB] text-amber-800 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4" /> A Receber
              </button>

              <button
                id="btn-focus-pending"
                onClick={() => setFocusedSection('pending')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  focusedSection === 'pending' 
                    ? 'bg-[#F5EEFB] text-purple-800 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" /> Receber Pendente
              </button>
            </div>

            {/* Sub text descriptor */}
            <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wide">DETALHAMENTO INTERATIVO</span>

          </div>

          <div className="p-6">
            
            {/* SUBSECTION A: GASTOS */}
            {focusedSection === 'expenses' && (
              <div id="section-expenses" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100/40 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Histórico de Gastos por Categoria</h3>
                    <p className="text-xs text-slate-500 mt-1">Veja para onde vai o seu suado dinheiro. Adicione novas categorias e planeje melhor.</p>
                  </div>
                  <button
                    id="btn-add-expense-direct"
                    onClick={() => {
                      setTxType('expense');
                      setShowAddTransactionModal(true);
                    }}
                    className="self-start px-3.5 py-2 text-xs font-bold text-sky-800 bg-[#ECF5FC] border border-sky-200/40 hover:bg-[#D3E8FA] rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Novo Lançamento de Gasto
                  </button>
                </div>

                {/* Grid layout containing transactional filters & table list */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left part of Expenses: Transaction table listing */}
                  <div className="lg:col-span-2 space-y-4">
                    
                    {/* Filter bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          id="search-expense-input"
                          type="text"
                          placeholder="Pesquisar nos gastos ou categorias..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9.5 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">Filtrando Gastos</span>
                    </div>

                    {/* Listing content */}
                    <div className="space-y-2">
                      {filteredTransactions.filter(t => t.type === 'expense').length === 0 ? (
                        <div className="text-center py-10 bg-slate-50/50 border border-slate-100 rounded-2xl">
                          <p className="text-xs font-bold text-slate-500">Nenhum gasto correspondente encontrado.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Clique em "Novo Lançamento" para cadastrar sua primeira despespa.</p>
                        </div>
                      ) : (
                        filteredTransactions.filter(t => t.type === 'expense').map(tx => (
                          <div 
                            key={tx.id} 
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 hover:shadow-2xs transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                                <TrendingDown className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">{tx.title}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded">
                                    {tx.categoryOrSource}
                                  </span>
                                  {tx.bankAccount && (
                                    <span className="px-1.5 py-0.5 bg-[#ECF5FC] text-[10px] font-bold text-sky-800 rounded border border-sky-250/20">
                                      {tx.bankAccount}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-medium font-mono">
                                    {tx.date.split('-').reverse().join('/')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-extrabold text-slate-900 font-mono">
                                - {formatCurrency(tx.amount)}
                              </span>
                              <button
                                id={`delete-tx-${tx.id}`}
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="p-1.5 text-slate-350 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                title="Deletar Lançamento"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right part: category listing budgets check list */}
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 space-y-4">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Fontes Planejadoras</span>
                    <p className="text-[11px] text-slate-500">Ao contrário de receitas, que trazem dinheiro, os gastos de cada categoria somam e enviam alertas se passarem de seus tetos planejados no primeiro login.</p>
                    
                    <div className="space-y-3">
                      {updatedCategories.map(cat => (
                        <div key={cat.id} className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold block text-slate-800">{cat.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Limite R$ {cat.limit}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            cat.spent > cat.limit 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {cat.spent > 0 ? `Gasto ${formatCurrency(cat.spent)}` : 'Nenhum Gasto'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SUBSECTION B: RECEITAS */}
            {focusedSection === 'revenue' && (
              <div id="section-revenue" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100/40 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Acompanhamento das Receitas Consolidadas</h3>
                    <p className="text-xs text-slate-500 mt-1">Aqui você visualiza todas as entradas de dinheiro consolidadas no caixa.</p>
                  </div>
                  <button
                    id="btn-add-revenue-direct"
                    onClick={() => {
                      setTxType('income');
                      setShowAddTransactionModal(true);
                    }}
                    className="self-start px-3.5 py-2 text-xs font-bold text-emerald-800 bg-[#EAF7EE] border border-emerald-200/40 hover:bg-[#D4F0DB] rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Novo Lançamento de Receita
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Receitas Listing */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-2">
                      {filteredTransactions.filter(t => t.type === 'income').length === 0 ? (
                        <div className="text-center py-12 bg-slate-50/50 border border-slate-100 rounded-2xl">
                          <p className="text-xs font-bold text-slate-500">Seu primeiro saldo de receitas está zerado.</p>
                          <p className="text-[10px] text-slate-400 mt-1.5">No "Primeiro login" as receitas começam zeradas. Adicione uma nova ou confirme um item pendente acima.</p>
                        </div>
                      ) : (
                        filteredTransactions.filter(t => t.type === 'income').map(tx => (
                          <div 
                            key={tx.id} 
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 hover:shadow-2xs transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <TrendingUp className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">{tx.title}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-[10px] font-bold text-emerald-700 rounded border border-emerald-200/10">
                                    {tx.categoryOrSource}
                                  </span>
                                  {tx.bankAccount && (
                                    <span className="px-1.5 py-0.5 bg-[#EAF7EE] text-[10px] font-bold text-emerald-800 rounded border border-emerald-250/20">
                                      {tx.bankAccount}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-medium font-mono">
                                    {tx.date.split('-').reverse().join('/')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-extrabold text-emerald-700 font-mono">
                                + {formatCurrency(tx.amount)}
                              </span>
                              <button
                                id={`delete-tx-${tx.id}`}
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="p-1.5 text-slate-350 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                title="Deletar Receita"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Sources realized review */}
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 space-y-4">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Entradas por Fonte</span>
                    <p className="text-[11px] text-slate-500">Veja o quanto já entrou de bônus por cada uma das suas fontes de receita configuradas:</p>
                    
                    <div className="space-y-2.5">
                      {incomeSources.map(src => {
                        const realized = sourceRealizedSales[src.name] || 0;
                        const expected = src.expectedAmount;
                        const pct = Math.min((realized / expected) * 100, 100);

                        return (
                          <div key={src.id} className="p-3 bg-white rounded-xl border border-slate-100/80 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700">{src.name}</span>
                              <span className="font-bold text-emerald-700 font-mono">{formatCurrency(realized)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span>Meta estimada</span>
                              <span className="font-mono">{formatCurrency(expected)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SUBSECTION C: A RECEBER (FUTURE COMMITMENTS WITH DATES AND NOTIFY REMINDER) */}
            {focusedSection === 'receivables' && (
              <div id="section-receivables" className="space-y-6">
                <div className="flex items-center justify-between border-b border-orange-100/40 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Salários e Compromissos a Receber</h3>
                    <p className="text-xs text-slate-500 mt-1">Agende suas fendas futuras que vão entrar de forma agendada no seu balanço, configure alertas.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Receivables scheduled entries with reminder option */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-2">
                      {receivables.filter(r => r.status === 'pending').length === 0 ? (
                        <div className="text-center py-10 bg-slate-50/50 border border-slate-100 rounded-2xl">
                          <p className="text-xs font-bold text-slate-500">Sem compromissos futuros agendados.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Preencha o painel lateral ao lado para introduzir um novo.</p>
                        </div>
                      ) : (
                        receivables.filter(r => r.status === 'pending').map(rec => (
                          <div 
                            key={rec.id} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 gap-3 hover:shadow-2xs transition-all"
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 self-start sm:self-center">
                                <Calendar className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">{rec.title}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 bg-[#FDF1EB] text-[10px] font-bold text-amber-800 rounded">
                                    {rec.source}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                    <span>Vence em:</span>
                                    <span className="font-mono text-slate-600 font-bold">
                                      {rec.dueDate.split('-').reverse().join('/')}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                              <span className="text-sm font-extrabold text-slate-900 font-mono">
                                {formatCurrency(rec.amount)}
                              </span>
                              
                              <div className="flex items-center gap-1.5">
                                {/* Reminder alarm activation toggle */}
                                <button
                                  id={`btn-toggle-reminder-${rec.id}`}
                                  onClick={() => toggleReminder(rec.id)}
                                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                    rec.reminderActive 
                                      ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                                      : 'text-slate-350 hover:text-slate-500 hover:bg-slate-100'
                                  }`}
                                  title={rec.reminderActive ? 'Desativar notificação futura' : 'Ativar notificação de aviso'}
                                >
                                  {rec.reminderActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                </button>

                                {/* Direct receiving confirm action */}
                                <select
                                  id={`select-bank-rec-${rec.id}`}
                                  value={selectedBankForReceivable[rec.id] || bankAccounts[0]?.name || 'Nubank'}
                                  onChange={(e) => setSelectedBankForReceivable(prev => ({ ...prev, [rec.id]: e.target.value }))}
                                  className="text-[10px] bg-white border border-slate-250 rounded-lg px-2 py-1 outline-hidden font-semibold text-slate-700 cursor-pointer"
                                >
                                  {bankAccounts.map(b => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                  ))}
                                </select>

                                <button
                                  id={`btn-receive-rec-${rec.id}`}
                                  onClick={() => handleReceiveReceivable(rec.id, selectedBankForReceivable[rec.id] || bankAccounts[0]?.name || 'Nubank')}
                                  className="px-2.5 py-1.5 bg-[#EAF7EE] text-emerald-800 border border-emerald-200/50 hover:bg-[#D4F0DB] text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 animate-pulse"
                                >
                                  <Check className="w-3.5 h-3.5" /> Receber hoje
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Quick Add Receivable */}
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 space-y-4">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Agendar Futuro Compromisso</span>
                    <form onSubmit={handleAddReceivable} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Título do Compromisso</label>
                        <input
                          id="input-new-rec-title"
                          type="text"
                          placeholder="Ex: Pagamento Consultoria B"
                          value={newReceivableTitle}
                          onChange={(e) => setNewReceivableTitle(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Valor (R$)</label>
                          <input
                            id="input-new-rec-amount"
                            type="number"
                            placeholder="1200"
                            value={newReceivableAmount}
                            onChange={(e) => setNewReceivableAmount(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data</label>
                          <input
                            id="input-new-rec-date"
                            type="date"
                            value={newReceivableDate}
                            onChange={(e) => setNewReceivableDate(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fonte Vinculada</label>
                        <select
                          id="select-new-rec-source"
                          value={newReceivableSource}
                          onChange={(e) => setNewReceivableSource(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden"
                        >
                          {incomeSources.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        id="btn-add-rec-submit"
                        type="submit"
                        className="w-full py-2.5 bg-[#FDF1EB] hover:bg-[#FAD9CA] text-amber-900 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Agendar Lançamento
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            )}

            {/* SUBSECTION D: RECEBER PENDENTE (PENDING APPROVALS WITH CONFIRM MOVING ACTION) */}
            {focusedSection === 'pending' && (
              <div id="section-pending" className="space-y-6">
                <div className="flex items-center justify-between border-b border-purple-100/40 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Transferências e Pix em Processamento</h3>
                    <p className="text-xs text-slate-500 mt-1">Valores que ainda dependem de compensação bancária ou liberação. Confirme e transfira ao saldo ativo.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: List of pending items */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-2">
                      {pendingReceipts.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50/50 border border-slate-100 rounded-2xl">
                          <p className="text-xs font-bold text-slate-500 font-sans">Sem transferências pendentes.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Crie um novo Pix ou recebimento de aprovação ao lado.</p>
                        </div>
                      ) : (
                        pendingReceipts.map(pend => (
                          <div 
                            key={pend.id} 
                            className="p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                                <Clock className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">{pend.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 bg-[#F5EEFB] text-[10px] font-bold text-purple-800 rounded">
                                    {pend.source}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    {pend.status === 'processing' ? 'Em Processamento' : 'Aguardando Liberação'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                              <span className="text-sm font-extrabold text-slate-900 font-mono">
                                {formatCurrency(pend.amount)}
                              </span>
                              
                              <select
                                id={`select-bank-pend-${pend.id}`}
                                value={selectedBankForPending[pend.id] || bankAccounts[0]?.name || 'Nubank'}
                                onChange={(e) => setSelectedBankForPending(prev => ({ ...prev, [pend.id]: e.target.value }))}
                                className="text-[10px] bg-white border border-slate-205 rounded-lg px-2 py-1 outline-hidden font-semibold text-slate-700 cursor-pointer"
                              >
                                {bankAccounts.map(b => (
                                  <option key={b.id} value={b.name}>{b.name}</option>
                                ))}
                              </select>

                              <button
                                id={`btn-confirm-pend-${pend.id}`}
                                onClick={() => handleConfirmPending(pend.id, selectedBankForPending[pend.id] || bankAccounts[0]?.name || 'Nubank')}
                                className="px-3 py-1.5 bg-[#F5EEFB] hover:bg-[#EBD9F7] text-purple-900 hover:text-purple-950 text-xs font-bold rounded-lg cursor-pointer transition-all border border-purple-200/50 flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5 text-purple-700" /> Confirmar Pix
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Quick Add Pending */}
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 space-y-4">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Lançar Pix / Transferência</span>
                    <form onSubmit={handleAddPending} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Título do Recebimento</label>
                        <input
                          id="input-new-pending-title"
                          type="text"
                          placeholder="Ex: Pix Venda Videogame"
                          value={newPendingTitle}
                          onChange={(e) => setNewPendingTitle(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Valor do Pix (R$)</label>
                        <input
                          id="input-new-pending-amount"
                          type="number"
                          placeholder="350"
                          value={newPendingAmount}
                          onChange={(e) => setNewPendingAmount(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vincular à Origem</label>
                        <select
                          id="select-new-pending-source"
                          value={newPendingSource}
                          onChange={(e) => setNewPendingSource(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden"
                        >
                          {incomeSources.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        id="btn-add-pending-submit"
                        type="submit"
                        className="w-full py-2.5 bg-[#F5EEFB] hover:bg-[#EBD9F7] text-purple-900 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Registrar Processamento
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* 4. Full interactive Add Lançamento Dynamic Dialog Modal */}
      {showAddTransactionModal && (
        <div id="transaction-modal-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-150 p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Novo Lançamento Rápido</h3>
                <p className="text-[11px] text-slate-400">Insira as informações do fluxo financeiro.</p>
              </div>
              <button 
                id="btn-close-modal"
                onClick={() => setShowAddTransactionModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTransaction} className="p-5 space-y-4">
              
              {/* Type toggle selection */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Tipo de Lançamento</label>
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl gap-1">
                  <button
                    id="modal-tx-type-expense"
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      txType === 'expense' 
                        ? 'bg-[#ECF5FC] text-sky-800 shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Gasto / Saída
                  </button>
                  <button
                    id="modal-tx-type-income"
                    type="button"
                    onClick={() => setTxType('income')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      txType === 'income' 
                        ? 'bg-[#EAF7EE] text-emerald-800 shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Receita / Entrada
                  </button>
                </div>
              </div>

              {/* Title Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
                <input
                  id="modal-tx-title"
                  type="text"
                  required
                  placeholder="Ex: Compra Assinatura Netflix"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Valor (R$)</label>
                  <input
                    id="modal-tx-amount"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data</label>
                  <input
                    id="modal-tx-date"
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {/* Dynamic Categories matching layout selected type */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {txType === 'expense' ? 'Classificação / Categoria' : 'Origem / Fonte'}
                </label>
                <select
                  id="modal-tx-category-select"
                  value={txCategoryOrSource}
                  onChange={(e) => setTxCategoryOrSource(e.target.value)}
                  className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">Selecione uma opção...</option>
                  {txType === 'expense' 
                    ? updatedCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                    : incomeSources.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                  }
                </select>
              </div>

              {/* Bank Account Selection (De onde o dinheiro vem ou para onde vai) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {txType === 'expense' ? 'Origem do Dinheiro (Qual Conta/Banco?)' : 'Destino do Dinheiro (Qual Conta/Banco?)'}
                </label>
                <select
                  id="modal-tx-bank-select"
                  required
                  value={txBankAccount}
                  onChange={(e) => setTxBankAccount(e.target.value)}
                  className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">Selecione uma conta...</option>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.name}>{b.name} (Saldo: {formatCurrency(b.balance)})</option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                id="modal-tx-submit"
                type="submit"
                className={`w-full py-3.5 font-extrabold text-xs tracking-wider uppercase text-white rounded-xl cursor-pointer transition-all ${
                  txType === 'expense' 
                    ? 'bg-slate-900 hover:bg-slate-800' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Registrar no Caixa
              </button>

            </form>
          </motion.div>
        </div>
      )}

      {/* Aesthetic standard footer */}
      <footer className="bg-white border-t border-slate-150 py-6 mt-12 text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold font-sans">© 2026 Finanças Pessoais. Desenvolvido para organização descomplicada.</p>
        <p className="font-mono text-[9px] text-slate-350">PROJETO DE FINANÇAS EM CORES PASTEL COMPLEMENTARES</p>
      </footer>

    </div>
  );
}
