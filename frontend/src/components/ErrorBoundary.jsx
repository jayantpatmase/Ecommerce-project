import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary captured exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center">
          <div className="card shadow border-0 p-5 mx-auto" style={{ maxWidth: '600px' }}>
            <div className="text-danger mb-3">
              <i className="bi bi-exclamation-triangle" style={{ fontSize: '3.5rem' }}></i>
            </div>
            <h3 className="fw-bold text-dark">Something went wrong</h3>
            <p className="text-muted">
              An unexpected user-interface error occurred. We have safely isolated the issue.
            </p>
            <div className="mt-4">
              <button className="btn btn-primary px-4 me-2" onClick={this.handleReload}>
                Reload Application
              </button>
              <a href="/" className="btn btn-outline-secondary px-4">
                Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
