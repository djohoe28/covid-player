import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const defaultThemeProps = {
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === 'info' && {
            backgroundColor: '#60a5fa',
          }),
        }),
      },
    },
  },
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
  ...defaultThemeProps,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  ...defaultThemeProps,
});

export default lightTheme;
