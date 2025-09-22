'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPets } from '../../services/petService';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, Button, Box, Checkbox, Select, RadioGroup } from '@radix-ui/themes';
import { FiDownload, FiFile, FiFileText, FiFilePlus } from 'react-icons/fi';

export default function ExportRecords() {
  const { user } = useAuth();
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Export settings
  const [selectedPets, setSelectedPets] = useState([]);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeRecords, setIncludeRecords] = useState({
    basicInfo: true,
    vetVisits: true,
    vaccinations: true,
    medications: true,
    weightHistory: true,
    feedingSchedule: false,
    documents: false
  });
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    // Fetch user's pets
    const fetchPets = async () => {
      try {
        const petsData = await getUserPets();
        setPets(petsData || []);

        // Select all pets by default
        if (petsData && petsData.length > 0) {
          setSelectedPets(petsData.map(pet => pet.id));
        }
      } catch (err) {
        console.error('Error fetching pets:', err);
        setError('Failed to load pets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, [user, router]);

  const handlePetSelection = (petId) => {
    setSelectedPets(prev => {
      if (prev.includes(petId)) {
        return prev.filter(id => id !== petId);
      } else {
        return [...prev, petId];
      }
    });
  };

  const handleSelectAllPets = () => {
    if (selectedPets.length === pets.length) {
      setSelectedPets([]);
    } else {
      setSelectedPets(pets.map(pet => pet.id));
    }
  };

  const handleRecordTypeChange = (recordType, checked) => {
    setIncludeRecords(prev => ({
      ...prev,
      [recordType]: checked
    }));
  };

  const handleExport = async () => {
    if (selectedPets.length === 0) {
      setError('Please select at least one pet to export records for.');
      return;
    }

    if (!Object.values(includeRecords).some(value => value === true)) {
      setError('Please select at least one record type to export.');
      return;
    }

    setError('');
    setSuccess('');
    setIsExporting(true);

    try {
      // In a real app, this would be an API call to export records
      // For now, we'll just simulate a successful export
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess(`Records exported successfully as ${exportFormat.toUpperCase()}.`);
    } catch (err) {
      console.error('Error exporting records:', err);
      setError('Failed to export records. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Flex direction="column" gap="6">
          <Heading size="6">Export Pet Records</Heading>

          {error && (
            <Text color="red" size="2">
              {error}
            </Text>
          )}

          {success && (
            <Text color="green" size="2">
              {success}
            </Text>
          )}

          {isLoading ? (
            <Text>Loading pets...</Text>
          ) : pets.length === 0 ? (
            <Card>
              <Flex direction="column" align="center" gap="4" p="6">
                <Text size="4">You don't have any pets yet.</Text>
                <Button onClick={() => router.push('/pets/add')}>Add Your First Pet</Button>
              </Flex>
            </Card>
          ) : (
            <>
              <Card>
                <Flex direction="column" gap="4" p="4">
                  <Heading size="4">Select Pets</Heading>

                  <Flex align="center" gap="2" mb="2">
                    <Checkbox
                      checked={selectedPets.length === pets.length}
                      onCheckedChange={handleSelectAllPets}
                      id="select-all"
                    />
                    <Text as="label" size="2" htmlFor="select-all">
                      Select All Pets
                    </Text>
                  </Flex>

                  <Flex direction="column" gap="2">
                    {pets.map(pet => (
                      <Flex key={pet.id} align="center" gap="2">
                        <Checkbox
                          checked={selectedPets.includes(pet.id)}
                          onCheckedChange={() => handlePetSelection(pet.id)}
                          id={`pet-${pet.id}`}
                        />
                        <Text as="label" size="2" htmlFor={`pet-${pet.id}`}>
                          {pet.name} ({pet.species})
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
              </Card>

              <Card>
                <Flex direction="column" gap="4" p="4">
                  <Heading size="4">Export Options</Heading>

                  <Box>
                    <Text size="2" weight="bold" mb="2">Export Format</Text>
                    <Select.Root
                      value={exportFormat}
                      onValueChange={setExportFormat}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="pdf">PDF Document</Select.Item>
                        <Select.Item value="csv">CSV Spreadsheet</Select.Item>
                        <Select.Item value="json">JSON Data</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Box>
                    <Text size="2" weight="bold" mb="2">Include Record Types</Text>
                    <Flex direction="column" gap="2">
                      <Flex align="center" gap="2">
                        <Checkbox
                          checked={includeRecords.basicInfo}
                          onCheckedChange={(checked) => handleRecordTypeChange('basicInfo', checked)}
                          id="include-basic-info"
                        />
                        <Text as="label" size="2" htmlFor="include-basic-info">
                          Basic Pet Information
                        </Text>
                      </Flex>

                      <Flex align="center" gap="2">
                        <Checkbox
                          checked={includeRecords.vetVisits}
                          onCheckedChange={(checked) => handleRecordTypeChange('vetVisits', checked)}
                          id="include-vet-visits"
                        />
                        <Text as="label" size="2" htmlFor="include-vet-visits">
                          Veterinary Visits
                        </Text>
                      </Flex>

                      <Flex align="center" gap="2">
                        <Checkbox
                          checked={includeRecords.vaccinations}
                          onCheckedChange={(checked) => handleRecordTypeChange('vaccinations', checked)}
                          id="include-vaccinations"
                        />
                        <Text as="label" size="2" htmlFor="include-vaccinations">
                          Vaccinations
                        </Text>
                      </Flex>

                      <Flex align="center" gap="2">
                        <Checkbox
                          checked={includeRecords.medications}
                          onCheckedChange={(checked) => handleRecordTypeChange('medications', checked)}
                          id="include-medications"
                        />
                        <Text as="label" size="2" htmlFor="include-medications">
                          Medications
                        </Text>
                      </Flex>

                      <Flex align="center" gap="2">
                        <Checkbox
                          checked={includeRecords.weightHistory}
                          onCheckedChange={(checked) => handleRecordTypeChange('weightHistory', checked)}
                          id="include-weight-history"
                        />
                        <Text as="label" size="2" htmlFor="include-weight-history">
                          Weight History
                        </Text>
                      </Flex>

                      <Flex align="center" gap="2">
                        <Checkbox
                          checked={includeRecords.feedingSchedule}
                          onCheckedChange={(checked) => handleRecordTypeChange('feedingSchedule', checked)}
                          id="include-feeding-schedule"
                        />
                        <Text as="label" size="2" htmlFor="include-feeding-schedule">
                          Feeding Schedule
                        </Text>
                      </Flex>

                      <Flex align="center" gap="2">
                        <Checkbox
                          checked={includeRecords.documents}
                          onCheckedChange={(checked) => handleRecordTypeChange('documents', checked)}
                          id="include-documents"
                        />
                        <Text as="label" size="2" htmlFor="include-documents">
                          Attached Documents
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>

                  <Box>
                    <Text size="2" weight="bold" mb="2">Date Range</Text>
                    <RadioGroup.Root
                      value={dateRange}
                      onValueChange={setDateRange}
                    >
                      <Flex direction="column" gap="2">
                        <Text as="label" size="2">
                          <Flex gap="2" align="center">
                            <RadioGroup.Item value="all" /> All Records
                          </Flex>
                        </Text>
                        <Text as="label" size="2">
                          <Flex gap="2" align="center">
                            <RadioGroup.Item value="last_month" /> Last Month
                          </Flex>
                        </Text>
                        <Text as="label" size="2">
                          <Flex gap="2" align="center">
                            <RadioGroup.Item value="last_3_months" /> Last 3 Months
                          </Flex>
                        </Text>
                        <Text as="label" size="2">
                          <Flex gap="2" align="center">
                            <RadioGroup.Item value="last_year" /> Last Year
                          </Flex>
                        </Text>
                        <Text as="label" size="2">
                          <Flex gap="2" align="center">
                            <RadioGroup.Item value="custom" /> Custom Range
                          </Flex>
                        </Text>
                      </Flex>
                    </RadioGroup.Root>

                    {dateRange === 'custom' && (
                      <Flex gap="2" mt="2">
                        <Box>
                          <Text as="label" size="2" mb="1" htmlFor="custom-start-date">
                            Start Date
                          </Text>
                          <TextField.Root
                            id="custom-start-date"
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                          />
                        </Box>
                        <Box>
                          <Text as="label" size="2" mb="1" htmlFor="custom-end-date">
                            End Date
                          </Text>
                          <TextField.Root
                            id="custom-end-date"
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                          />
                        </Box>
                      </Flex>
                    )}
                  </Box>
                </Flex>
              </Card>

              <Flex justify="center" mt="4">
                <Button
                  size="3"
                  onClick={handleExport}
                  disabled={isExporting || selectedPets.length === 0}
                >
                  <FiDownload />
                  {isExporting ? 'Exporting...' : 'Export Records'}
                </Button>
              </Flex>

              <Card>
                <Flex direction="column" gap="4" p="4">
                  <Heading size="4">Available Export Formats</Heading>

                  <Flex gap="4" wrap="wrap">
                    <Card style={{ flex: '1 1 250px' }}>
                      <Flex gap="3" p="3">
                        <Box style={{ color: 'var(--red-9)', fontSize: '2rem' }}>
                          <FiFile />
                        </Box>
                        <Box>
                          <Text size="3" weight="bold">PDF Document</Text>
                          <Text size="2">
                            Comprehensive document with all pet records formatted for easy reading and printing.
                          </Text>
                        </Box>
                      </Flex>
                    </Card>

                    <Card style={{ flex: '1 1 250px' }}>
                      <Flex gap="3" p="3">
                        <Box style={{ color: 'var(--green-9)', fontSize: '2rem' }}>
                          <FiFileText />
                        </Box>
                        <Box>
                          <Text size="3" weight="bold">CSV Spreadsheet</Text>
                          <Text size="2">
                            Tabular data format that can be opened in Excel or other spreadsheet applications.
                          </Text>
                        </Box>
                      </Flex>
                    </Card>

                    <Card style={{ flex: '1 1 250px' }}>
                      <Flex gap="3" p="3">
                        <Box style={{ color: 'var(--blue-9)', fontSize: '2rem' }}>
                          <FiFilePlus />
                        </Box>
                        <Box>
                          <Text size="3" weight="bold">JSON Data</Text>
                          <Text size="2">
                            Raw data format for developers or importing into other applications.
                          </Text>
                        </Box>
                      </Flex>
                    </Card>
                  </Flex>
                </Flex>
              </Card>
            </>
          )}
        </Flex>
      </Container>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="ExportRecords">
        {exportContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}