import React from 'react';
import { ProviderTheme } from './provider-theme';

interface ProviderProps {
  children: React.ReactNode;
}

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  return (
    <ProviderTheme>
      {/* Hier kannst du weitere Provider hinzufügen */}
      {children}
    </ProviderTheme>
  );
};
