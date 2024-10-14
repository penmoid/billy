// src/components/ErrorBoundary.jsx

import React from 'react';
import { Typography, Box } from '@mui/material';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Update state so the next render will show the fallback UI.
   * @param {Error} error 
   * @returns {object} Updated state
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * You can also log the error to an error reporting service.
   * @param {Error} error 
   * @param {object} errorInfo 
   */
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // You can also log the error to an external service here
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Box sx={{ padding: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Something went wrong.
          </Typography>
          <Typography variant="body1">
            Please try refreshing the page or contact support if the problem persists.
          </Typography>
        </Box>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
