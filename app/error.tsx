"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-state">
      <div className="error-content">
        <div className="error-icon">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="error-title">Something went wrong</h1>

        <p className="error-description">
          We encountered an unexpected error while processing your request. This
          might be a temporary issue with our servers or a connection problem.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={reset} className="error-back-button">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="error-back-button"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              border: "1px solid var(--border)",
            }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-4">
              Error Details (Development Only)
            </summary>
            <div className="text-xs text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 overflow-auto max-h-48">
              <pre className="whitespace-pre-wrap">{error.message}</pre>
              {error.stack && (
                <pre className="mt-2 whitespace-pre-wrap opacity-75">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
