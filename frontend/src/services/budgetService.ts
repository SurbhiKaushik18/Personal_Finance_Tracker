import api from './api';
import { Budget, BudgetComparison } from '../types';

// Get all budgets
export const getBudgets = async (
  month?: number,
  year?: number
): Promise<Budget[]> => {
  let url = '/budgets';
  
  if (month && year) {
    url += `?month=${month}&year=${year}`;
  }
  
  const response = await api.get(url);
  return response.data;
};

// Create new budget
export const createBudget = async (budgetData: Partial<Budget>): Promise<Budget> => {
  const response = await api.post('/budgets', budgetData);
  return response.data;
};

// Update budget
export const updateBudget = async (
  id: string,
  budgetData: Partial<Budget>
): Promise<Budget> => {
  const response = await api.put(`/budgets/${id}`, budgetData);
  return response.data;
};

// Delete budget
export const deleteBudget = async (id: string): Promise<{ id: string }> => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};

// Get budget comparison (budget vs actual)
export const getBudgetComparison = async (
  month: number,
  year: number
): Promise<BudgetComparison[]> => {
  const response = await api.get(
    `/budgets/comparison?month=${month}&year=${year}`
  );
  return response.data;
}; 