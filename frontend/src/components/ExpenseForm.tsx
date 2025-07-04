import React, { forwardRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  InputLeftAddon,
  InputGroup,
  Select,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { Expense, ExpenseCategory } from '../types';
import * as expenseService from '../services/expenseService';
import BudgetWarning from './BudgetWarning';
import { useDataRefresh } from '../context/DataRefreshContext';

interface ExpenseFormProps {
  expense?: Expense;
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

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSuccess }) => {
  const { refreshExpenses, setRefreshExpenses } = useDataRefresh();
  const [amount, setAmount] = React.useState<number>(expense?.amount || 0);
  const [description, setDescription] = React.useState<string>(expense?.description || '');
  const [category, setCategory] = React.useState<ExpenseCategory>(
    expense?.category || 'Other'
  );
  const [date, setDate] = React.useState<string>(
    expense?.date
      ? new Date(expense.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Extract month and year from the date for budget warnings
  const expenseDate = new Date(date);
  const month = expenseDate.getMonth() + 1;
  const year = expenseDate.getFullYear();

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Debug the date handling
    const parsedDate = new Date(date);
    console.log('Form submission - date info:', {
      rawDate: date,
      parsedDate: parsedDate,
      isoString: parsedDate.toISOString(),
      month: parsedDate.getMonth() + 1,
      year: parsedDate.getFullYear()
    });

    try {
      if (expense) {
        console.log('Updating expense with data:', {
          amount,
          description,
          category,
          date: new Date(date).toISOString(),
        });
        await expenseService.updateExpense(expense._id, {
          amount,
          description,
          category,
          date: new Date(date).toISOString(),
        });
        toast({
          title: 'Expense updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Ensure the date is set to noon to avoid timezone issues
        const expenseDate = new Date(date);
        // Set time to noon to avoid timezone issues
        expenseDate.setHours(12, 0, 0, 0);
        
        console.log('Creating new expense with data:', {
          amount,
          description,
          category,
          date: expenseDate.toISOString(),
          dateObj: expenseDate
        });
        
        const result = await expenseService.createExpense({
          amount,
          description,
          category,
          date: expenseDate.toISOString(),
        });
        
        console.log('Expense created:', result);
        toast({
          title: 'Expense added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Reset form
        setAmount(0);
        setDescription('');
        setCategory('Other');
        setDate(new Date().toISOString().split('T')[0]);
      }
      
      // Trigger refresh of expense data
      setRefreshExpenses((prev: boolean) => !prev);
      
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting expense form:', error);
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
          <FormLabel>Amount</FormLabel>
          <InputGroup>
            <InputLeftAddon children="₹" />
            <NumberInput min={0} value={amount} onChange={(_, val) => setAmount(val)} width="100%">
              <NumberInputField borderLeftRadius={0} />
            </NumberInput>
          </InputGroup>
        </FormControl>

        <FormControl id="description" isRequired>
          <FormLabel>Description</FormLabel>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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

        {/* Add Budget Warning Component */}
        {amount > 0 && category && (
          <BudgetWarning 
            category={category} 
            amount={amount} 
            month={month} 
            year={year} 
          />
        )}

        <FormControl id="date" isRequired>
          <FormLabel>Date</FormLabel>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormControl>

        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isLoading}
          type="submit"
        >
          {expense ? 'Update Expense' : 'Add Expense'}
        </Button>
      </Stack>
    </Box>
  );
};

export default ExpenseForm;