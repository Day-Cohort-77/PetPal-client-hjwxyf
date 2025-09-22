'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, Button, Box, Tabs, Select } from '@radix-ui/themes';
import { FiCalendar, FiClock, FiAlertCircle, FiActivity } from 'react-icons/fi';

export default function Calendar() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // Fetch events
    const fetchEvents = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use sample data
        const today = new Date();
        const sampleEvents = [
          {
            id: 1,
            type: 'VET_VISIT',
            petId: 1,
            petName: 'Max',
            title: 'Annual Checkup',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString(),
            time: '10:00 AM',
            location: 'Happy Paws Veterinary Clinic'
          },
          {
            id: 2,
            type: 'MEDICATION',
            petId: 1,
            petName: 'Max',
            title: 'Heartworm Medication',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString(),
            time: '08:00 AM',
            notes: 'Give with food'
          },
          {
            id: 3,
            type: 'VACCINATION',
            petId: 2,
            petName: 'Bella',
            title: 'Rabies Vaccination',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString(),
            time: '02:30 PM',
            location: 'City Pet Hospital'
          },
          {
            id: 4,
            type: 'GROOMING',
            petId: 2,
            petName: 'Bella',
            title: 'Grooming Appointment',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toISOString(),
            time: '11:00 AM',
            location: 'Furry Friends Grooming'
          },
          {
            id: 5,
            type: 'MEDICATION',
            petId: 1,
            petName: 'Max',
            title: 'Flea & Tick Treatment',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10).toISOString(),
            time: '06:00 PM',
            notes: 'Apply to back of neck'
          },
          {
            id: 6,
            type: 'WEIGHT_CHECK',
            petId: 1,
            petName: 'Max',
            title: 'Monthly Weight Check',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14).toISOString(),
            time: '09:00 AM'
          },
          {
            id: 7,
            type: 'VET_VISIT',
            petId: 2,
            petName: 'Bella',
            title: 'Dental Cleaning',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21).toISOString(),
            time: '01:00 PM',
            location: 'Happy Paws Veterinary Clinic'
          }
        ];

        setEvents(sampleEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user, router]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get days until an event
  const getDaysUntil = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  // Get icon for event type
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'VET_VISIT':
        return <FiCalendar />;
      case 'MEDICATION':
        return <FiClock />;
      case 'VACCINATION':
        return <FiAlertCircle />;
      case 'GROOMING':
        return <FiActivity />;
      case 'WEIGHT_CHECK':
        return <FiActivity />;
      default:
        return <FiCalendar />;
    }
  };

  // Get color for event type
  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'VET_VISIT':
        return 'var(--blue-9)';
      case 'MEDICATION':
        return 'var(--green-9)';
      case 'VACCINATION':
        return 'var(--amber-9)';
      case 'GROOMING':
        return 'var(--purple-9)';
      case 'WEIGHT_CHECK':
        return 'var(--cyan-9)';
      default:
        return 'var(--gray-9)';
    }
  };

  // Filter events based on type
  const filteredEvents = filterType === 'all'
    ? events
    : events.filter(event => event.type === filterType);

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  // Group events by date for list view
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const date = new Date(event.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});

  // Handle previous month/week
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  // Handle next month/week
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // Get current view title
  const getViewTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.toLocaleDateString('en-US', { month: 'long' })} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
        return `${weekStart.toLocaleDateString('en-US', { month: 'short' })} ${weekStart.getDate()} - ${weekEnd.toLocaleDateString('en-US', { month: 'short' })} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      } else {
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    } else {
      return 'All Events';
    }
  };

  const calendarContent = (
    <>
      <Navbar />
      <Container size="3" py="9">
        <Flex direction="column" gap="6">
          <Flex justify="between" align="center">
            <Heading size="6">Calendar</Heading>
            <Flex gap="2">
              <Select.Root
                value={viewMode}
                onValueChange={setViewMode}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="month">Month View</Select.Item>
                  <Select.Item value="week">Week View</Select.Item>
                  <Select.Item value="list">List View</Select.Item>
                </Select.Content>
              </Select.Root>

              <Select.Root
                value={filterType}
                onValueChange={setFilterType}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="all">All Events</Select.Item>
                  <Select.Item value="VET_VISIT">Vet Visits</Select.Item>
                  <Select.Item value="MEDICATION">Medications</Select.Item>
                  <Select.Item value="VACCINATION">Vaccinations</Select.Item>
                  <Select.Item value="GROOMING">Grooming</Select.Item>
                  <Select.Item value="WEIGHT_CHECK">Weight Checks</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>

          {error && (
            <Text color="red" size="2">
              {error}
            </Text>
          )}

          {isLoading ? (
            <Text>Loading events...</Text>
          ) : (
            <>
              {viewMode !== 'list' && (
                <Card>
                  <Flex justify="between" align="center" p="4">
                    <Button variant="soft" onClick={handlePrevious}>Previous</Button>
                    <Heading size="4">{getViewTitle()}</Heading>
                    <Button variant="soft" onClick={handleNext}>Next</Button>
                  </Flex>
                </Card>
              )}

              <Tabs.Root defaultValue="upcoming">
                <Tabs.List>
                  <Tabs.Trigger value="upcoming">Upcoming</Tabs.Trigger>
                  <Tabs.Trigger value="past">Past</Tabs.Trigger>
                </Tabs.List>

                <Box pt="4">
                  <Tabs.Content value="upcoming">
                    {viewMode === 'list' ? (
                      // List view
                      <Card>
                        <Flex direction="column" gap="4" p="4">
                          <Heading size="4">Upcoming Events</Heading>

                          {Object.keys(groupedEvents).length === 0 ? (
                            <Text>No upcoming events found.</Text>
                          ) : (
                            Object.entries(groupedEvents).map(([date, dayEvents]) => (
                              <Box key={date}>
                                <Text size="3" weight="bold" style={{ marginBottom: '8px' }}>
                                  {new Date(date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </Text>
                                <Flex direction="column" gap="2">
                                  {dayEvents.map(event => (
                                    <Card key={event.id}>
                                      <Flex gap="3" p="2">
                                        <Box style={{
                                          color: getEventColor(event.type),
                                          fontSize: '1.5rem'
                                        }}>
                                          {getEventIcon(event.type)}
                                        </Box>
                                        <Box style={{ flex: 1 }}>
                                          <Flex justify="between" align="start">
                                            <Box>
                                              <Text size="2" weight="bold">{event.title}</Text>
                                              <Text size="1" color="gray">
                                                {event.petName} • {event.time}
                                              </Text>
                                              {event.location && (
                                                <Text size="1">{event.location}</Text>
                                              )}
                                            </Box>
                                            <Text size="1" color="blue">
                                              {getDaysUntil(event.date)}
                                            </Text>
                                          </Flex>
                                        </Box>
                                      </Flex>
                                    </Card>
                                  ))}
                                </Flex>
                              </Box>
                            ))
                          )}
                        </Flex>
                      </Card>
                    ) : (
                      // Month or Week view (placeholder)
                      <Card>
                        <Flex direction="column" gap="4" p="4">
                          <Text>
                            {viewMode === 'month' ? 'Month' : 'Week'} view will be implemented here.
                          </Text>
                          <Text>
                            For now, you can use the list view to see upcoming events.
                          </Text>
                        </Flex>
                      </Card>
                    )}
                  </Tabs.Content>

                  <Tabs.Content value="past">
                    <Card>
                      <Flex direction="column" gap="4" p="4">
                        <Heading size="4">Past Events</Heading>
                        <Text>Past events will be displayed here.</Text>
                      </Flex>
                    </Card>
                  </Tabs.Content>
                </Box>
              </Tabs.Root>
            </>
          )}
        </Flex>
      </Container>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="Calendar">
        {calendarContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}