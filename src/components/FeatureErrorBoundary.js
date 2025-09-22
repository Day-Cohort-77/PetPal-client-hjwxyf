'use client';

import ErrorBoundary from './ErrorBoundary';

/**
 * A component that wraps feature components with an ErrorBoundary
 * Specifically designed for Next.js page components
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child components to render
 * @param {string} props.featureName - The name of the feature (for logging purposes)
 * @returns {JSX.Element} The wrapped component with error boundary
 */
export default function FeatureErrorBoundary({ children, featureName = 'Unknown Feature' }) {
  const handleError = (error, errorInfo) => {
    // Log the error with the feature name for better debugging
    console.error(`Error in feature "${featureName}":`, error);
    console.error('Component stack:', errorInfo?.componentStack);

    // You could send this to a logging service like Sentry here
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     extra: {
    //       featureName,
    //       ...errorInfo
    //     }
    //   });
    // }
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}