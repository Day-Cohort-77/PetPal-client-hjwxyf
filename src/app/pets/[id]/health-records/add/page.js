'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { getPetById } from '../../../../../services/petService';
import { createHealthRecord } from '../../../../../services/healthRecordService';
import Navbar from '../../../../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import FeatureErrorBoundary from '../../../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select, TextArea } from '@radix-ui/themes';

export default function AddVetVisit() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    veterinarianName: '',
    clinicName: '',
    reason: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    followUpNeeded: false,
    followUpDate: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState([]);

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
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
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
        recordType: 'VET_VISIT',
        // Convert dates to ISO format
        visitDate: new Date(formData.visitDate).toISOString(),
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : null
      };

      // Call API to create health record
      const newRecord = await createHealthRecord(healthRecordData);

      // Redirect back to pet details page
      router.push(`/pets/${petId}?tab=health`);
    } catch (err) {
      console.error('Error adding vet visit:', err);
      setError('Failed to add vet visit. Please try again.');
      setIsSaving(false);
    }
  };

  const addVetVisitContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Add Vet Visit for {pet?.name || 'Pet'}</Heading>

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
                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="visitDate">
                        Visit Date*
                      </Text>
                      <TextField.Root
                        id="visitDate"
                        type="date"
                        value={formData.visitDate}
                        onChange={handleChange}
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="clinicName">
                        Clinic Name
                      </Text>
                      <TextField.Root
                        id="clinicName"
                        value={formData.clinicName}
                        onChange={handleChange}
                        placeholder="Enter clinic name"
                      />
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="veterinarianName">
                      Veterinarian Name
                    </Text>
                    <TextField.Root
                      id="veterinarianName"
                      value={formData.veterinarianName}
                      onChange={handleChange}
                      placeholder="Enter veterinarian name"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="reason">
                      Reason for Visit*
                    </Text>
                    <TextField.Root
                      id="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Enter reason for visit"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="diagnosis">
                      Diagnosis
                    </Text>
                    <TextArea
                      id="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      placeholder="Enter diagnosis"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="treatment">
                      Treatment
                    </Text>
                    <TextArea
                      id="treatment"
                      value={formData.treatment}
                      onChange={handleChange}
                      placeholder="Enter treatment details"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="medications">
                      Medications Prescribed
                    </Text>
                    <TextArea
                      id="medications"
                      value={formData.medications}
                      onChange={handleChange}
                      placeholder="Enter medications prescribed"
                    />
                  </Box>

                  <Box>
                    <Flex align="center" gap="2">
                      <input
                        type="checkbox"
                        id="followUpNeeded"
                        checked={formData.followUpNeeded}
                        onChange={handleChange}
                      />
                      <Text as="label" size="2" htmlFor="followUpNeeded">
                        Follow-up Needed
                      </Text>
                    </Flex>
                  </Box>

                  {formData.followUpNeeded && (
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="followUpDate">
                        Follow-up Date
                      </Text>
                      <TextField.Root
                        id="followUpDate"
                        type="date"
                        value={formData.followUpDate}
                        onChange={handleChange}
                      />
                    </Box>
                  )}

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
                      Additional Notes
                    </Text>
                    <TextArea
                      id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional notes"
                      style={{ minHeight: '100px' }}
                    />
                  </Box>

                  <Flex gap="3" mt="4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Vet Visit'}
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
      <FeatureErrorBoundary featureName="AddVetVisit">
        {addVetVisitContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
