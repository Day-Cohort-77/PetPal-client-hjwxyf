'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box } from '@radix-ui/themes';

export default function ChangePassword() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
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

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // This would typically call an API endpoint to change the password
      // For now, we'll just simulate a successful password change
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Password changed successfully');
      // Clear the form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Password change error:', err);
      setError('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const changePasswordContent = (
    <>
      <Navbar />
      <Container size="1" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Change Password</Heading>

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
                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="currentPassword">
                    Current Password
                  </Text>
                  <TextField.Root
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    required
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="newPassword">
                    New Password
                  </Text>
                  <TextField.Root
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="confirmPassword">
                    Confirm New Password
                  </Text>
                  <TextField.Root
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                  />
                </Box>

                <Flex gap="3" mt="4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="soft"
                    onClick={() => router.push('/profile')}
                  >
                    Back to Profile
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
    <FeatureErrorBoundary featureName="ChangePassword">
      {changePasswordContent}
    </FeatureErrorBoundary>
  );
}