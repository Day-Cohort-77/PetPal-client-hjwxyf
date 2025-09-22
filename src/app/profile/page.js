'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid } from '@radix-ui/themes';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        address: user.address || '',
        phone: user.phone || ''
      });
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Call API to update user profile
      // This would typically be a service call like updateUserProfile(formData)
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const profileContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">My Profile</Heading>

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

            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                <Grid columns="2" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="firstName">
                      First Name
                    </Text>
                    <TextField.Root
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="lastName">
                      Last Name
                    </Text>
                    <TextField.Root
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      required
                    />
                  </Box>
                </Grid>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="email">
                    Email
                  </Text>
                  <TextField.Root
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="phone">
                    Phone Number
                  </Text>
                  <TextField.Root
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
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
                    placeholder="Enter your address"
                    required
                  />
                </Box>

                <Flex gap="3" mt="4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </Button>
                  <Button type="button" variant="soft" onClick={() => router.push('/change-password')}>
                    Change Password
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Flex>
        </Card>
      </Container>
    </>
  );

  return (
    <FeatureErrorBoundary featureName="Profile">
      {profileContent}
    </FeatureErrorBoundary>
  );
}