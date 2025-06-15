import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6C63FF',      // Rich indigo
      light: '#8F88FF',
      dark: '#5046E4',
    },
    secondary: {
      main: '#FF6B6B',      // Coral red
      light: '#FF8E8E',
      dark: '#E45555',
    },
    background: {
      default: '#1A1B25',   // Dark blue-grey
      paper: '#242632',     // Slightly lighter blue-grey
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B3C1',
    },
    success: {
      main: '#64FFDA',      // Bright mint
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#242632',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1rem',
          borderRadius: 12,
        },
      },
    },
  },
});