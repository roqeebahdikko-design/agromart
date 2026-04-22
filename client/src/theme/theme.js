import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f5f3b' },
    secondary: { main: '#f0b429' },
    success: { main: '#2e7d32' },
    background: {
      default: '#f4f8f1',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
    h2: { fontWeight: 900, letterSpacing: '-0.02em' },
    h3: { fontWeight: 800 }
  },
  shape: {
    borderRadius: 14
  }
});

export default theme;
