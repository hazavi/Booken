"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-8">
          We encountered an error while loading the page. This might be due to a
          connection issue with our book database.
        </p>
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="block w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
          >
            Go Home
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-4 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
