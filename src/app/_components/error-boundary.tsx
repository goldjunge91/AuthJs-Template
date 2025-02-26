'use client';

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Aktualisiere den State, sodass beim nächsten Render die Fallback-UI angezeigt wird
    console.error('Fehler aufgetreten:', error); // Logge den Fehler für Debugging-Zwecke
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Hier können Sie den Fehler loggen oder an einen Fehler-Reporting-Service senden
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Wenn ein Fehler aufgetreten ist, zeigen wir die Fallback-UI an
      return this.props.fallback;
    }

    // Ansonsten rendern wir die Kinder wie gewöhnlich
    return this.props.children;
  }
}
