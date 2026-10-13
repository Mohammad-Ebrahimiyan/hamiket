import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: '#a85a5a', light: '#d8a5a5', dark: '#874545', contrastText: '#ffffff' },
    background: { default: '#faf7f7', paper: '#ffffff' },
    info: { main: '#0b57d0' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Vazirmatn, Tahoma, "Segoe UI", Arial, sans-serif',
  },
});
