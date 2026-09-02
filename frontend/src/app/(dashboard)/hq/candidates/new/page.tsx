'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ShieldAlert, UserPlus } from 'lucide-react';

const hqCandidateSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  kanji_name: z.string().min(2, 'Name is required'),
});

type FormValues = z.infer<typeof hqCandidateSchema>;

type HttpError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

export default function NewCandidatePage() {
  const router = useRouter();
  const [conflictError, setConflictError] = useState<{ type: 'duplicate' | 'blacklist'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(hqCandidateSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setConflictError(null);

    try {
      // Mock API Submission
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (data.email.includes('duplicate')) {
            reject({ response: { status: 409, data: { message: 'A candidate with this email or phone already exists.' } } });
          } else if (data.email.includes('blacklist')) {
            reject({ response: { status: 403, data: { message: 'This candidate is blocked due to policy violations.' } } });
          } else {
            resolve(true);
          }
        }, 800);
      });

      alert('Candidate manually registered successfully.');
      router.push('/hq/dashboard');
    } catch (error: unknown) {
      const httpError = error as HttpError;
      if (httpError.response?.status === 409) {
        setConflictError({ type: 'duplicate', message: httpError.response.data?.message ?? 'Duplicate candidate detected.' });
      } else if (httpError.response?.status === 403) {
        setConflictError({ type: 'blacklist', message: httpError.response.data?.message ?? 'Candidate is blacklisted.' });
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Register Candidate (Manual Intake)
          </h2>
        </div>
      </div>

      <div className="mt-8 mx-auto max-w-2xl">
        {conflictError && (
          <div className={`mb-6 rounded-md p-4 border ${
            conflictError.type === 'blacklist' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldAlert className={`h-5 w-5 ${
                  conflictError.type === 'blacklist' ? 'text-red-400' : 'text-yellow-400'
                }`} />
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  conflictError.type === 'blacklist' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {conflictError.type === 'blacklist' ? 'Candidate Blacklisted' : 'Duplicate Detected'}
                </h3>
                <div className={`mt-2 text-sm ${
                  conflictError.type === 'blacklist' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  <p>{conflictError.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-6 bg-white p-6 shadow sm:rounded-md" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            
            <div className="sm:col-span-2">
              <label htmlFor="kanji_name" className="block text-sm font-medium text-gray-700">
                Kanji Name (Full Name)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="kanji_name"
                  {...register('kanji_name')}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.kanji_name && <p className="mt-1 text-sm text-red-600">{errors.kanji_name.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g. duplicate@test.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="phone"
                  {...register('phone')}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              <UserPlus className="-ml-1 mr-2 h-4 w-4" />
              {isSubmitting ? 'Registering...' : 'Register Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
