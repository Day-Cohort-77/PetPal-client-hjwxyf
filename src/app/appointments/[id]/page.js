'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { getAppointmentById, deleteAppointment } from '../../../services/appointmentService';
import Navbar from '../../../components/Navbar';
import FeatureErrorBoundary from '../../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, Button, Box, Badge, Dialog, IconButton } from '@radix-ui/themes';
import Link from 'next/link';
import { FiEdit2, FiTrash2, FiArrowLeft, FiCalendar, FiClock, FiUser, FiMapPin } from 'react-icons/fi';

export default function AppointmentDetails() {
  const { user, isAdmin, isVeterinarian } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id;

  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch appointment details
    const fetchAppointment = async () => {
      try {
        const appointmentData = await getAppointmentById(appointmentId);
        setAppointment(appointmentData);
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        setError('Failed to load appointment details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [user, router, appointmentId]);

  const handleEdit = () => {
    router.push(`/appointments/${appointmentId}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment(appointmentId);
      router.push('/appointments');
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Failed to delete appointment. Please try again.');
      setIsDeleteDialogOpen(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  // Check if user can edit/delete this appointment
  const canModify = () => {
    if (!user || !appointment) return false;

    // Admins can modify any appointment
    if (isAdmin()) return true;

    // Veterinarians can modify their own appointments
    if (isVeterinarian() && appointment.veterinarianId === user.id) return true;

    // Pet owners can modify their pets' appointments
    if (appointment.ownerId === user.id) return true;

    return false;
  };

  const appointmentDetailsContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Flex mb="4">
          <Button variant="soft" onClick={() => router.push('/appointments')}>
            <FiArrowLeft /> Back to Appointments
          </Button>
        </Flex>

        {isLoading ? (
          <Text>Loading appointment details...</Text>
        ) : error ? (
          <Card>
            <Flex direction="column" align="center" gap="4" p="6">
              <Text color="red">{error}</Text>
              <Button onClick={() => router.push('/appointments')}>Back to Appointments</Button>
            </Flex>
          </Card>
        ) : appointment ? (
          <Flex direction="column" gap="6">
            <Card>
              <Flex justify="between" align="start" p="4">
                <Box>
                  <Heading size="6">Appointment Details</Heading>
                  <Flex align="center" gap="2" mt="2">
                    <Badge color={getStatusColor(appointment.status)}>
                      {appointment.status || 'Unknown'}
                    </Badge>
                  </Flex>
                </Box>
                {canModify() && (
                  <Flex gap="2">
                    <IconButton variant="soft" onClick={handleEdit}>
                      <FiEdit2 />
                    </IconButton>
                    <IconButton
                      variant="soft"
                      color="red"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </Flex>
                )}
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="4" p="4">
                <Heading size="4">Appointment Information</Heading>

                <Flex direction="column" gap="3">
                  <InfoItem
                    icon={<FiCalendar />}
                    label="Date"
                    value={formatDate(appointment.appointmentDate)}
                  />
                  <InfoItem
                    icon={<FiClock />}
                    label="Time"
                    value={appointment.appointmentTime || 'N/A'}
                  />
                  <InfoItem
                    icon={<FiUser />}
                    label="Pet"
                    value={
                      <Link href={`/pets/${appointment.petId}`} style={{ textDecoration: 'none' }}>
                        {appointment.petName || 'Unknown Pet'}
                      </Link>
                    }
                  />
                  <InfoItem
                    icon={<FiUser />}
                    label="Veterinarian"
                    value={appointment.veterinarianName || 'Not assigned'}
                  />
                  {(isAdmin() || isVeterinarian()) && (
                    <InfoItem
                      icon={<FiUser />}
                      label="Pet Owner"
                      value={appointment.ownerName || 'Unknown'}
                    />
                  )}
                  <InfoItem
                    icon={<FiMapPin />}
                    label="Location"
                    value={appointment.location || 'Not specified'}
                  />
                </Flex>

                <Box mt="2">
                  <Text size="2" weight="bold">Reason for Visit:</Text>
                  <Text size="2">{appointment.reason || 'Not specified'}</Text>
                </Box>

                {appointment.notes && (
                  <Box mt="2">
                    <Text size="2" weight="bold">Notes:</Text>
                    <Text size="2">{appointment.notes}</Text>
                  </Box>
                )}
              </Flex>
            </Card>
          </Flex>
        ) : (
          <Card>
            <Flex direction="column" align="center" gap="4" p="6">
              <Text>Appointment not found.</Text>
              <Button onClick={() => router.push('/appointments')}>Back to Appointments</Button>
            </Flex>
          </Card>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Cancel Appointment</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">Keep Appointment</Button>
            </Dialog.Close>
            <Button color="red" onClick={handleDelete}>
              Cancel Appointment
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="AppointmentDetails">
        {appointmentDetailsContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}

// Helper component for displaying appointment information
function InfoItem({ icon, label, value }) {
  return (
    <Flex align="center" gap="2">
      <Box style={{ color: 'var(--accent-9)' }}>
        {icon}
      </Box>
      <Text size="2" weight="bold">{label}:</Text>
      <Text size="2">{value}</Text>
    </Flex>
  );
}