import api from './api';
import { Expense, ExpenseSummary } from '../types';

// Get all expenses
export const getExpenses = async (): Promise<Expense[]> => {
  const response = await api.get('/expenses');
  return response.data;
};

// Create new expense
export const createExpense = async (expenseData: Partial<Expense>): Promise<Expense> => {
  const response = await api.post('/expenses', expenseData);
  return response.data;
};

// Update expense
export const updateExpense = async (
  id: string,
  expenseData: Partial<Expense>
): Promise<Expense> => {
  const response = await api.put(`/expenses/${id}`, expenseData);
  return response.data;
};

// Delete expense
export const deleteExpense = async (id: string): Promise<{ id: string }> => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

// Get expense summary by category
export const getExpenseSummary = async (
  month?: number,
  year?: number
): Promise<ExpenseSummary[]> => {
  let url = '/expenses/summary';
  
  if (month && year) {
    url += `?month=${month}&year=${year}`;
  }
  
  const response = await api.get(url);
  return response.data;
}; 