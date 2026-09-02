'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { XCircle, RefreshCw } from 'lucide-react';

export default function GlobalErrorHandler() {
  const [error, setError] = useState<{ status: number; message: string; timestamp: number } | null>(null);

  useEffect(() => {
    // Inject global Axios interceptor to catch core errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status;
          
          // We intercept Validation (400), Auth (403), and Conflict (409) globally
          if (status === 400 || status === 403 || status === 409) {
            const message = error.response.data?.message || 'An unexpected error occurred.';
            setError({ status, message, timestamp: Date.now() });
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  if (!error) return null;

  // Auto-hide validation or auth errors after 5 seconds, but keep Conflicts (409) visible until user action
  if (error.status !== 409) {
    setTimeout(() => {
      setError(null);
    }, 5000);
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-sm">
      <div className={`rounded-lg p-4 shadow-xl border-l-4 ${
        error.status === 409 ? 'bg-yellow-50 border-yellow-500' : 
        error.status === 403 ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <XCircle className={`h-6 w-6 ${
              error.status === 409 ? 'text-yellow-500' : 'text-red-500'
            }`} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <h3 className={`text-sm font-medium ${
              error.status === 409 ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {error.status === 409 ? 'Data Conflict (Stale Version)' : 
               error.status === 403 ? 'Access Denied' : 'Validation Error'}
            </h3>
            <p className={`mt-1 text-sm ${
              error.status === 409 ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {error.message}
            </p>
            {error.status === 409 && (
              <div className="mt-4">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <RefreshCw className="mr-1.5 h-3 w-3" />
                  Refresh Page to Sync
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => setError(null)}
            >
              <span className="sr-only">Close</span>
              <XCircle className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
