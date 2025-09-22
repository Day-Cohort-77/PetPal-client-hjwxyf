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

export default function EditFeedingSchedule() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [feedingSchedule, setFeedingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    foodType: '',
    foodBrand: '',
    portionSize: '',
    portionUnit: 'cups',
    feedingTimes: ['08:00', '18:00'],
    specialInstructions: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Portion units for selection
  const portionUnits = [
    { value: 'cups', label: 'cups' },
    { value: 'grams', label: 'grams (g)' },
    { value: 'ounces', label: 'ounces (oz)' },
    { value: 'pieces', label: 'pieces' },
    { value: 'scoops', label: 'scoops' },
    { value: 'tablespoons', label: 'tablespoons (tbsp)' },
    { value: 'teaspoons', label: 'teaspoons (tsp)' }
  ];

  // Check if user is authenticated and fetch pet data
  useEffect(() => {

    const fetchPet = async () => {
      try {
        const petData = await getPetById(petId);
        setPet(petData);

        // Fetch existing feeding schedule if available
        // This would typically be a separate API call
        // For now, we'll just simulate it
        try {
          // Simulated API call to get feeding schedule
          // In a real app, this would be something like:
          // const scheduleData = await getFeedingSchedule(petId);

          // For demo purposes, we'll just check if the pet has a feeding schedule property
          if (petData.feedingSchedule) {
            setFeedingSchedule(petData.feedingSchedule);
            setFormData({
              foodType: petData.feedingSchedule.foodType || '',
              foodBrand: petData.feedingSchedule.foodBrand || '',
              portionSize: petData.feedingSchedule.portionSize || '',
              portionUnit: petData.feedingSchedule.portionUnit || 'cups',
              feedingTimes: petData.feedingSchedule.feedingTimes || ['08:00', '18:00'],
              specialInstructions: petData.feedingSchedule.specialInstructions || '',
              notes: petData.feedingSchedule.notes || ''
            });
          }
        } catch (scheduleErr) {
          console.error('Error fetching feeding schedule:', scheduleErr);
          // Continue with default form data if schedule can't be fetched
        }
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

  const handleFeedingTimeChange = (index, value) => {
    const newFeedingTimes = [...formData.feedingTimes];
    newFeedingTimes[index] = value;
    setFormData(prev => ({
      ...prev,
      feedingTimes: newFeedingTimes
    }));
  };

  const addFeedingTime = () => {
    setFormData(prev => ({
      ...prev,
      feedingTimes: [...prev.feedingTimes, '12:00']
    }));
  };

  const removeFeedingTime = (index) => {
    const newFeedingTimes = formData.feedingTimes.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      feedingTimes: newFeedingTimes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Prepare feeding schedule data
      const scheduleData = {
        ...formData,
        petId,
        recordType: 'FEEDING_SCHEDULE'
      };

      // Call API to create/update feeding schedule
      // In a real app, this might be a different endpoint
      // For now, we'll use the health record endpoint
      const newRecord = await createHealthRecord(scheduleData);

      // Redirect back to pet details page
      router.push(`/pets/${petId}?tab=feeding`);
    } catch (err) {
      console.error('Error saving feeding schedule:', err);
      setError('Failed to save feeding schedule. Please try again.');
      setIsSaving(false);
    }
  };

  const editFeedingScheduleContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">
              {feedingSchedule ? 'Edit' : 'Create'} Feeding Schedule for {pet?.name || 'Pet'}
            </Heading>

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
                      <Text as="label" size="2" mb="1" htmlFor="foodType">
                        Food Type*
                      </Text>
                      <TextField.Root
                        id="foodType"
                        value={formData.foodType}
                        onChange={handleChange}
                        placeholder="E.g., Dry, Wet, Raw, etc."
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="foodBrand">
                        Food Brand
                      </Text>
                      <TextField.Root
                        id="foodBrand"
                        value={formData.foodBrand}
                        onChange={handleChange}
                        placeholder="Enter food brand"
                      />
                    </Box>
                  </Grid>

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="portionSize">
                        Portion Size*
                      </Text>
                      <TextField.Root
                        id="portionSize"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.portionSize}
                        onChange={handleChange}
                        placeholder="Enter portion size"
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="portionUnit">
                        Unit
                      </Text>
                      <Select.Root
                        value={formData.portionUnit}
                        onValueChange={(value) => handleSelectChange('portionUnit', value)}
                      >
                        <Select.Trigger id="portionUnit" />
                        <Select.Content>
                          {portionUnits.map(unit => (
                            <Select.Item key={unit.value} value={unit.value}>
                              {unit.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Grid>

                  <Box>
                    <Text size="2" mb="2">Feeding Times*</Text>
                    {formData.feedingTimes.map((time, index) => (
                      <Flex key={index} gap="2" mb="2" align="center">
                        <TextField.Root
                          type="time"
                          value={time}
                          onChange={(e) => handleFeedingTimeChange(index, e.target.value)}
                          style={{ flexGrow: 1 }}
                          required
                        />
                        {formData.feedingTimes.length > 1 && (
                          <Button
                            type="button"
                            size="1"
                            variant="soft"
                            color="red"
                            onClick={() => removeFeedingTime(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </Flex>
                    ))}
                    <Button
                      type="button"
                      size="1"
                      variant="soft"
                      onClick={addFeedingTime}
                    >
                      Add Feeding Time
                    </Button>
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="specialInstructions">
                      Special Instructions
                    </Text>
                    <TextArea
                      id="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleChange}
                      placeholder="Enter any special feeding instructions"
                    />
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
                    />
                  </Box>

                  <Flex gap="3" mt="4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Feeding Schedule'}
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
      <FeatureErrorBoundary featureName="EditFeedingSchedule">
        {editFeedingScheduleContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
