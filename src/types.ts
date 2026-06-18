export interface ExpenseCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
  color: string; // pastel color class (e.g., 'bg-sky-100 text-sky-700 border-sky-200')
}

export interface IncomeSource {
  id: string;
  name: string;
  expectedAmount: number;
  color: string; // pastel color class
}

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  color: string; // pastel style class
}

export interface PendingReceipt {
  id: string;
  title: string;
  amount: number;
  source: string;
  status: 'processing' | 'awaiting_approval' | 'pending';
  date: string;
  bankAccount?: string; // bank account to deposit into
}

export interface Receivable {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  source: string;
  reminderActive: boolean;
  status: 'pending' | 'received';
  bankAccount?: string; // bank account to deposit into
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  date: string;
  categoryOrSource: string;
  bankAccount: string; // from which bank account this is transacted
}

export interface UserFinanceState {
  firstLoginCompleted: boolean;
  pendingReceipts: PendingReceipt[];
  receivables: Receivable[];
  transactions: Transaction[];
  categories: ExpenseCategory[];
  incomeSources: IncomeSource[];
  bankAccounts: BankAccount[];
}
