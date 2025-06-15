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
      default: '#13141C',  // Darker base
      paper: '#1E1F2E',    // Darker paper
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B3C1',
    }
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
        contained: {
          background: 'linear-gradient(45deg, #6C63FF 30%, #8F88FF 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5046E4 30%, #6C63FF 90%)',
          },
        },
      },
    },
  },
});