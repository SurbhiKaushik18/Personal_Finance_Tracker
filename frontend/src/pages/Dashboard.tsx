import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Select,
  Text,
  useColorModeValue,
  Spinner,
  Center,
  Button,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDataRefresh } from '../context/DataRefreshContext';
import * as expenseService from '../services/expenseService';
import * as budgetService from '../services/budgetService';
import { ExpenseSummary, BudgetComparison } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatCurrencyWithSeparators } from '../utils/currencyFormatter';
import BudgetAlerts from '../components/BudgetAlerts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { lastExpenseUpdate, lastBudgetUpdate } = useDataRefresh();
  const navigate = useNavigate();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary[]>([]);
  const [budgetComparison, setBudgetComparison] = useState<BudgetComparison[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalBudget, setTotalBudget] = useState<number>(0);

  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, [month, year, lastExpenseUpdate, lastBudgetUpdate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching expense summary for month: ${month}, year: ${year}`);
      const summary = await expenseService.getExpenseSummary(month, year);
      console.log('Expense summary received:', summary);
      setExpenseSummary(summary);

      console.log(`Fetching budget comparison for month: ${month}, year: ${year}`);
      const comparison = await budgetService.getBudgetComparison(month, year);
      console.log('Budget comparison received:', comparison);
      setBudgetComparison(comparison);

      // Calculate totals
      const expenseTotal = summary.reduce((acc, curr) => acc + curr.total, 0);
      console.log('Calculated total expenses:', expenseTotal);
      setTotalExpenses(expenseTotal);

      const budgetTotal = comparison.reduce((acc, curr) => acc + curr.budgeted, 0);
      console.log('Calculated total budget:', budgetTotal);
      setTotalBudget(budgetTotal);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
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
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1">Dashboard</Heading>
        <Button
          as={RouterLink}
          to="/reports"
          colorScheme="blue"
          size="md"
        >
          View Monthly Reports
        </Button>
      </Flex>

      <Flex mb={6} justifyContent="flex-end">
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
        >
          {generateYearOptions().map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </Flex>

      {isLoading ? (
        <Center h="300px">
          <Spinner size="xl" />
        </Center>
      ) : (
        <>
          {/* Add Budget Alerts component */}
          {budgetComparison.length > 0 && (
            <BudgetAlerts budgetComparisons={budgetComparison} />
          )}

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
            <Stat
              p={4}
              bg={bgColor}
              borderRadius="lg"
              boxShadow="md"
              borderLeft="4px solid"
              borderColor="teal.400"
            >
              <StatLabel>Total Expenses</StatLabel>
              <StatNumber>{formatCurrencyWithSeparators(totalExpenses)}</StatNumber>
              <StatHelpText>
                {MONTHS.find((m) => m.value === month)?.label} {year}
              </StatHelpText>
            </Stat>

            <Stat
              p={4}
              bg={bgColor}
              borderRadius="lg"
              boxShadow="md"
              borderLeft="4px solid"
              borderColor="blue.400"
            >
              <StatLabel>Total Budget</StatLabel>
              <StatNumber>{formatCurrencyWithSeparators(totalBudget)}</StatNumber>
              <StatHelpText>
                {MONTHS.find((m) => m.value === month)?.label} {year}
              </StatHelpText>
            </Stat>

            <Stat
              p={4}
              bg={bgColor}
              borderRadius="lg"
              boxShadow="md"
              borderLeft="4px solid"
              borderColor={totalExpenses > totalBudget ? 'red.400' : 'green.400'}
            >
              <StatLabel>Budget Status</StatLabel>
              <StatNumber>
                {totalBudget > 0
                  ? `${Math.round((totalExpenses / totalBudget) * 100)}%`
                  : 'No Budget'}
              </StatNumber>
              <StatHelpText color={totalExpenses > totalBudget ? 'red.400' : 'green.400'}>
                {totalExpenses > totalBudget
                  ? `${formatCurrency(totalExpenses - totalBudget)} over budget`
                : `${formatCurrency(totalBudget - totalExpenses)} under budget`}
              </StatHelpText>
            </Stat>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Box
              p={6}
              bg={bgColor}
              borderRadius="lg"
              boxShadow="md"
              height="400px"
            >
              <Heading as="h3" size="md" mb={4}>
                Expense Distribution
              </Heading>
              {expenseSummary.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={expenseSummary}
                      dataKey="total"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ _id, percent }) =>
                        `${_id}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {expenseSummary.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Center h="300px">
                  <Text>No expense data for this period</Text>
                </Center>
              )}
            </Box>

            <Box
              p={6}
              bg={bgColor}
              borderRadius="lg"
              boxShadow="md"
              height="400px"
            >
              <Heading as="h3" size="md" mb={4}>
                Budget vs. Actual
              </Heading>
              {budgetComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={budgetComparison}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                    <Legend />
                    <Bar dataKey="budgeted" name="Budget" fill="#8884d8" />
                    <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Center h="300px">
                  <Text>No budget data for this period</Text>
                </Center>
              )}
            </Box>
          </SimpleGrid>
        </>
      )}
    </Container>
  );
};

export default Dashboard; 