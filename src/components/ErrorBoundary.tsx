import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logJavaScriptError } from '../lib/errorTracking';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    logJavaScriptError(error, 'high', {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
                <p className="text-sm text-gray-500">We've been notified and are looking into it</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                    Show technical details
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40 bg-white p-2 rounded border border-gray-200">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700
                  transition-colors font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300
                  transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              If this problem persists, please contact support with the error details above.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
