import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ [ErrorBoundary] Uncaught error:', error, errorInfo);
    
    // Check if it's a module import error
    if (error.message.includes('Failed to fetch dynamically imported module') || 
        error.message.includes('binancePriceService')) {
      console.log('🔄 [ErrorBoundary] Module import error detected - clearing cache...');
      
      // Clear all caches
      localStorage.clear();
      sessionStorage.clear();
      
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      // Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  private handleReload = () => {
    // Clear cache and reload
    localStorage.clear();
    sessionStorage.clear();
    
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 border-slate-800 bg-slate-900 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-slate-400 mb-4">
                {this.state.error?.message.includes('Failed to fetch') 
                  ? 'Old cached files detected. Clearing cache and reloading...'
                  : 'An unexpected error occurred'}
              </p>
              {this.state.error && (
                <details className="text-left mb-4">
                  <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-400">
                    Error details
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-950 rounded text-xs text-red-400 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            
            <Button
              onClick={this.handleReload}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Cache & Reload
            </Button>
            
            <p className="mt-4 text-xs text-slate-500">
              If this problem persists, try clearing your browser cache manually (Ctrl+Shift+R or Cmd+Shift+R)
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
