# Error Boundary Components

This directory contains components for implementing error boundaries in the PetPal React application. Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the whole component tree.

## Components Overview

### 1. ErrorBoundary.js

A class component that implements React's error boundary lifecycle methods:

- `static getDerivedStateFromError()`: Updates state when an error occurs
- `componentDidCatch()`: Logs error information
- `resetErrorBoundary()`: Method to reset the error state

```jsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 2. ErrorFallback.js

A fallback UI component that displays when an error occurs within an error boundary:

- Shows a user-friendly error message
- Provides error details for debugging
- Includes buttons to retry or navigate home

```jsx
<ErrorFallback
  error={error}
  resetErrorBoundary={resetErrorBoundary}
/>
```

### 3. withErrorBoundary.js

A higher-order component (HOC) that wraps components with an error boundary:

```jsx
const ProtectedComponent = withErrorBoundary(YourComponent, {
  fallback: customFallback, // Optional custom fallback
  onError: handleError      // Optional error handler
});
```

### 4. FeatureErrorBoundary.js

A specialized component for wrapping feature components (pages) with error boundaries:

```jsx
<FeatureErrorBoundary featureName="FeatureName">
  <YourFeatureComponent />
</FeatureErrorBoundary>
```

## Usage Examples

### Basic Usage

Wrap any component with an error boundary to prevent it from crashing the entire application:

```jsx
import ErrorBoundary from '../components/ErrorBoundary';
import YourComponent from './YourComponent';

function SafeComponent() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Using the HOC Pattern

Use the higher-order component pattern for cleaner code:

```jsx
import withErrorBoundary from '../components/withErrorBoundary';
import YourComponent from './YourComponent';

const SafeComponent = withErrorBoundary(YourComponent);

// With options
const SafeComponentWithOptions = withErrorBoundary(YourComponent, {
  onError: (error, errorInfo) => {
    // Custom error handling logic
    console.error('Custom error handler:', error);
    // Send to error tracking service
  }
});
```

### For Feature Components (Pages)

For Next.js page components, use the FeatureErrorBoundary component:

```jsx
'use client';

import FeatureErrorBoundary from '../components/FeatureErrorBoundary';

export default function YourPage() {
  const pageContent = (
    // Your page content here
  );

  return (
    <FeatureErrorBoundary featureName="YourFeatureName">
      {pageContent}
    </FeatureErrorBoundary>
  );
}
```

## Best Practices

1. **Granular Error Boundaries**: Place error boundaries strategically to isolate failures to specific parts of the UI.

2. **Meaningful Error Messages**: Customize error messages to be helpful for both users and developers.

3. **Error Logging**: Implement proper error logging to track and fix issues in production.

4. **Recovery Options**: Provide clear ways for users to recover from errors (retry, navigate away, etc.).

5. **Feature-Specific Boundaries**: Use separate error boundaries for different features to prevent one feature's error from affecting others.

## Implementation in PetPal

In the PetPal application, error boundaries are implemented around feature components to ensure that errors in one feature don't crash the entire application. Each feature component is wrapped with a `FeatureErrorBoundary` component that provides a consistent error handling experience.