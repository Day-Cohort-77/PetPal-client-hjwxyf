'use client';

import { Card, Heading, Text, Button, Flex, Box } from '@radix-ui/themes';

/**
 * A fallback UI component to display when an error occurs within an ErrorBoundary
 *
 * @param {Object} props - Component props
 * @param {Error} props.error - The error that was caught
 * @param {Function} props.resetErrorBoundary - Function to reset the error boundary
 * @returns {JSX.Element} The fallback UI
 */
export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Card size="2" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <Flex direction="column" gap="4" p="4">
        <Box>
          <Heading as="h2" size="5" color="red" mb="2">
            Something went wrong
          </Heading>
          <Text size="2" color="gray">
            We apologize for the inconvenience. The application encountered an unexpected error.
          </Text>
        </Box>

        <Card variant="outline">
          <Box p="3">
            <Text as="p" size="2" color="red" weight="bold">
              Error details:
            </Text>
            <Text as="p" size="2" style={{ fontFamily: 'var(--font-geist-mono)' }}>
              {error.message || 'Unknown error'}
            </Text>
          </Box>
        </Card>

        <Flex gap="3" mt="2" justify="end">
          <Button
            color="gray"
            variant="soft"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
          <Button
            color="blue"
            onClick={resetErrorBoundary}
          >
            Try Again
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}