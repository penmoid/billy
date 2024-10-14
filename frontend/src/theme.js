// src/theme.js

import { createTheme } from '@mui/material/styles';

// Define a common border radius
const commonBorderRadius = 8;

// Dracula Dark Theme
export const draculaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff79c6', // Pink
    },
    secondary: {
      main: '#8be9fd', // Cyan
    },
    background: {
      default: '#282a36', // Background color
      paper: '#44475a',   // Surface color
    },
    text: {
      primary: '#f8f8f2',   // Main text color
      secondary: '#6272a4', // Secondary text color
    },
    error: {
      main: '#ff5555', // Red for errors
    },
    success: {
      main: '#50fa7b', // Green for success messages
    },
    warning: {
      main: '#f1fa8c', // Yellow for warnings
    },
  },
  typography: {
    fontFamily: `'Fira Code', monospace`, // Example font
    h5: {
      fontWeight: 'bold',
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 'bold',
      fontSize: '1.1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: commonBorderRadius, // Set global border radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: commonBorderRadius, // Use global border radius
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#44475a', // Match paper background
          color: '#f8f8f2',           // Text color
          borderRadius: commonBorderRadius, // Ensure consistent border radius
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: '#282a36', // Match default background
          color: '#f8f8f2',
          borderRadius: commonBorderRadius, // Ensure consistent border radius
          boxShadow: 'none', // Remove shadow to match other sections
          '&:before': {
            display: 'none', // Remove the default before pseudo-element
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderBottom: 'none', // Remove the border-bottom to eliminate the line
          borderRadius: commonBorderRadius, // Ensure consistent border radius
          minHeight: '48px', // Fixed height
          padding: '12px 16px', // Consistent padding
          '&.Mui-expanded': {
            minHeight: '48px', // Ensure consistent height when expanded
            padding: '12px 16px', // Ensure padding remains consistent
          },
        },
        content: {
          margin: '0', // Remove default margin to prevent spacing issues
          '&.Mui-expanded': {
            margin: '0', // Ensure margin remains consistent when expanded
          },
        },
        expandIcon: {
          color: '#f8f8f2', // Ensure the expand icon matches the text color
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px', // Consistent padding
          borderTop: 'none', // Remove the top border if it's causing issues
          borderRadius: commonBorderRadius, // Consistent border radius
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#f8f8f2', // Ensure all Typography uses primary text color
        },
      },
    },
    // Add more component customizations as needed
  },
});

// Light Theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#dc004e', // Pink
    },
    background: {
      default: '#f5f5f5', // Light grey background
      paper: '#ffffff',    // White surface
    },
    text: {
      primary: '#000000',   // Black text
      secondary: '#555555', // Dark grey text
    },
    error: {
      main: '#d32f2f', // Dark red for errors
    },
    success: {
      main: '#388e3c', // Dark green for success messages
    },
    warning: {
      main: '#fbc02d', // Dark yellow for warnings
    },
  },
  typography: {
    fontFamily: `'Fira Code', monospace`, // Example font
    h5: {
      fontWeight: 'bold',
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 'bold',
      fontSize: '1.1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: commonBorderRadius, // Set global border radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: commonBorderRadius, // Use global border radius
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff', // White background for cards
          color: '#000000',           // Black text
          borderRadius: commonBorderRadius, // Ensure consistent border radius
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5', // Light background
          color: '#000000',
          borderRadius: commonBorderRadius, // Ensure consistent border radius
          boxShadow: 'none', // Remove shadow to match other sections
          '&:before': {
            display: 'none', // Remove the default before pseudo-element
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderBottom: 'none', // Remove the border-bottom to eliminate the line
          borderRadius: commonBorderRadius, // Ensure consistent border radius
          minHeight: '48px', // Fixed height
          padding: '12px 16px', // Consistent padding
          '&.Mui-expanded': {
            minHeight: '48px', // Ensure consistent height when expanded
            padding: '12px 16px', // Ensure padding remains consistent
          },
        },
        content: {
          margin: '0', // Remove default margin to prevent spacing issues
          '&.Mui-expanded': {
            margin: '0', // Ensure margin remains consistent when expanded
          },
        },
        expandIcon: {
          color: '#000000', // Ensure the expand icon matches the text color
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px', // Consistent padding
          borderTop: 'none', // Remove the top border if it's causing issues
          borderRadius: commonBorderRadius, // Consistent border radius
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#000000', // Ensure all Typography uses primary text color
        },
      },
    },
    // Add more component customizations as needed
  },
});
