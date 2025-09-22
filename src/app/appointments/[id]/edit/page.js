'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { getAppointmentById, updateAppointment } from '../../../../services/appointmentService';
import { getUserPets } from '../../../../services/petService';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Navbar from '../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, Button, Box, TextField, Select, TextArea } from '@radix-ui/themes'
import { FiArrowLeft, FiCalendar, FiClock } from 'react-icons/fi';

export default function EditAppointment() {
  const { user, isAdmin, isVeterinarian } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id;

  const [formData, setFormData] = useState({
    petId: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
    veterinarianId: '',
    status: 'Scheduled'
  });

  const [originalAppointment, setOriginalAppointment] = useState(null);
  const [pets, setPets] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointment details
        const appointmentData = await getAppointmentById(appointmentId);
        setOriginalAppointment(appointmentData);

        // Set form data from appointment
        setFormData({
          petId: appointmentData.petId?.toString() || '',
          appointmentDate: appointmentData.appointmentDate.split('T')[0] || '',
          appointmentTime: appointmentData.appointmentTime || '',
          appointmentType: appointmentData.appointmentType || '',
          notes: appointmentData.notes || '',
          veterinarianId: appointmentData.veterinarianId?.toString() || '',
          status: appointmentData.status || 'Scheduled'
        });

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
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (appointmentId) {
      fetchData();
    }
  }, [user, router, appointmentId]);

  // Check if user can edit this appointment
  const canModify = () => {
    if (!user || !originalAppointment) return false;

    // Admins can modify any appointment
    if (isAdmin()) return true;

    // Veterinarians can modify their own appointments
    if (isVeterinarian() && originalAppointment.veterinarianId === user.id) return true;

    // Pet owners can modify their pets' appointments
    if (originalAppointment.isOwner) return true;

    return false;
  };

  useEffect(() => {
    // Redirect if user can't modify this appointment
    if (!isLoading && !canModify()) {
      router.push(`/appointments/${appointmentId}`);
    }
  }, [isLoading, canModify, router, appointmentId]);

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
      date: value
    }));

    // Clear error for this field if it exists
    if (formErrors.date) {
      setFormErrors(prev => ({
        ...prev,
        date: ''
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
    if (!formData.status) errors.status = 'Please select a status';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Date is already in the correct format (YYYY-MM-DD) from the input

      await updateAppointment(appointmentId, formData);
      router.push(`/appointments/${appointmentId}`);
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editAppointmentContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Flex mb="4">
          <Button variant="soft" onClick={() => router.push(`/appointments/${appointmentId}`)}>
            <FiArrowLeft /> Back to Appointment
          </Button>
        </Flex>

        <Card>
          <Flex direction="column" gap="6" p="6">
            <Heading size="6">Edit Appointment</Heading>

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
                      <Text as="label" size="2" weight="bold" htmlFor="date">
                        Date *
                      </Text>
                      <Flex align="center" gap="2">
                        <TextField.Root style={{ flex: 1 }}
                            type="date"
                            name="appointmentDate"
                            value={formData.appointmentDate}
                            onChange={handleDateChange}
                          />
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
                      disabled={isVeterinarian() && !isAdmin()} // Disable if user is a vet but not admin
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
                    <Text as="label" size="2" weight="bold" htmlFor="status">
                      Status *
                    </Text>
                    <Select.Root
                      name="status"
                      value={formData.status}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, status: value }));
                        if (formErrors.status) {
                          setFormErrors(prev => ({ ...prev, status: '' }));
                        }
                      }}
                    >
                      <Select.Trigger placeholder="Select status" />
                      <Select.Content>
                        <Select.Item value="Scheduled">Scheduled</Select.Item>
                        <Select.Item value="Completed">Completed</Select.Item>
                        <Select.Item value="Cancelled">Cancelled</Select.Item>
                        <Select.Item value="Pending">Pending</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    {formErrors.status && (
                      <Text color="red" size="1">{formErrors.status}</Text>
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
                      onClick={() => router.push(`/appointments/${appointmentId}`)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
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
      <FeatureErrorBoundary featureName="EditAppointment">
        {editAppointmentContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}