'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import FeatureErrorBoundary from '../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box } from '@radix-ui/themes';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // Validate the token when component mounts
    const validateToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token. Please request a new password reset link.');
        return;
      }

      try {
        // This would typically call an API endpoint to validate the token
        // For now, we'll just simulate a valid token
        await new Promise(resolve => setTimeout(resolve, 500));
        setTokenValid(true);
      } catch (err) {
        console.error('Token validation error:', err);
        setError('Invalid or expired reset token. Please request a new password reset link.');
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // This would typically call an API endpoint to reset the password
      // For now, we'll just simulate a successful reset
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Password has been reset successfully. You can now log in with your new password.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordContent = (
    <>
      <Navbar />
      <Container size="1" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Reset Your Password</Heading>

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

            {tokenValid && !success && (
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="password">
                      New Password
                    </Text>
                    <TextField.Root
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </Box>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </Flex>
              </form>
            )}

            {!tokenValid && (
              <Flex justify="center" mt="4">
                <Link href="/auth/forgot-password" passHref>
                  <Button>Request New Reset Link</Button>
                </Link>
              </Flex>
            )}

            {success && (
              <Flex justify="center" mt="4">
                <Link href="/auth/login" passHref>
                  <Button>Go to Login</Button>
                </Link>
              </Flex>
            )}

            <Flex justify="center" mt="4">
              <Text size="2">
                Remember your password?{' '}
                <Link href="/auth/login" style={{ color: 'var(--accent-9)' }}>
                  Back to Login
                </Link>
              </Text>
            </Flex>
          </Flex>
        </Card>
      </Container>
    </>
  );

  return (
    <FeatureErrorBoundary featureName="ResetPassword">
      {resetPasswordContent}
    </FeatureErrorBoundary>
  );
}