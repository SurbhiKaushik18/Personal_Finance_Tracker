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
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDataRefresh } from '../context/DataRefreshContext';
import * as expenseService from '../services/expenseService';
import { Expense } from '../types';
import ExpenseForm from '../components/ExpenseForm';
import { formatCurrency } from '../utils/currencyFormatter';

const Expenses: React.FC = () => {
  const { user } = useAuth();
  const { lastExpenseUpdate, refreshExpenses, setRefreshExpenses } = useDataRefresh();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchExpenses();
  }, [lastExpenseUpdate]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch expenses',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = () => {
    setSelectedExpense(null);
    onOpen();
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    onOpen();
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        setExpenses(expenses.filter((expense) => expense._id !== id));
        
        // Trigger refresh after deletion
        setRefreshExpenses(prev => !prev);
        
        toast({
          title: 'Success',
          description: 'Expense deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete expense',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleFormSuccess = () => {
    onClose();
    fetchExpenses();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1">Expenses</Heading>
        <Button
          leftIcon={<FaPlus />}
          colorScheme="teal"
          onClick={handleAddExpense}
        >
          Add Expense
        </Button>
      </Flex>

      {isLoading ? (
        <Center h="300px">
          <Spinner size="xl" />
        </Center>
      ) : expenses.length > 0 ? (
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
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th>Category</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {expenses.map((expense) => (
                  <Tr key={expense._id}>
                    <Td>{formatDate(expense.date)}</Td>
                    <Td>{expense.description}</Td>
                    <Td>{expense.category}</Td>
                    <Td isNumeric>{formatCurrency(expense.amount)}</Td>
                    <Td>
                      <IconButton
                        aria-label="Edit expense"
                        icon={<FaEdit />}
                        size="sm"
                        mr={2}
                        onClick={() => handleEditExpense(expense)}
                      />
                      <IconButton
                        aria-label="Delete expense"
                        icon={<FaTrash />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteExpense(expense._id)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box p={8} textAlign="center">
          <Text fontSize="lg">No expenses found. Add your first expense!</Text>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedExpense ? 'Edit Expense' : 'Add Expense'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ExpenseForm
              expense={selectedExpense || undefined}
              onSuccess={handleFormSuccess}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Expenses;