import React from 'react';
import { ThemeProvider } from 'next-themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ProviderTheme: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='dark' // Setze den Standardmodus auf Light
      enableSystem={false} // Erlaube dem System, den Modus zu bestimmen
    >
      {children}
    </ThemeProvider>
  );
};
