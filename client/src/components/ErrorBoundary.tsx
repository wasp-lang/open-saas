import { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/button';

function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">App Error – Safe Mode</h1>
        <p className="text-gray-700 mb-6">An unexpected error occurred.</p>
        <div className="flex flex-col gap-4">
          <Button onClick={resetErrorBoundary} className="w-full bg-tcof-teal hover:bg-tcof-teal/90 text-white">
            Reload Application
          </Button>
        </div>
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">{error.message}</pre>
        </details>
      </div>
    </div>
  );
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
}

/**
 * Top-level error boundary using react-error-boundary.
 * Wraps application UI and prevents hard crashes.
 */
export default function ErrorBoundary({ children, fallback, onError }: Props) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : DefaultFallback}
      onError={onError}
    >
      {children}
    </ReactErrorBoundary>
  );
}
