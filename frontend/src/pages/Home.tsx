import React from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bgColor} minH="calc(100vh - 64px)">
      <Container maxW="container.xl" py={10}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="space-between"
          mb={16}
        >
          <Box maxW={{ base: '100%', md: '50%' }} mb={{ base: 10, md: 0 }}>
            <Heading
              as="h1"
              size="2xl"
              mb={6}
              lineHeight="1.2"
              fontWeight="bold"
            >
              Take Control of Your{' '}
              <Text as="span" color="teal.500">
                Personal Finances
              </Text>
            </Heading>
            <Text fontSize="xl" mb={8} opacity={0.8}>
              Track expenses, set budgets, and gain insights into your spending
              habits with our easy-to-use personal finance tracker.
            </Text>
            {user ? (
              <Button
                as={RouterLink}
                to="/dashboard"
                colorScheme="teal"
                size="lg"
                px={8}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                <Button
                  as={RouterLink}
                  to="/register"
                  colorScheme="teal"
                  size="lg"
                  px={8}
                >
                  Get Started
                </Button>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="outline"
                  colorScheme="teal"
                  size="lg"
                  px={8}
                >
                  Login
                </Button>
              </Stack>
            )}
          </Box>
          <Box maxW={{ base: '100%', md: '45%' }}>
            <Image
              src="https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
              alt="Personal Finance"
              borderRadius="lg"
              boxShadow="lg"
            />
          </Box>
        </Flex>

        <Heading as="h2" size="xl" mb={10} textAlign="center">
          Key Features
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <Feature
            title="Expense Tracking"
            description="Easily log your daily expenses and categorize them to understand where your money is going."
            icon="💰"
          />
          <Feature
            title="Budget Management"
            description="Set monthly budgets for different categories and track your progress to stay on target."
            icon="📊"
          />
          <Feature
            title="Insightful Reports"
            description="Visualize your spending patterns with intuitive charts and reports to make better financial decisions."
            icon="📈"
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
};

interface FeatureProps {
  title: string;
  description: string;
  icon: string;
}

const Feature: React.FC<FeatureProps> = ({ title, description, icon }) => {
  const cardBgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Box
      p={6}
      bg={cardBgColor}
      borderRadius="lg"
      boxShadow="md"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
    >
      <Text fontSize="4xl" mb={4}>
        {icon}
      </Text>
      <Heading as="h3" size="md" mb={2}>
        {title}
      </Heading>
      <Text opacity={0.8}>{description}</Text>
    </Box>
  );
};

const SimpleGrid: React.FC<{
  columns: { base: number; md: number };
  spacing: number;
  children: React.ReactNode;
}> = ({ columns, spacing, children }) => {
  return (
    <Flex
      flexWrap="wrap"
      justifyContent="center"
      mx={-spacing / 2}
    >
      {React.Children.map(children, (child) => (
        <Box
          flexBasis={{ base: '100%', md: `${100 / columns.md}%` }}
          px={spacing / 2}
          mb={spacing}
        >
          {child}
        </Box>
      ))}
    </Flex>
  );
};

export default Home; 