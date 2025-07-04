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
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { checkServerHealth } from '../services/api';

const Register: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [showError, setShowError] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<{
    isChecking: boolean;
    isServerUp: boolean;
    isDatabaseUp: boolean;
  }>({
    isChecking: true,
    isServerUp: false,
    isDatabaseUp: false
  });
  const { register, user, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Check server status on component mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const status = await checkServerHealth();
        setServerStatus({
          isChecking: false,
          isServerUp: status.isServerUp,
          isDatabaseUp: status.isDatabaseUp
        });
        
        if (!status.isServerUp) {
          toast({
            title: "Server Connection Error",
            description: "Unable to connect to the server. Please try again later.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else if (!status.isDatabaseUp) {
          toast({
            title: "Database Connection Error",
            description: "Server is running but database connection failed. Some features may not work.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (err) {
        setServerStatus({
          isChecking: false,
          isServerUp: false,
          isDatabaseUp: false
        });
        
        toast({
          title: "Connection Error",
          description: "Failed to check server status. Please check your internet connection.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    checkServer();
  }, [toast]);

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
      console.error('Registration error from context:', error);
    }
  }, [error]);

  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    if (!name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

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
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!serverStatus.isServerUp) {
      toast({
        title: "Server Connection Error",
        description: "Unable to connect to the server. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!serverStatus.isDatabaseUp) {
      toast({
        title: "Database Connection Error",
        description: "Server is running but database connection failed. Registration is not available.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (validateForm()) {
      try {
        console.log('Submitting registration form:', { name, email });
        await register(name, email, password);
        toast({
          title: "Registration attempt",
          description: "Registration request sent to server",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } catch (err: any) {
        console.error('Registration submission error:', err);
        toast({
          title: "Registration failed",
          description: err.message || "Something went wrong",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // If checking server status, show loading spinner
  if (serverStatus.isChecking) {
    return (
      <Container maxW="container.sm" py={8} centerContent>
        <Box textAlign="center" p={8}>
          <Spinner size="xl" mb={4} />
          <Heading size="md">Checking server connection...</Heading>
        </Box>
      </Container>
    );
  }

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
            Register
          </Heading>

          {!serverStatus.isServerUp && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Server Connection Error</AlertTitle>
                <AlertDescription display="block">
                  Unable to connect to the server. Registration is not available.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {serverStatus.isServerUp && !serverStatus.isDatabaseUp && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Database Connection Error</AlertTitle>
                <AlertDescription display="block">
                  Server is running but database connection failed. Registration is not available.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {error && showError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Registration Failed</AlertTitle>
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

          <FormControl id="name" isRequired isInvalid={!!formErrors.name}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isDisabled={!serverStatus.isServerUp || !serverStatus.isDatabaseUp}
            />
            {formErrors.name && (
              <FormErrorMessage>{formErrors.name}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl id="email" isRequired isInvalid={!!formErrors.email}>
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isDisabled={!serverStatus.isServerUp || !serverStatus.isDatabaseUp}
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
                isDisabled={!serverStatus.isServerUp || !serverStatus.isDatabaseUp}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                  variant="ghost"
                  size="sm"
                  onClick={togglePasswordVisibility}
                  isDisabled={!serverStatus.isServerUp || !serverStatus.isDatabaseUp}
                />
              </InputRightElement>
            </InputGroup>
            {formErrors.password && (
              <FormErrorMessage>{formErrors.password}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl id="confirmPassword" isRequired isInvalid={!!formErrors.confirmPassword}>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isDisabled={!serverStatus.isServerUp || !serverStatus.isDatabaseUp}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  variant="ghost"
                  size="sm"
                  onClick={toggleConfirmPasswordVisibility}
                  isDisabled={!serverStatus.isServerUp || !serverStatus.isDatabaseUp}
                />
              </InputRightElement>
            </InputGroup>
            {formErrors.confirmPassword && (
              <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
            )}
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            isLoading={isLoading}
            isDisabled={!serverStatus.isServerUp || !serverStatus.isDatabaseUp}
          >
            Register
          </Button>

          <Text textAlign="center">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="teal.500">
              Login
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
};

export default Register; 