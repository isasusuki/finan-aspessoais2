import { ExpenseCategory, IncomeSource, PendingReceipt, Receivable, Transaction, BankAccount } from './types';

export const DEFAULT_BANKS: BankAccount[] = [
  { id: 'b1', name: 'Nubank', balance: 1800, color: 'bg-[#F5EEFB] text-purple-800 border-purple-200/60 font-medium' },
  { id: 'b2', name: 'Banco do Brasil', balance: 3500, color: 'bg-amber-50 text-amber-800 border-amber-200/60 font-medium' },
  { id: 'b3', name: 'Itaú', balance: 950, color: 'bg-[#FDF1EB] text-orange-850 border-orange-200/60 font-medium' },
  { id: 'b4', name: 'Dinheiro (Carteira)', balance: 300, color: 'bg-[#EAF7EE] text-emerald-800 border-emerald-200/60 font-medium' },
];

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: '1', name: 'Alimentação', limit: 800, spent: 0, color: 'bg-[#ECF5FC] text-sky-800 border-sky-200/60' }, // azul
  { id: '2', name: 'Transporte', limit: 350, spent: 0, color: 'bg-[#FDF1EB] text-amber-800 border-orange-200/60' }, // pêssego
  { id: '3', name: 'Lazer', limit: 250, spent: 0, color: 'bg-[#F5EEFB] text-purple-800 border-purple-200/60' }, // lilás
  { id: '4', name: 'Moradia', limit: 1500, spent: 0, color: 'bg-[#EAF7EE] text-emerald-800 border-emerald-200/60' }, // verde
];

export const DEFAULT_INCOME_SOURCES: IncomeSource[] = [
  { id: '1', name: 'Salário', expectedAmount: 3000, color: 'bg-[#EAF7EE] text-emerald-800 border-emerald-200/60' },
  { id: '2', name: 'Aluguel', expectedAmount: 800, color: 'bg-[#FDF1EB] text-amber-800 border-orange-200/60' },
  { id: '3', name: 'Clientes / Freelas', expectedAmount: 1200, color: 'bg-[#F5EEFB] text-purple-800 border-purple-200/60' },
  { id: '4', name: 'Outros', expectedAmount: 500, color: 'bg-[#ECF5FC] text-sky-800 border-sky-200/60' },
];

export const INITIAL_PENDING: PendingReceipt[] = [
  {
    id: 'p1',
    title: 'Transferência Pix (Venda notebook)',
    amount: 1200,
    source: 'Outros',
    status: 'processing',
    date: '2026-06-17',
  },
  {
    id: 'p2',
    title: 'Reembolso Despesas Viagem',
    amount: 340,
    source: 'Salário',
    status: 'awaiting_approval',
    date: '2026-06-16',
  }
];

export const INITIAL_RECEIVABLES: Receivable[] = [
  {
    id: 'r1',
    title: 'Salário Mensal Principal',
    amount: 3200,
    dueDate: '2026-07-05',
    source: 'Salário',
    reminderActive: true,
    status: 'pending',
  },
  {
    id: 'r2',
    title: 'Aluguel Sublocação Sala',
    amount: 600,
    dueDate: '2026-07-10',
    source: 'Aluguel',
    reminderActive: false,
    status: 'pending',
  },
  {
    id: 'r3',
    title: 'Projeto Design Figma (TechCorp)',
    amount: 1500,
    dueDate: '2026-07-15',
    source: 'Clientes / Freelas',
    reminderActive: true,
    status: 'pending',
  }
];

// In the actual initial load, all totals will be zero because there are no transactions initially.
// We will allow adding pre-filled simulation transactions too, if they want to load a demo!
export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'income', title: 'Salário Junho', amount: 3200, date: '2026-06-05', categoryOrSource: 'Salário', bankAccount: 'Banco do Brasil' },
  { id: 't2', type: 'expense', title: 'Supermercado Mensal', amount: 450, date: '2026-06-06', categoryOrSource: 'Alimentação', bankAccount: 'Nubank' },
  { id: 't3', type: 'expense', title: 'Combustível Carro', amount: 150, date: '2026-06-08', categoryOrSource: 'Transporte', bankAccount: 'Itaú' },
  { id: 't4', type: 'expense', title: 'Cinema e Jantar', amount: 120, date: '2026-06-10', categoryOrSource: 'Lazer', bankAccount: 'Dinheiro (Carteira)' },
  { id: 't5', type: 'expense', title: 'Mensalidade Aluguel', amount: 1400, date: '2026-06-01', categoryOrSource: 'Moradia', bankAccount: 'Banco do Brasil' },
  { id: 't6', type: 'income', title: 'Consultoria Desenvolvimento', amount: 850, date: '2026-06-12', categoryOrSource: 'Clientes / Freelas', bankAccount: 'Nubank' },
];
