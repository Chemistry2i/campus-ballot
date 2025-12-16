import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, onRetry }) => {
  return (
    <div 
      style={{ 
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}
    >
      <div 
        style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          color: '#dc3545'
        }}
      >
        ⚠️
      </div>
      <h4 style={{ marginBottom: '1rem', color: '#dc3545' }}>
        Oops! Something went wrong
      </h4>
      <p style={{ marginBottom: '1.5rem', color: '#6c757d', maxWidth: '400px' }}>
        We encountered an error while loading this component. Please try again or refresh the page.
      </p>
      <div>
        <button
          className="btn btn-primary me-2"
          onClick={onRetry}
          style={{
            backgroundColor: '#0d6efd',
            borderColor: '#0d6efd',
            color: '#fff'
          }}
        >
          Try Again
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
      {error && (
        <details style={{ marginTop: '2rem', maxWidth: '600px', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
          <pre style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            fontSize: '0.8rem',
            overflow: 'auto'
          }}>
            {error.toString()}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ErrorBoundary;