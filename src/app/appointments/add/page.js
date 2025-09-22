'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { createAppointment } from '../../../services/appointmentService';
import { getUserPets } from '../../../services/petService';
import Navbar from '../../../components/Navbar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import FeatureErrorBoundary from '../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, Button, Box, TextField, Select, TextArea } from '@radix-ui/themes';
import { FiArrowLeft, FiCalendar, FiClock } from 'react-icons/fi';

export default function AddAppointment() {
  const { user, isAdmin, isVeterinarian } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    petId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    notes: '',
    veterinarianId: '',
    status: 'Scheduled'
  });

  const [pets, setPets] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Fetch user's pets and veterinarians
    const fetchData = async () => {
      try {
        // Fetch pets
        const petsData = await getUserPets();
        setPets(petsData || []);

        // TODO: Fetch veterinarians from API when endpoint is available
        // For now, use sample data
        setVeterinarians([
          { id: 1, name: 'Dr. Sarah Johnson' },
          { id: 2, name: 'Dr. Michael Chen' },
          { id: 3, name: 'Dr. Emily Rodriguez' }
        ]);

        // If user is a veterinarian, pre-select them
        if (isVeterinarian()) {
          setFormData(prev => ({
            ...prev,
            veterinarianId: user.id
          }));
        }

        // If there's only one pet, pre-select it
        if (petsData && petsData.length === 1) {
          setFormData(prev => ({
            ...prev,
            petId: petsData[0].id
          }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, router, isVeterinarian]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      appointmentDate: value
    }));

    // Clear error for this field if it exists
    if (formErrors.appointmentDate) {
      setFormErrors(prev => ({
        ...prev,
        appointmentDate: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.petId) errors.petId = 'Please select a pet';
    if (!formData.appointmentDate) errors.appointmentDate = 'Please select a date';
    if (!formData.appointmentTime) errors.appointmentTime = 'Please select a time';
    if (!formData.appointmentType) errors.appointmentType = 'Please provide a reason for the appointment';
    if (!formData.veterinarianId) errors.veterinarianId = 'Please select a veterinarian';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Date is already in the correct format (YYYY-MM-DD) from the input
      await createAppointment(formData);
      router.push('/appointments');
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Failed to create appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAppointmentContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Flex mb="4">
          <Button variant="soft" onClick={() => router.push('/appointments')}>
            <FiArrowLeft /> Back to Appointments
          </Button>
        </Flex>

        <Card>
          <Flex direction="column" gap="6" p="6">
            <Heading size="6">Schedule New Appointment</Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading...</Text>
            ) : (
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text as="label" size="2" weight="bold" htmlFor="petId">
                      Pet *
                    </Text>
                    <Select.Root
                      name="petId"
                      value={formData.petId}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, petId: value }));
                        if (formErrors.petId) {
                          setFormErrors(prev => ({ ...prev, petId: '' }));
                        }
                      }}
                    >
                      <Select.Trigger placeholder="Select a pet" />
                      <Select.Content>
                        {pets.length === 0 ? (
                          <Select.Item value="0">No pets available</Select.Item>
                        ) : (
                          <>
                            <Select.Item value="0">Select a pet</Select.Item>
                            {pets.map(pet => (
                              <Select.Item key={pet.id} value={pet.id.toString()}>
                                {pet.name}
                              </Select.Item>
                            ))}
                          </>
                        )}
                      </Select.Content>
                    </Select.Root>
                    {formErrors.petId && (
                      <Text color="red" size="1">{formErrors.petId}</Text>
                    )}
                  </Box>

                  <Flex gap="4">
                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="bold" htmlFor="appointmentDate">
                        Date *
                      </Text>
                      <Flex align="center" gap="2">
                        <TextField.Root style={{ flex: 1 }}
                            type="date"
                            name="appointmentDate"
                            value={formData.appointmentDate}
                            onChange={handleDateChange} />
                        <FiCalendar />
                      </Flex>
                      {formErrors.appointmentDate && (
                        <Text color="red" size="1">{formErrors.appointmentDate}</Text>
                      )}
                    </Box>

                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="bold" htmlFor="time">
                        Time *
                      </Text>
                      <Flex align="center" gap="2">
                        <TextField.Root style={{ flex: 1 }}
                            type="time"
                            name="appointmentTime"
                            value={formData.appointmentTime}
                            onChange={handleChange}
                            placeholder="Select time"
                          />
                        <FiClock />
                      </Flex>
                      {formErrors.appointmentTime && (
                        <Text color="red" size="1">{formErrors.appointmentTime}</Text>
                      )}
                    </Box>
                  </Flex>

                  <Box>
                    <Text as="label" size="2" weight="bold" htmlFor="veterinarianId">
                      Veterinarian *
                    </Text>
                    <Select.Root
                      name="veterinarianId"
                      value={formData.veterinarianId}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, veterinarianId: value }));
                        if (formErrors.veterinarianId) {
                          setFormErrors(prev => ({ ...prev, veterinarianId: '' }));
                        }
                      }}
                      disabled={isVeterinarian()} // Disable if user is a vet (they're pre-selected)
                    >
                      <Select.Trigger placeholder="Select a veterinarian" />
                      <Select.Content>
                        <Select.Item value="0">Select a veterinarian</Select.Item>
                        {veterinarians.map(vet => (
                          <Select.Item key={vet.id} value={vet.id.toString()}>
                            {vet.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    {formErrors.veterinarianId && (
                      <Text color="red" size="1">{formErrors.veterinarianId}</Text>
                    )}
                  </Box>

                  <Box>
                    <Text as="label" size="2" weight="bold" htmlFor="appointmentType">
                      Reason for Visit *
                    </Text>
                    <TextField.Root
                        name="appointmentType"
                        value={formData.appointmentType}
                        onChange={handleChange}
                        placeholder="Enter reason for visit"
                      />
                    {formErrors.appointmentType && (
                      <Text color="red" size="1">{formErrors.appointmentType}</Text>
                    )}
                  </Box>

                  <Box>
                    <Text as="label" size="2" weight="bold" htmlFor="notes">
                      Additional Notes
                    </Text>
                    <TextArea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional notes"
                    />
                  </Box>

                  <Flex gap="3" mt="4" justify="end">
                    <Button
                      variant="soft"
                      onClick={() => router.push('/appointments')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || pets.length === 0}
                    >
                      {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
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
      <FeatureErrorBoundary featureName="AddAppointment">
        {addAppointmentContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}