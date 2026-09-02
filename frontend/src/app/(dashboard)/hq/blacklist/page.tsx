'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldAlert, Plus, Search } from 'lucide-react';

const blacklistSchema = z.object({
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  reason: z.string().min(5, 'Please provide a detailed reason'),
}).superRefine((data, ctx) => {
  if (!data.email && !data.phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must provide either an email or a phone number to block.',
      path: ['email'],
    });
  }
});

type FormValues = z.infer<typeof blacklistSchema>;

type BlacklistRecord = {
  id: string;
  email: string | null;
  phone: string | null;
  reason: string;
  createdAt: string;
};

export default function HQBlacklistPage() {
  const [isAdding, setIsAdding] = useState(false);
  
  const { data: records, isLoading, refetch } = useQuery({
    queryKey: ['blacklist-records'],
    queryFn: async () => {
      // Mock fetching blacklist
      return new Promise<BlacklistRecord[]>((resolve) => {
        setTimeout(() => {
          resolve([
            { id: '1', email: 'spammer@example.com', phone: null, reason: 'Repeated no-shows across 3 stores', createdAt: '2026-09-01' },
            { id: '2', email: null, phone: '090-1234-5678', reason: 'Abusive language on phone interview', createdAt: '2026-08-15' },
          ]);
        }, 500);
      });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(blacklistSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      alert('Record added to global blacklist.');
      reset();
      setIsAdding(false);
      refetch();
    } catch (err) {
      alert('Failed to append to blacklist.');
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight flex items-center">
            <ShieldAlert className="mr-3 h-8 w-8 text-red-600" />
            Global Blacklist
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage blocked candidates. Individuals on this list will be hard-rejected by the matching engine.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-none">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Append to Blacklist
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-red-900">Add New Block Record</h3>
          <p className="text-sm text-red-700 mb-4">Note: Only provide the Email or Phone. Do not collect Kanji/Kana during blocking.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  {...register('email')}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm border"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  {...register('phone')}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm border"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Reason for Block</label>
                <input
                  type="text"
                  {...register('reason')}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm border"
                />
                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Appending...' : 'Confirm Block'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reason</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading && (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-500">Loading blacklist...</td></tr>
                  )}
                  {records?.map((record) => (
                    <tr key={record.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{record.email || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.phone || '-'}</td>
                      <td className="px-3 py-4 text-sm text-gray-500">{record.reason}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.createdAt}</td>
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
