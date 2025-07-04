import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7f7',
      100: '#cceef0',
      200: '#99dde0',
      300: '#66ccd0',
      400: '#33bbc0',
      500: '#00aab0',
      600: '#00888d',
      700: '#00666a',
      800: '#004446',
      900: '#002223',
    },
  },
  fonts: {
    heading: '"Segoe UI", Roboto, sans-serif',
    body: '"Segoe UI", Roboto, sans-serif',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

export default theme; 