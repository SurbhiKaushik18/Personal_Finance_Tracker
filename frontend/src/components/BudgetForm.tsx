import React, { forwardRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  InputLeftAddon,
  InputGroup,
  Select,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { Budget, ExpenseCategory, PaymentMethod } from '../types';
import * as budgetService from '../services/budgetService';
import { useDataRefresh } from '../context/DataRefreshContext';

interface BudgetFormProps {
  budget?: Budget;
  onSuccess: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Personal Care',
  'Other',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Mobile Payment',
  'Check',
  'Other',
];

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onSuccess }) => {
  const { refreshBudgets, setRefreshBudgets } = useDataRefresh();
  const [amount, setAmount] = React.useState<number>(budget?.amount || 0);
  const [category, setCategory] = React.useState<ExpenseCategory>(
    budget?.category || 'Other'
  );
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(
    budget?.paymentMethod || 'Other'
  );
  const [month, setMonth] = React.useState<number>(
    budget?.month || new Date().getMonth() + 1
  );
  const [year, setYear] = React.useState<number>(
    budget?.year || new Date().getFullYear()
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (budget) {
        await budgetService.updateBudget(budget._id, {
          amount,
          category,
          paymentMethod,
          month,
          year,
        });
        toast({
          title: 'Budget updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await budgetService.createBudget({
          amount,
          category,
          paymentMethod,
          month,
          year,
        });
        toast({
          title: 'Budget added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Reset form
        setAmount(0);
        setCategory('Other');
        setPaymentMethod('Other');
      }
      
      // Trigger refresh of budget data
      setRefreshBudgets((prev: boolean) => !prev);

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack spacing={4}>
        <FormControl id="amount" isRequired>
          <FormLabel>Budget Amount</FormLabel>
          <InputGroup>
            <InputLeftAddon children="₹" />
            <NumberInput min={0} value={amount} onChange={(_, val) => setAmount(val)} width="100%">
              <NumberInputField borderLeftRadius={0} />
            </NumberInput>
          </InputGroup>
        </FormControl>

        <FormControl id="category" isRequired>
          <FormLabel>Category</FormLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="paymentMethod">
          <FormLabel>Payment Method</FormLabel>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="month" isRequired>
          <FormLabel>Month</FormLabel>
          <Select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="year" isRequired>
          <FormLabel>Year</FormLabel>
          <NumberInput
            min={2020}
            max={2100}
            value={year}
            onChange={(_, val) => setYear(val)}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isLoading}
          type="submit"
        >
          {budget ? 'Update Budget' : 'Add Budget'}
        </Button>
      </Stack>
    </Box>
  );
};

export default BudgetForm;