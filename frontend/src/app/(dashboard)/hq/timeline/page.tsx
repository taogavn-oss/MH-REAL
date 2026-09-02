'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Filter, Calendar, MapPin, Building } from 'lucide-react';

type TimelineSlot = {
  id: string;
  store: string;
  area: string;
  date: string;
  time: string;
  status: string;
  bookedCount: number;
};

export default function HQTimelinePage() {
  const { user } = useAuth();
  
  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterStore, setFilterStore] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['hq-timeline', filterDate, filterArea, filterStore],
    queryFn: async () => {
      // Mock fetching all global slots based on filters
      return new Promise<TimelineSlot[]>((resolve) => {
        setTimeout(() => {
          const mockData = [
            { id: '1', store: 'Shibuya Main', area: 'Tokyo', date: '2026-09-10', time: '10:00 - 11:00', status: 'Booked', bookedCount: 2 },
            { id: '2', store: 'Shinjuku East', area: 'Tokyo', date: '2026-09-10', time: '13:00 - 14:00', status: 'Available', bookedCount: 0 },
            { id: '3', store: 'Umeda Central', area: 'Osaka', date: '2026-09-11', time: '09:00 - 10:00', status: 'Available', bookedCount: 1 },
            { id: '4', store: 'Sapporo North', area: 'Hokkaido', date: '2026-09-12', time: '10:00 - 11:30', status: 'Booked', bookedCount: 3 },
          ];
          
          let filtered = mockData;
          if (filterDate) filtered = filtered.filter(d => d.date === filterDate);
          if (filterArea) filtered = filtered.filter(d => d.area.toLowerCase().includes(filterArea.toLowerCase()));
          if (filterStore) filtered = filtered.filter(d => d.store.toLowerCase().includes(filterStore.toLowerCase()));
          
          resolve(filtered);
        }, 600);
      });
    },
  });

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Global Timeline
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Monitor and filter interview schedules across all Areas and Stores.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Filter className="mr-2 h-4 w-4 text-gray-500" />
          Filters
        </div>
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 pr-3"
            />
          </div>
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Filter by Area (e.g. Tokyo)"
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 pr-3"
            />
          </div>
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Building className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Filter by Store"
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 pr-3"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Area</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Store</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Booked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                        Loading timeline...
                      </td>
                    </tr>
                  )}
                  {!isLoading && data?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                        No schedules found matching criteria.
                      </td>
                    </tr>
                  )}
                  {data?.map((slot) => (
                    <tr key={slot.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {slot.date} <span className="text-gray-500 block text-xs">{slot.time}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{slot.area}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">{slot.store}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          slot.status === 'Booked' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {slot.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{slot.bookedCount} Candidates</td>
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
