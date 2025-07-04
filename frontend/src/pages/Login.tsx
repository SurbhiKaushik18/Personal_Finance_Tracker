import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [showError, setShowError] = useState<boolean>(false);
  const { login, user, isLoading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Show error alert if there's an error
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const validateForm = () => {
    const errors: {
      email?: string;
      password?: string;
    } = {};
    let isValid = true;

    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        console.log('Logging in user:', email);
        await login(email, password);
      } catch (err) {
        console.error('Login submission error:', err);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxW="container.sm" py={8}>
      <Box
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Stack spacing={4} as="form" onSubmit={handleSubmit}>
          <Heading as="h1" size="xl" textAlign="center">
            Login
          </Heading>

          {error && showError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription display="block">
                  {error}
                </AlertDescription>
              </Box>
              <CloseButton 
                position="absolute" 
                right="8px" 
                top="8px" 
                onClick={() => setShowError(false)}
              />
            </Alert>
          )}

          <FormControl id="email" isRequired isInvalid={!!formErrors.email}>
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {formErrors.email && (
              <FormErrorMessage>{formErrors.email}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl id="password" isRequired isInvalid={!!formErrors.password}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                  variant="ghost"
                  size="sm"
                  onClick={togglePasswordVisibility}
                />
              </InputRightElement>
            </InputGroup>
            {formErrors.password && (
              <FormErrorMessage>{formErrors.password}</FormErrorMessage>
            )}
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            isLoading={isLoading}
          >
            Login
          </Button>

          <Text textAlign="center">
            Don't have an account?{' '}
            <Link as={RouterLink} to="/register" color="teal.500">
              Register
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login; 