import React from 'react';
import { Box, Flex, Heading, Button, useColorMode } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { ColorModeSwitcher } from './ColorModeSwitcher';

const Header: React.FC = () => {
  const { colorMode } = useColorMode();
  const { user, logout } = useAuth();

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem"
      bg={colorMode === 'light' ? 'teal.500' : 'teal.800'}
      color="white"
      boxShadow="md"
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg">
          <RouterLink to="/">Personal Finance Tracker</RouterLink>
        </Heading>
      </Flex>

      <Box display="flex" alignItems="center">
        {user ? (
          <>
            <Button
              as={RouterLink}
              to="/dashboard"
              variant="ghost"
              color="white"
              mr={2}
            >
              Dashboard
            </Button>
            <Button
              as={RouterLink}
              to="/expenses"
              variant="ghost"
              color="white"
              mr={2}
            >
              Expenses
            </Button>
            <Button
              as={RouterLink}
              to="/budgets"
              variant="ghost"
              color="white"
              mr={2}
            >
              Budgets
            </Button>
            <Button
              as={RouterLink}
              to="/reports"
              variant="ghost"
              color="white"
              mr={4}
            >
              Reports
            </Button>
            <Button
              variant="outline"
              colorScheme="whiteAlpha"
              leftIcon={<FaSignOutAlt />}
              onClick={logout}
              mr={4}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              as={RouterLink}
              to="/login"
              variant="ghost"
              color="white"
              mr={2}
            >
              Login
            </Button>
            <Button
              as={RouterLink}
              to="/register"
              variant="outline"
              colorScheme="whiteAlpha"
              mr={4}
            >
              Register
            </Button>
          </>
        )}
        <ColorModeSwitcher color="white" />
      </Box>
    </Flex>
  );
};

export default Header; 