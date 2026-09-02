'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';

type Requirement = {
  id: string;
  headcount: number;
  hourly_wage: number;
  status: string;
  version: number;
};

export default function RequirementsDashboard() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['requirements', user?.userId],
    queryFn: async () => {
      // Mocking because backend is down
      // const res = await apiClient.get('/job-requirements');
      // return res.data.data;
      return new Promise<Requirement[]>((resolve) => {
        setTimeout(() => {
          resolve([
            { id: '1', headcount: 3, hourly_wage: 1200, status: 'published', version: 1 },
            { id: '2', headcount: 1, hourly_wage: 1500, status: 'draft', version: 2 },
            { id: '3', headcount: 5, hourly_wage: 1100, status: 'pending_am', version: 1 },
          ]);
        }, 500);
      });
    },
    enabled: !!user,
  });

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Requirements</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage store hiring needs and requirements.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/store/requirements/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
            New Requirement
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Headcount</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Wage (¥)</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                        Loading requirements...
                      </td>
                    </tr>
                  )}
                  {!isLoading && data?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                        No requirements found.
                      </td>
                    </tr>
                  )}
                  {data?.map((req) => (
                    <tr key={req.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {req.id.substring(0, 8)}...
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{req.headcount}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{req.hourly_wage}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          req.status === 'published' ? 'bg-green-100 text-green-800' :
                          req.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/store/requirements/${req.id}`} className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
