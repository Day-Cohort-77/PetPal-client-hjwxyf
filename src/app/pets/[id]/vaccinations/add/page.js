'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { getPetById } from '../../../../../services/petService';
import { createHealthRecord } from '../../../../../services/healthRecordService';
import Navbar from '../../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select, TextArea } from '@radix-ui/themes';

export default function AddVaccination() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    vaccineName: '',
    vaccineType: '',
    administrationDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    lotNumber: '',
    administeredBy: '',
    location: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Common vaccine types for selection
  const vaccineTypes = [
    { value: 'RABIES', label: 'Rabies' },
    { value: 'DISTEMPER', label: 'Distemper' },
    { value: 'PARVO', label: 'Parvovirus' },
    { value: 'BORDETELLA', label: 'Bordetella (Kennel Cough)' },
    { value: 'LEPTOSPIROSIS', label: 'Leptospirosis' },
    { value: 'FVRCP', label: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)' },
    { value: 'FELV', label: 'FeLV (Feline Leukemia Virus)' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Check if user is authenticated and fetch pet data
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const petData = await getPetById(petId);
        setPet(petData);
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError('Failed to load pet details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (petId) {
      fetchPet();
    }
  }, [user, router, petId]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Prepare health record data
      const healthRecordData = {
        ...formData,
        petId,
        recordType: 'VACCINATION',
        // Convert dates to ISO format
        administrationDate: new Date(formData.administrationDate).toISOString(),
        expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null
      };

      // Call API to create health record
      const newRecord = await createHealthRecord(healthRecordData);

      // Redirect back to pet details page
      router.push(`/pets/${petId}?tab=vaccinations`);
    } catch (err) {
      console.error('Error adding vaccination:', err);
      setError('Failed to add vaccination. Please try again.');
      setIsSaving(false);
    }
  };

  const addVaccinationContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Add Vaccination for {pet?.name || 'Pet'}</Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading pet details...</Text>
            ) : (
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="vaccineName">
                      Vaccine Name*
                    </Text>
                    <TextField.Root
                      id="vaccineName"
                      value={formData.vaccineName}
                      onChange={handleChange}
                      placeholder="Enter vaccine name"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="vaccineType">
                      Vaccine Type
                    </Text>
                    <Select.Root
                      value={formData.vaccineType}
                      onValueChange={(value) => handleSelectChange('vaccineType', value)}
                    >
                      <Select.Trigger id="vaccineType" placeholder="Select vaccine type" />
                      <Select.Content>
                        {vaccineTypes.map(type => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="administrationDate">
                        Administration Date*
                      </Text>
                      <TextField.Root
                        id="administrationDate"
                        type="date"
                        value={formData.administrationDate}
                        onChange={handleChange}
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="expirationDate">
                        Expiration/Due Date
                      </Text>
                      <TextField.Root
                        id="expirationDate"
                        type="date"
                        value={formData.expirationDate}
                        onChange={handleChange}
                      />
                    </Box>
                  </Grid>

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="lotNumber">
                        Lot Number
                      </Text>
                      <TextField.Root
                        id="lotNumber"
                        value={formData.lotNumber}
                        onChange={handleChange}
                        placeholder="Enter lot number"
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="administeredBy">
                        Administered By
                      </Text>
                      <TextField.Root
                        id="administeredBy"
                        value={formData.administeredBy}
                        onChange={handleChange}
                        placeholder="Enter name of administrator"
                      />
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="location">
                      Location
                    </Text>
                    <TextField.Root
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter location where administered"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="documents">
                      Upload Documents
                    </Text>
                    <input
                      type="file"
                      id="documents"
                      multiple
                      onChange={handleDocumentChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--gray-6)',
                        borderRadius: 'var(--radius-2)'
                      }}
                    />
                    {documents.length > 0 && (
                      <Box mt="2">
                        <Text size="2" weight="bold">Selected Documents:</Text>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          {documents.map((doc, index) => (
                            <li key={index} style={{ marginBottom: '4px' }}>
                              <Flex align="center" gap="2">
                                <Text size="2">{doc.name}</Text>
                                <Button
                                  size="1"
                                  variant="soft"
                                  color="red"
                                  onClick={() => removeDocument(index)}
                                >
                                  Remove
                                </Button>
                              </Flex>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="notes">
                      Notes
                    </Text>
                    <TextArea
                      id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional notes"
                    />
                  </Box>

                  <Flex gap="3" mt="4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Vaccination'}
                    </Button>
                    <Button
                      type="button"
                      variant="soft"
                      onClick={() => router.push(`/pets/${petId}`)}
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Flex>
              </form>
            )}
          </Flex>
        </Card>
      </Container>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="AddVaccination">
        {addVaccinationContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
