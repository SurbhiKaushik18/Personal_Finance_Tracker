import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  IconButton,
  Spinner,
  Center,
  Text,
  useToast,
  useColorModeValue,
  Select,
  Badge,
  Progress,
  Tooltip,
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDataRefresh } from '../context/DataRefreshContext';
import * as budgetService from '../services/budgetService';
import * as expenseService from '../services/expenseService';
import { Budget, ExpenseSummary } from '../types';
import BudgetForm from '../components/BudgetForm';
import { formatCurrency } from '../utils/currencyFormatter';

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

// Payment method colors for badges
const PAYMENT_METHOD_COLORS = {
  'Cash': 'green',
  'Credit Card': 'red',
  'Debit Card': 'blue',
  'Bank Transfer': 'purple',
  'Mobile Payment': 'orange',
  'Check': 'teal',
  'Other': 'gray',
};

const Budgets: React.FC = () => {
  const { user } = useAuth();
  const { lastBudgetUpdate, lastExpenseUpdate, refreshBudgets, setRefreshBudgets } = useDataRefresh();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, [month, year, lastBudgetUpdate, lastExpenseUpdate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch both budgets and expense summary
      const [budgetData, expenseData] = await Promise.all([
        budgetService.getBudgets(month, year),
        expenseService.getExpenseSummary(month, year)
      ]);
      
      setBudgets(budgetData);
      setExpenseSummary(expenseData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate budget usage percentage
  const getBudgetUsage = (category: string, budgetAmount: number) => {
    const expense = expenseSummary.find(item => item._id === category);
    if (!expense) return 0;
    return Math.min(Math.round((expense.total / budgetAmount) * 100), 100);
  };

  // Get the actual expense amount for a category
  const getCategoryExpense = (category: string) => {
    const expense = expenseSummary.find(item => item._id === category);
    return expense ? expense.total : 0;
  };

  // Get progress color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'red.500';
    if (percentage >= 80) return 'orange.400';
    return 'green.400';
  };

  const handleAddBudget = () => {
    setSelectedBudget(null);
    onOpen();
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    onOpen();
  };

  const handleDeleteBudget = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetService.deleteBudget(id);
        setBudgets(budgets.filter((budget) => budget._id !== id));
        
        // Trigger refresh after deletion
        setRefreshBudgets((prev: boolean) => !prev);

        toast({
          title: 'Success',
          description: 'Budget deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error deleting budget:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete budget',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleFormSuccess = () => {
    onClose();
    fetchData();
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(Number(e.target.value));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(Number(e.target.value));
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1">Budgets</Heading>
        <Flex align="center">
          <Select
            value={month}
            onChange={handleMonthChange}
            w="150px"
            mr={4}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
          <Select
            value={year}
            onChange={handleYearChange}
            w="120px"
            mr={4}
          >
            {generateYearOptions().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="teal"
            onClick={handleAddBudget}
          >
            Add Budget
          </Button>
        </Flex>
      </Flex>

      {isLoading ? (
        <Center h="300px">
          <Spinner size="xl" />
        </Center>
      ) : budgets.length > 0 ? (
        <Box
          overflowX="auto"
          bg={bgColor}
          borderRadius="lg"
          boxShadow="md"
        >
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Category</Th>
                  <Th isNumeric>Budget Amount</Th>
                  <Th>Payment Method</Th>
                  <Th>Usage</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {budgets.map((budget) => {
                  const usagePercentage = getBudgetUsage(budget.category, budget.amount);
                  const actualExpense = getCategoryExpense(budget.category);
                  const isWarning = usagePercentage >= 80 && usagePercentage < 100;
                  const isDanger = usagePercentage >= 100;
                  
                  return (
                    <Tr key={budget._id}>
                      <Td>{budget.category}</Td>
                      <Td isNumeric>{formatCurrency(budget.amount)}</Td>
                      <Td>
                        <Badge 
                          colorScheme={PAYMENT_METHOD_COLORS[budget.paymentMethod as keyof typeof PAYMENT_METHOD_COLORS]} 
                          py={1} 
                          px={2} 
                          borderRadius="md"
                        >
                          {budget.paymentMethod || 'Other'}
                        </Badge>
                      </Td>
                      <Td>
                        <Flex alignItems="center" gap={2}>
                          <Box flex="1">
                            <Tooltip 
                              label={`${formatCurrency(actualExpense)} of ${formatCurrency(budget.amount)} (${usagePercentage}%)`} 
                              placement="top"
                            >
                              <Progress 
                                value={usagePercentage} 
                                size="sm" 
                                colorScheme={
                                  isDanger ? "red" : isWarning ? "orange" : "green"
                                } 
                                borderRadius="md"
                              />
                            </Tooltip>
                          </Box>
                          {isDanger && (
                            <Tooltip label="Budget exceeded">
                              <Box color="red.500">
                                <FaExclamationCircle />
                              </Box>
                            </Tooltip>
                          )}
                          {isWarning && (
                            <Tooltip label="Approaching budget limit">
                              <Box color="orange.400">
                                <FaExclamationTriangle />
                              </Box>
                            </Tooltip>
                          )}
                          <Text fontSize="sm" whiteSpace="nowrap">
                            {usagePercentage}%
                          </Text>
                        </Flex>
                      </Td>
                      <Td>
                        <IconButton
                          aria-label="Edit budget"
                          icon={<FaEdit />}
                          size="sm"
                          mr={2}
                          onClick={() => handleEditBudget(budget)}
                        />
                        <IconButton
                          aria-label="Delete budget"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteBudget(budget._id)}
                        />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box p={8} textAlign="center">
          <Text fontSize="lg">
            No budgets found for {MONTHS.find((m) => m.value === month)?.label}{' '}
            {year}. Add your first budget!
          </Text>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedBudget ? 'Edit Budget' : 'Add Budget'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <BudgetForm
              budget={selectedBudget || undefined}
              onSuccess={handleFormSuccess}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Budgets;