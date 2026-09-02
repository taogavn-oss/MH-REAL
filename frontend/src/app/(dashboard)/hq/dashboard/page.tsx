'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function HQDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-indigo-600">Rakusai HQ</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.employeeCode}</span>
              <button
                onClick={logout}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">HQ Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Welcome to the Rakusai Headquarters control panel. You can manage Job Requirements, Interview Slots, and System Master Data from here.
          </p>
        </div>
      </main>
    </div>
  );
}
