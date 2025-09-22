'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAppointments, getAllAppointments } from '../../services/appointmentService';
import Navbar from '../../components/Navbar';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, Button, Box, Tabs, Table, Badge } from '@radix-ui/themes';
import Link from 'next/link';
import { FiPlus, FiCalendar, FiClock, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function Appointments() {
  const { user, isAdmin, isVeterinarian } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch appointments based on user role
    const fetchAppointments = async () => {
      try {
        let appointmentsData;

        if (isAdmin()) {
          // Admin sees all appointments
          appointmentsData = await getAllAppointments();
        } else {
          // Veterinarians and pet owners see their appointments
          appointmentsData = await getUserAppointments();
        }

        setAppointments(appointmentsData || []);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user, router, isAdmin]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
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

  const appointmentsContent = (
    <>
      <Navbar />
      <Container size="3" py="9">
        <Flex direction="column" gap="6">
          <Flex justify="between" align="center">
            <Heading size="8">Appointments</Heading>
            <Button onClick={() => router.push('/appointments/add')}>
              <FiPlus />
              New Appointment
            </Button>
          </Flex>

          {error && (
            <Text color="red" size="2">
              {error}
            </Text>
          )}

          {isLoading ? (
            <Text>Loading appointments...</Text>
          ) : (
            <Tabs.Root defaultValue="upcoming">
              <Tabs.List>
                <Tabs.Trigger value="upcoming">Upcoming</Tabs.Trigger>
                <Tabs.Trigger value="past">Past</Tabs.Trigger>
                <Tabs.Trigger value="all">All</Tabs.Trigger>
              </Tabs.List>

              <Box pt="4">
                <Tabs.Content value="upcoming">
                  <AppointmentsList
                    appointments={appointments.filter(apt => new Date(apt.appointmentDate) >= new Date())}
                    router={router}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getStatusColor={getStatusColor}
                    isAdmin={isAdmin()}
                    isVeterinarian={isVeterinarian()}
                  />
                </Tabs.Content>

                <Tabs.Content value="past">
                  <AppointmentsList
                    appointments={appointments.filter(apt => new Date(apt.appointmentDate) < new Date())}
                    router={router}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getStatusColor={getStatusColor}
                    isAdmin={isAdmin()}
                    isVeterinarian={isVeterinarian()}
                  />
                </Tabs.Content>

                <Tabs.Content value="all">
                  <AppointmentsList
                    appointments={appointments}
                    router={router}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getStatusColor={getStatusColor}
                    isAdmin={isAdmin()}
                    isVeterinarian={isVeterinarian()}
                  />
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          )}
        </Flex>
      </Container>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="Appointments">
        {appointmentsContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}

// Helper component for displaying appointments list
function AppointmentsList({ appointments, router, formatDate, formatTime, getStatusColor, isAdmin, isVeterinarian }) {
  if (appointments.length === 0) {
    return (
      <Card>
        <Flex direction="column" align="center" gap="4" p="6">
          <Text>No appointments found.</Text>
          <Button onClick={() => router.push('/appointments/add')}>Schedule an Appointment</Button>
        </Flex>
      </Card>
    );
  }

  return (
    <Card>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Pet</Table.ColumnHeaderCell>
            {(isAdmin || isVeterinarian) && (
              <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
            )}
            <Table.ColumnHeaderCell>Veterinarian</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Reason</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {appointments.map((appointment) => (
            <Table.Row key={appointment.id}>
              <Table.Cell>{formatDate(appointment.appointmentDate)}</Table.Cell>
              <Table.Cell>{formatTime(appointment.appointmentTime)}</Table.Cell>
              <Table.Cell>
                <Link href={`/pets/${appointment.petId}`} style={{ textDecoration: 'none' }}>
                  {appointment.petName}
                </Link>
              </Table.Cell>
              {(isAdmin || isVeterinarian) && (
                <Table.Cell>{appointment.ownerName}</Table.Cell>
              )}
              <Table.Cell>{appointment.veterinarianName}</Table.Cell>
              <Table.Cell>{appointment.reason}</Table.Cell>
              <Table.Cell>
                <Badge color={getStatusColor(appointment.status)}>
                  {appointment.status || 'Unknown'}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Flex gap="2">
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={() => router.push(`/appointments/${appointment.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={() => router.push(`/appointments/${appointment.id}/edit`)}
                  >
                    <FiEdit2 />
                  </Button>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Card>
  );
}