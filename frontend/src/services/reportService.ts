import api from './api';

export interface CategoryReport {
  id: number;
  report_id: number;
  category: string;
  amount_spent: number;
  budget_amount: number;
  is_over_budget: number;
  percentage_used: number;
}

export interface MonthlyReport {
  id: number;
  user_id: string;
  year: number;
  month: number;
  total_spent: number;
  total_budget: number;
  top_category: string;
  budget_status: string;
  created_at: string;
  categories: CategoryReport[];
}

/**
 * Generate a monthly report for a specific year and month
 */
export const generateMonthlyReport = async (year: number, month: number) => {
  const response = await api.post('/reports/generate', { year, month });
  return response.data;
};

/**
 * Generate a report for the current month
 */
export const generateCurrentMonthReport = async () => {
  const response = await api.post('/reports/generate-current');
  return response.data;
};

/**
 * Get a specific monthly report
 */
export const getMonthlyReport = async (year: number, month: number) => {
  const response = await api.get(`/reports/${year}/${month}`);
  return response.data;
};

/**
 * Get recent monthly reports (default: last 3 months)
 */
export const getRecentReports = async (count: number = 3) => {
  const response = await api.get(`/reports/recent/${count}`);
  return response.data;
}; 