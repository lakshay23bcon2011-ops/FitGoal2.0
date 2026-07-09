'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-slate-950 text-white flex flex-col items-center justify-center min-h-screen p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-2xl font-black tracking-wide uppercase">Application Error</h2>
          <p className="text-zinc-400 text-sm">
            An unexpected error occurred in the application.
          </p>
          {error.message && (
            <pre className="p-3 bg-zinc-900 rounded-lg text-left text-xs text-red-400 font-mono overflow-auto max-h-40">
              {error.message}
            </pre>
          )}
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-sm font-bold transition duration-150 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
