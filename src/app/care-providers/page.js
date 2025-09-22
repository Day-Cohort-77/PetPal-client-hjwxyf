'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, Button, Box, Grid, Dialog, TextField, TextArea, Select } from '@radix-ui/themes';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

export default function CareProviders() {
  const { user } = useAuth();
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'VETERINARIAN',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  // Provider types for selection
  const providerTypes = [
    { value: 'VETERINARIAN', label: 'Veterinarian' },
    { value: 'GROOMER', label: 'Groomer' },
    { value: 'TRAINER', label: 'Trainer' },
    { value: 'BOARDING', label: 'Boarding Facility' },
    { value: 'SITTER', label: 'Pet Sitter' },
    { value: 'WALKER', label: 'Dog Walker' },
    { value: 'OTHER', label: 'Other' }
  ];

  useEffect(() => {
    // Fetch care providers
    const fetchProviders = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use sample data
        const sampleProviders = [
          {
            id: 1,
            name: 'Dr. Sarah Johnson',
            type: 'VETERINARIAN',
            phone: '(555) 123-4567',
            email: 'dr.johnson@vetclinic.com',
            address: '123 Main St, Anytown, USA',
            notes: 'Primary veterinarian for all pets'
          },
          {
            id: 2,
            name: 'Happy Paws Grooming',
            type: 'GROOMER',
            phone: '(555) 987-6543',
            email: 'appointments@happypaws.com',
            address: '456 Oak Ave, Anytown, USA',
            notes: 'Preferred groomer for Max'
          },
          {
            id: 3,
            name: 'Pet Paradise Boarding',
            type: 'BOARDING',
            phone: '(555) 789-0123',
            email: 'info@petparadise.com',
            address: '789 Pine Rd, Anytown, USA',
            notes: 'Used for holiday boarding'
          }
        ];

        setProviders(sampleProviders);
      } catch (err) {
        console.error('Error fetching care providers:', err);
        setError('Failed to load care providers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [user, router]);

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

  const handleAddProvider = () => {
    setFormData({
      name: '',
      type: 'VETERINARIAN',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleEditProvider = (provider) => {
    setCurrentProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      phone: provider.phone,
      email: provider.email,
      address: provider.address,
      notes: provider.notes
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteProvider = (provider) => {
    setCurrentProvider(provider);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    try {
      // In a real app, this would be an API call to create a provider
      // For now, we'll just add it to the local state
      const newProvider = {
        id: Date.now(), // Use timestamp as temporary ID
        ...formData
      };

      setProviders(prev => [...prev, newProvider]);
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Error adding care provider:', err);
      setError('Failed to add care provider. Please try again.');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    try {
      // In a real app, this would be an API call to update a provider
      // For now, we'll just update the local state
      const updatedProviders = providers.map(provider =>
        provider.id === currentProvider.id ? { ...provider, ...formData } : provider
      );

      setProviders(updatedProviders);
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating care provider:', err);
      setError('Failed to update care provider. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      // In a real app, this would be an API call to delete a provider
      // For now, we'll just update the local state
      const updatedProviders = providers.filter(provider => provider.id !== currentProvider.id);

      setProviders(updatedProviders);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting care provider:', err);
      setError('Failed to delete care provider. Please try again.');
    }
  };

  // Get provider type label
  const getProviderTypeLabel = (typeValue) => {
    const type = providerTypes.find(t => t.value === typeValue);
    return type ? type.label : typeValue;
  };

  const careProvidersContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Flex direction="column" gap="6">
          <Flex justify="between" align="center">
            <Heading size="6">Care Providers</Heading>
            <Button onClick={handleAddProvider}>
              <FiPlus />
              Add Provider
            </Button>
          </Flex>

          {error && (
            <Text color="red" size="2">
              {error}
            </Text>
          )}

          {isLoading ? (
            <Text>Loading care providers...</Text>
          ) : providers.length === 0 ? (
            <Card>
              <Flex direction="column" align="center" gap="4" p="6">
                <Text size="4">You don't have any care providers yet.</Text>
                <Button onClick={handleAddProvider}>Add Your First Care Provider</Button>
              </Flex>
            </Card>
          ) : (
            <Grid columns="1" gap="4">
              {providers.map((provider) => (
                <Card key={provider.id}>
                  <Flex justify="between" p="4">
                    <Box>
                      <Heading size="4">{provider.name}</Heading>
                      <Text size="2" color="gray">{getProviderTypeLabel(provider.type)}</Text>

                      <Box mt="3">
                        {provider.phone && (
                          <Text size="2">Phone: {provider.phone}</Text>
                        )}
                        {provider.email && (
                          <Text size="2">Email: {provider.email}</Text>
                        )}
                        {provider.address && (
                          <Text size="2">Address: {provider.address}</Text>
                        )}
                      </Box>

                      {provider.notes && (
                        <Box mt="2">
                          <Text size="2" weight="bold">Notes:</Text>
                          <Text size="2">{provider.notes}</Text>
                        </Box>
                      )}
                    </Box>

                    <Flex direction="column" gap="2">
                      <Button
                        size="1"
                        variant="soft"
                        onClick={() => handleEditProvider(provider)}
                      >
                        <FiEdit2 />
                        Edit
                      </Button>
                      <Button
                        size="1"
                        variant="soft"
                        color="red"
                        onClick={() => handleDeleteProvider(provider)}
                      >
                        <FiTrash2 />
                        Delete
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              ))}
            </Grid>
          )}
        </Flex>
      </Container>

      {/* Add Provider Dialog */}
      <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <Dialog.Title>Add Care Provider</Dialog.Title>

          <form onSubmit={handleSubmitAdd}>
            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" size="2" mb="1" htmlFor="name">
                  Provider Name*
                </Text>
                <TextField.Root
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter provider name"
                  required
                />
              </Box>

              <Box>
                <Text as="label" size="2" mb="1" htmlFor="type">
                  Provider Type
                </Text>
                <Select.Root
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <Select.Trigger id="type" />
                  <Select.Content>
                    {providerTypes.map(type => (
                      <Select.Item key={type.value} value={type.value}>
                        {type.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text as="label" size="2" mb="1" htmlFor="phone">
                  Phone Number
                </Text>
                <TextField.Root
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </Box>

              <Box>
                <Text as="label" size="2" mb="1" htmlFor="email">
                  Email
                </Text>
                <TextField.Root
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </Box>

              <Box>
                <Text as="label" size="2" mb="1" htmlFor="address">
                  Address
                </Text>
                <TextField.Root
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
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

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft">Cancel</Button>
                </Dialog.Close>
                <Button type="submit">Add Provider</Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit Provider Dialog */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <Dialog.Title>Edit Care Provider</Dialog.Title>

          <form onSubmit={handleSubmitEdit}>
            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" size="2" mb="1" htmlFor="name">
                  Provider Name*
                </Text>
                <TextField.Root
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter provider name"
                  required
                />
              </Box>

              <Box>
                <Text as="label" size="2" mb="1" htmlFor="type">
                  Provider Type
                </Text>
                <Select.Root
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <Select.Trigger id="type" />
                  <Select.Content>
                    {providerTypes.map(type => (
                      <Select.Item key={type.value} value={type.value}>
                        {type.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text as="label" size="2" mb="1" htmlFor="phone">
                  Phone Number
                </Text>
                <TextField.Root
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </Box>

              <Box>
                <Text as="label" size="2" mb="1" htmlFor="email">
                  Email
                </Text>
                <TextField.Root
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </Box>

              <Box>
                <Text as="label" size="2" mb="1" htmlFor="address">
                  Address
                </Text>
                <TextField.Root
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
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

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft">Cancel</Button>
                </Dialog.Close>
                <Button type="submit">Save Changes</Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Delete Care Provider</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete {currentProvider?.name}? This action cannot be undone.
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">Cancel</Button>
            </Dialog.Close>
            <Button color="red" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="CareProviders">
        {careProvidersContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
