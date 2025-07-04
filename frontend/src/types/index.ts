export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface Expense {
  _id: string;
  user: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  user: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetComparison {
  category: ExpenseCategory;
  budgeted: number;
  actual: number;
  remaining: number;
  percentage: number;
}

export interface ExpenseSummary {
  _id: ExpenseCategory;
  total: number;
  count: number;
}

export type ExpenseCategory =
  | 'Food'
  | 'Transportation'
  | 'Housing'
  | 'Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Education'
  | 'Personal Care'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Mobile Payment'
  | 'Check'
  | 'Other';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

export interface ExpenseState {
  expenses: Expense[];
  expense: Expense | null;
  summary: ExpenseSummary[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

export interface BudgetState {
  budgets: Budget[];
  budget: Budget | null;
  comparison: BudgetComparison[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
} 