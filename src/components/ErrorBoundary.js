'use client';

import { Component } from 'react';
import ErrorFallback from './ErrorFallback';

/**
 * Error Boundary component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the whole application
 *
 * @extends {Component}
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  /**
   * Update state when an error occurs
   * This is called during the "render" phase
   *
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state with error information
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Log error information when an error occurs
   * This is called during the "commit" phase
   *
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Component stack information
   */
  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You could send this to a logging service like Sentry here
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  /**
   * Reset the error state to allow the component to try rendering again
   */
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    const { children, fallback } = this.props;
    const { hasError, error } = this.state;

    if (hasError) {
      // Use custom fallback if provided, otherwise use default ErrorFallback
      if (fallback) {
        return fallback(error, this.resetErrorBoundary);
      }

      return (
        <ErrorFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;