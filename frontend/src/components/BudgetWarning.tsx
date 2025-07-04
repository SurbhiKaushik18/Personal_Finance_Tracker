import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { ExpenseCategory } from '../types';
import * as budgetService from '../services/budgetService';
import * as expenseService from '../services/expenseService';
import { formatCurrency } from '../utils/currencyFormatter';

interface BudgetWarningProps {
  category: ExpenseCategory;
  amount: number;
  month: number;
  year: number;
}

const BudgetWarning: React.FC<BudgetWarningProps> = ({ category, amount, month, year }) => {
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState<{
    budgetAmount: number;
    currentSpent: number;
    remaining: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!category || amount <= 0) {
        setLoading(false);
        return;
      }

      try {
        // Get budget comparison data
        const comparison = await budgetService.getBudgetComparison(month, year);
        const categoryData = comparison.find(item => item.category === category);

        if (categoryData) {
          // Calculate what would happen if this expense is added
          const newTotal = categoryData.actual + amount;
          const newPercentage = Math.round((newTotal / categoryData.budgeted) * 100);
          const newRemaining = categoryData.budgeted - newTotal;

          setBudgetData({
            budgetAmount: categoryData.budgeted,
            currentSpent: categoryData.actual,
            remaining: newRemaining,
            percentage: newPercentage
          });
        }
      } catch (error) {
        console.error('Error fetching budget data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [category, amount, month, year]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={2}>
        <Spinner size="sm" mr={2} />
        <Text fontSize="sm">Checking budget...</Text>
      </Box>
    );
  }

  if (!budgetData || budgetData.percentage < 80) {
    return null;
  }

  // Show warning if expense would put category over 80% of budget
  if (budgetData.percentage >= 80 && budgetData.percentage < 100) {
    return (
      <Alert status="warning" borderRadius="md" mb={4} size="sm">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Budget Warning</AlertTitle>
          <AlertDescription fontSize="sm">
            This expense will use {budgetData.percentage}% of your {category} budget.
            {budgetData.remaining > 0 
              ? ` ${formatCurrency(budgetData.remaining)} remaining.` 
              : ''}
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  // Show error if expense would exceed budget
  return (
    <Alert status="error" borderRadius="md" mb={4} size="sm">
      <AlertIcon />
      <Box>
        <AlertTitle fontSize="sm">Budget Exceeded</AlertTitle>
        <AlertDescription fontSize="sm">
          This expense will exceed your {category} budget by {formatCurrency(Math.abs(budgetData.remaining))}.
        </AlertDescription>
      </Box>
    </Alert>
  );
};

export default BudgetWarning; 