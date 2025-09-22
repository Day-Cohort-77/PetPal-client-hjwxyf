'use client';

import ErrorBoundary from './ErrorBoundary';

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 *
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} options - Configuration options
 * @param {Function} options.fallback - Optional custom fallback component
 * @param {Function} options.onError - Optional error handler function
 * @returns {React.ComponentType} The wrapped component with error boundary
 */
export default function withErrorBoundary(Component, options = {}) {
  const { fallback, onError } = options;

  // Return a new component that wraps the original with an ErrorBoundary
  function WithErrorBoundary(props) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  }

  // Set display name for debugging purposes
  const displayName = Component.displayName || Component.name || 'Component';
  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}