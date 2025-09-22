'use client';

import { useState } from 'react';
import { Button, Card, Heading, Text, Flex, Box } from '@radix-ui/themes';
import FeatureErrorBoundary from './FeatureErrorBoundary';

/**
 * A component that intentionally throws an error when a button is clicked
 * Used to demonstrate how error boundaries work
 */
function BuggyCounter() {
  const [counter, setCounter] = useState(0);

  const handleClick = () => {
    setCounter(prevCounter => prevCounter + 1);
  };

  // Simulate an error when counter reaches 5
  if (counter === 5) {
    throw new Error('Simulated error: Counter reached 5!');
  }

  return (
    <Box p="4">
      <Text size="2" mb="2">
        Click the button to increment the counter. When it reaches 5, an error will be thrown.
      </Text>
      <Text size="5" mb="4">Counter: {counter}</Text>
      <Button onClick={handleClick}>
        Increment Counter
      </Button>
    </Box>
  );
}

/**
 * A demo component that shows how error boundaries work
 * This component includes a buggy counter wrapped in an error boundary
 */
export default function ErrorBoundaryDemo() {
  return (
    <Card size="2" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <Flex direction="column" gap="4">
        <Heading size="5" align="center">Error Boundary Demo</Heading>

        <Text size="2">
          This demo shows how error boundaries catch JavaScript errors in React components.
          The counter below will throw an error when it reaches 5. The error boundary will
          catch this error and display a fallback UI instead of crashing the entire application.
        </Text>

        <Card variant="outline">
          <FeatureErrorBoundary featureName="BuggyCounter">
            <BuggyCounter />
          </FeatureErrorBoundary>
        </Card>

        <Text size="2" color="gray">
          Note: In a real application, you would place error boundaries around components
          that might reasonably error, not components designed to error.
        </Text>
      </Flex>
    </Card>
  );
}