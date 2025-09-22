'use client';

import Navbar from '../../../components/Navbar';
import ErrorBoundaryDemo from '../../../components/ErrorBoundaryDemo';
import { Container, Heading, Text, Flex, Card } from '@radix-ui/themes';
import Link from 'next/link';

/**
 * A demo page that showcases the error boundary functionality
 * This page includes the ErrorBoundaryDemo component and additional information
 * about error boundaries in React
 */
export default function ErrorBoundaryDemoPage() {
  return (
    <>
      <Navbar />
      <Container size="2" py="6">
        <Flex direction="column" gap="6">
          <Heading size="6" align="center">Error Boundary Demonstration</Heading>

          <Card>
            <Flex direction="column" gap="3" p="4">
              <Heading size="4">What are Error Boundaries?</Heading>
              <Text>
                Error boundaries are React components that catch JavaScript errors anywhere in their
                child component tree, log those errors, and display a fallback UI instead of crashing
                the whole component tree.
              </Text>

              <Text>
                Error boundaries work like a JavaScript <code>catch {}</code> block, but for components.
                They're particularly useful for handling unexpected errors in a more graceful way.
              </Text>

              <Text>
                In this demo, we've implemented error boundaries around feature components to ensure
                that errors in one feature don't crash the entire application.
              </Text>
            </Flex>
          </Card>

          <ErrorBoundaryDemo />

          <Card>
            <Flex direction="column" gap="3" p="4">
              <Heading size="4">Implementation Details</Heading>
              <Text>
                The PetPal application uses several components to implement error boundaries:
              </Text>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>
                  <Text as="span" weight="bold">ErrorBoundary</Text>: A class component that catches errors
                </li>
                <li>
                  <Text as="span" weight="bold">ErrorFallback</Text>: A fallback UI component
                </li>
                <li>
                  <Text as="span" weight="bold">withErrorBoundary</Text>: A higher-order component for wrapping components
                </li>
                <li>
                  <Text as="span" weight="bold">FeatureErrorBoundary</Text>: A specialized component for feature pages
                </li>
              </ul>
              <Text>
                For more details, check the <Link href="https://github.com/your-repo/petpal/tree/main/client/src/components" style={{ color: 'var(--accent-9)' }}>
                  component documentation
                </Link> or the README in the components directory.
              </Text>
            </Flex>
          </Card>

          <Card>
            <Flex direction="column" gap="3" p="4">
              <Heading size="4">Try It Yourself</Heading>
              <Text>
                To see error boundaries in action in other parts of the application, you can:
              </Text>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Visit any feature page (e.g., Pets, Health Records) - they're all wrapped with error boundaries</li>
                <li>Check the browser console to see error logs when errors occur</li>
                <li>Use the React DevTools to inspect the error boundary components</li>
              </ul>
            </Flex>
          </Card>
        </Flex>
      </Container>
    </>
  );
}