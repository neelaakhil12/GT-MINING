import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[React Uncaught Error]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#EAF8EE',
          padding: '24px',
          textAlign: 'center',
          fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
          color: '#0A341B'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '32px 24px',
            maxWidth: '380px',
            width: '100%',
            boxShadow: '0 10px 30px rgba(22, 101, 52, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💎</div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 8px 0', color: '#0A341B' }}>
              GT Network Interface
            </h2>
            <p style={{ fontSize: '12.5px', color: '#1E5E36', lineHeight: '18px', margin: '0 0 20px 0' }}>
              A temporary display sync occurred. Tap below to reload the node.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                color: '#FFFFFF',
                fontWeight: '900',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(34, 197, 94, 0.35)'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
