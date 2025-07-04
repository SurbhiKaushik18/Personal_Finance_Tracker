import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
  useToast,
  Select,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  SimpleGrid,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { RepeatIcon, DownloadIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { useDataRefresh } from '../context/DataRefreshContext';
import { MonthlyReport, getRecentReports, generateCurrentMonthReport } from '../services/reportService';
import { formatCurrency } from '../utils/currencyFormatter';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);
  const { isAuthenticated } = useAuth();
  const { refreshData, setRefreshData } = useDataRefresh();
  const toast = useToast();

  // Load reports
  useEffect(() => {
    const fetchReports = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const response = await getRecentReports(3);
          setReports(response.data);
          
          // Select the most recent report by default
          if (response.data.length > 0) {
            setSelectedReport(response.data[0]);
          }
        } catch (error) {
          console.error('Error fetching reports:', error);
          toast({
            title: 'Error fetching reports',
            description: 'Could not load your monthly reports.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReports();
  }, [isAuthenticated, refreshData, toast]);

  // Generate current month report
  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      await generateCurrentMonthReport();
      setRefreshData(!refreshData);
      toast({
        title: 'Report Generated',
        description: 'Current month report has been generated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Could not generate the report. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setGenerating(false);
    }
  };

  // Get month name from month number
  const getMonthName = (month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  // Get badge color based on budget status
  const getBudgetStatusColor = (status: string): string => {
    switch (status) {
      case 'Over Budget':
        return 'red';
      case 'Near Budget':
        return 'orange';
      case 'Under Budget':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Handle report selection
  const handleReportSelect = (report: MonthlyReport) => {
    setSelectedReport(report);
  };

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Monthly Reports</Heading>
        <Button
          leftIcon={<RepeatIcon />}
          colorScheme="blue"
          onClick={handleGenerateReport}
          isLoading={generating}
          loadingText="Generating"
        >
          Generate Current Month Report
        </Button>
      </Flex>

      {loading ? (
        <Flex justifyContent="center" alignItems="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : reports.length === 0 ? (
        <Box textAlign="center" p={8} borderWidth={1} borderRadius="lg">
          <Text fontSize="xl" mb={4}>No reports available yet.</Text>
          <Text mb={4}>Generate your first monthly report to see your financial summary.</Text>
          <Button colorScheme="blue" onClick={handleGenerateReport} isLoading={generating}>
            Generate Report
          </Button>
        </Box>
      ) : (
        <Box>
          <HStack spacing={4} mb={6} overflowX="auto" pb={2}>
            {reports.map((report) => (
              <Card 
                key={`${report.year}-${report.month}`}
                cursor="pointer"
                onClick={() => handleReportSelect(report)}
                bg={selectedReport?.id === report.id ? 'blue.50' : 'white'}
                borderColor={selectedReport?.id === report.id ? 'blue.500' : 'gray.200'}
                borderWidth={1}
                minW="200px"
              >
                <CardHeader pb={2}>
                  <Heading size="sm">{getMonthName(report.month)} {report.year}</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <Text fontWeight="bold">{formatCurrency(report.total_spent)}</Text>
                  <Badge colorScheme={getBudgetStatusColor(report.budget_status)}>
                    {report.budget_status}
                  </Badge>
                </CardBody>
              </Card>
            ))}
          </HStack>

          {selectedReport && (
            <Box>
              <Card mb={6}>
                <CardHeader>
                  <Heading size="md">
                    {getMonthName(selectedReport.month)} {selectedReport.year} Summary
                  </Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5}>
                    <Stat>
                      <StatLabel>Total Spent</StatLabel>
                      <StatNumber>{formatCurrency(selectedReport.total_spent)}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Total Budget</StatLabel>
                      <StatNumber>{formatCurrency(selectedReport.total_budget)}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Top Category</StatLabel>
                      <StatNumber>{selectedReport.top_category || 'N/A'}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Status</StatLabel>
                      <StatNumber>
                        <Badge colorScheme={getBudgetStatusColor(selectedReport.budget_status)} fontSize="md" p={1}>
                          {selectedReport.budget_status}
                        </Badge>
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>
                </CardBody>
              </Card>

              <Heading size="md" mb={4}>Category Details</Heading>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Category</Th>
                      <Th isNumeric>Spent</Th>
                      <Th isNumeric>Budget</Th>
                      <Th isNumeric>Usage %</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {selectedReport.categories && selectedReport.categories.map((category) => (
                      <Tr key={category.id}>
                        <Td>{category.category}</Td>
                        <Td isNumeric>{formatCurrency(category.amount_spent)}</Td>
                        <Td isNumeric>{formatCurrency(category.budget_amount)}</Td>
                        <Td isNumeric>{category.percentage_used.toFixed(1)}%</Td>
                        <Td>
                          <Badge 
                            colorScheme={category.is_over_budget ? 'red' : 
                              category.percentage_used >= 80 ? 'orange' : 'green'}
                          >
                            {category.is_over_budget ? 'Over Budget' : 
                              category.percentage_used >= 80 ? 'Near Limit' : 'Under Budget'}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Reports; 