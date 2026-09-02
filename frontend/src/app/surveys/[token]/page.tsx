'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

const surveySchema = z.object({
  kanji_name: z.string().min(2, 'Name is required'),
  kana_name: z.string().min(2, 'Kana name is required'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  has_experience: z.boolean(),
  notes: z.string().optional(),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export default function CandidateSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  // Mock checking if the token is valid, consumed, or expired
  const { data: tokenState, isLoading: isTokenLoading, error: tokenError } = useQuery({
    queryKey: ['surveyToken', token],
    queryFn: async () => {
      return new Promise<{ status: 'valid' | 'consumed' | 'expired' }>((resolve, reject) => {
        setTimeout(() => {
          if (token.includes('invalid')) {
            reject(new Error('Invalid token'));
          } else if (token.includes('consumed')) {
            resolve({ status: 'consumed' });
          } else if (token.includes('expired')) {
            resolve({ status: 'expired' });
          } else {
            resolve({ status: 'valid' });
          }
        }, 600);
      });
    },
    retry: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      has_experience: false,
    },
  });

  const onSubmit = async (data: SurveyFormValues) => {
    try {
      // Mock submitting the survey
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Redirect to success page
      router.push('/surveys/success');
    } catch (err) {
      alert('Failed to submit survey. Please try again later.');
    }
  };

  if (isTokenLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading survey...</p>
      </div>
    );
  }

  if (tokenError || tokenState?.status !== 'valid') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl text-center border-t-4 border-red-500">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Link Invalid or Expired</h2>
          <p className="mt-2 text-gray-600">
            {tokenState?.status === 'consumed'
              ? 'This survey has already been completed.'
              : 'This link has expired or is invalid. Please contact the recruitment team for a new link.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 rounded-xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Rakusai Application Survey
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please fill out your details to continue your application.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kanji Name (Full Name)</label>
              <input
                type="text"
                {...register('kanji_name')}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.kanji_name && <p className="mt-1 text-sm text-red-600">{errors.kanji_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kana Name</label>
              <input
                type="text"
                {...register('kana_name')}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.kana_name && <p className="mt-1 text-sm text-red-600">{errors.kana_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                {...register('dob')}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob.message}</p>}
            </div>

            <div className="flex items-center">
              <input
                id="has_experience"
                type="checkbox"
                {...register('has_experience')}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="has_experience" className="ml-2 block text-sm text-gray-900">
                I have previous experience in this role
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
              <textarea
                rows={3}
                {...register('notes')}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
