import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Stack,
  Heading,
} from '@chakra-ui/react';
import { BudgetComparison } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';

interface BudgetAlertsProps {
  budgetComparisons: BudgetComparison[];
}

const BudgetAlerts: React.FC<BudgetAlertsProps> = ({ budgetComparisons }) => {
  // Filter categories that are over 80% of budget
  const warningCategories = budgetComparisons.filter(
    (item) => item.percentage >= 80 && item.percentage < 100
  );

  // Filter categories that are over 100% of budget
  const dangerCategories = budgetComparisons.filter(
    (item) => item.percentage >= 100
  );

  if (warningCategories.length === 0 && dangerCategories.length === 0) {
    return null; // Don't render anything if no alerts
  }

  return (
    <Box mb={6}>
      <Heading as="h3" size="md" mb={3}>
        Budget Alerts
      </Heading>
      <Stack spacing={3}>
        {dangerCategories.map((item) => (
          <Alert status="error" key={`danger-${item.category}`} borderRadius="md">
            <AlertIcon />
            <AlertTitle>{item.category}:</AlertTitle>
            <AlertDescription>
              Budget exceeded by {formatCurrency(item.actual - item.budgeted)} ({Math.round(item.percentage)}%)
            </AlertDescription>
          </Alert>
        ))}
        
        {warningCategories.map((item) => (
          <Alert status="warning" key={`warning-${item.category}`} borderRadius="md">
            <AlertIcon />
            <AlertTitle>{item.category}:</AlertTitle>
            <AlertDescription>
              {formatCurrency(item.remaining)} remaining ({Math.round(item.percentage)}% used)
            </AlertDescription>
          </Alert>
        ))}
      </Stack>
    </Box>
  );
};

export default BudgetAlerts;