/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree,
 * logs the errors, and displays a fallback UI instead of crashing the app.
 * 
 * Implements React's Error Boundary pattern for graceful error handling.
 */

import React from 'react';
import { Container, Alert, Button, Card } from 'react-bootstrap';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logError } from '../utils/errors';

/**
 * Error Boundary Class Component
 * Must be a class component as hooks don't support componentDidCatch yet
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  /**
   * Update state when an error is caught
   * Called during the render phase
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Log error details when caught
   * Called during the commit phase (after render)
   */
  componentDidCatch(error, errorInfo) {
    // Log error to console and external service
    logError(error, {
      component: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Root',
    });

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset error boundary state
   * Allows user to retry after an error
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional reset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  /**
   * Navigate to home page
   */
  handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * Reload the page
   */
  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback, showDetails } = this.props;

    // If no error, render children normally
    if (!hasError) {
      return children;
    }

    // If custom fallback provided, use it
    if (fallback) {
      return fallback({
        error,
        errorInfo,
        resetError: this.handleReset,
      });
    }

    // Default error UI
    return (
      <Container className="py-5">
        <Card className="shadow-sm border-danger">
          <Card.Body className="text-center p-5">
            <AlertTriangle 
              size={64} 
              className="text-danger mb-4" 
              strokeWidth={1.5}
            />
            
            <h2 className="mb-3">Oops! Something went wrong</h2>
            
            <p className="text-muted mb-4">
              We're sorry for the inconvenience. An unexpected error has occurred.
            </p>

            {errorCount > 2 && (
              <Alert variant="warning" className="mb-4">
                <strong>Multiple errors detected.</strong><br />
                This might indicate a persistent issue. Please try reloading the page.
              </Alert>
            )}

            <div className="d-flex gap-2 justify-content-center mb-4">
              <Button 
                variant="primary" 
                onClick={this.handleReset}
                className="d-flex align-items-center gap-2"
              >
                <RefreshCw size={18} />
                Try Again
              </Button>
              
              <Button 
                variant="outline-secondary" 
                onClick={this.handleGoHome}
                className="d-flex align-items-center gap-2"
              >
                <Home size={18} />
                Go Home
              </Button>

              {errorCount > 2 && (
                <Button 
                  variant="outline-danger" 
                  onClick={this.handleReload}
                  className="d-flex align-items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Reload Page
                </Button>
              )}
            </div>

            {/* Show error details in development mode */}
            {(import.meta.env.DEV || showDetails) && error && (
              <details className="text-start mt-4">
                <summary className="cursor-pointer text-danger fw-bold mb-2">
                  Error Details (Development Only)
                </summary>
                
                <Alert variant="danger" className="mt-3">
                  <Alert.Heading className="h6">Error Message:</Alert.Heading>
                  <pre className="mb-0 small">
                    {error.toString()}
                  </pre>
                </Alert>

                {errorInfo && errorInfo.componentStack && (
                  <Alert variant="secondary" className="mt-3">
                    <Alert.Heading className="h6">Component Stack:</Alert.Heading>
                    <pre className="mb-0 small" style={{ maxHeight: '300px', overflow: 'auto' }}>
                      {errorInfo.componentStack}
                    </pre>
                  </Alert>
                )}

                {error.stack && (
                  <Alert variant="secondary" className="mt-3">
                    <Alert.Heading className="h6">Stack Trace:</Alert.Heading>
                    <pre className="mb-0 small" style={{ maxHeight: '300px', overflow: 'auto' }}>
                      {error.stack}
                    </pre>
                  </Alert>
                )}
              </details>
            )}
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

/**
 * Props validation and defaults
 */
ErrorBoundary.defaultProps = {
  showDetails: false,
  name: 'ErrorBoundary',
};

/**
 * Functional wrapper for easier usage with hooks
 * Provides a more modern API while using the class-based boundary
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

/**
 * Specialized Error Boundaries for different app sections
 */

/**
 * Page-level Error Boundary
 * Catches errors in individual pages without crashing entire app
 */
export const PageErrorBoundary = ({ children, pageName }) => {
  return (
    <ErrorBoundary
      name={`Page: ${pageName}`}
      fallback={({ error, resetError }) => (
        <Container className="py-5">
          <Alert variant="danger" className="text-center">
            <AlertTriangle size={48} className="mb-3" />
            <h4>Error loading {pageName}</h4>
            <p className="mb-3">{error?.message || 'An unexpected error occurred'}</p>
            <Button onClick={resetError} variant="primary">
              Retry
            </Button>
          </Alert>
        </Container>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Component-level Error Boundary
 * Catches errors in individual components with minimal UI disruption
 */
export const ComponentErrorBoundary = ({ children, componentName }) => {
  return (
    <ErrorBoundary
      name={`Component: ${componentName}`}
      fallback={({ error, resetError }) => (
        <Alert variant="warning" className="m-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <strong>Error in {componentName}</strong>
              <p className="mb-0 small">{error?.message}</p>
            </div>
            <Button size="sm" onClick={resetError}>
              Retry
            </Button>
          </div>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Async Error Boundary
 * Specialized for handling async operations and Suspense
 */
export const AsyncErrorBoundary = ({ children, onError }) => {
  return (
    <ErrorBoundary
      name="AsyncOperation"
      onError={onError}
      fallback={({ error, resetError }) => (
        <Alert variant="info" className="text-center m-3">
          <p>Failed to load data</p>
          <Button size="sm" onClick={resetError}>
            Retry
          </Button>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
