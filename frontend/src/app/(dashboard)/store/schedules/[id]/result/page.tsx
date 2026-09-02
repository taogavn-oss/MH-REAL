'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const resultSchema = z.object({
  status: z.enum(['pending', 'passed_online', 'passed_onsite', 'failed']),
  orientation_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  onsite_instructions: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.status === 'passed_online' && !data.orientation_url) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Orientation URL is required for Online Pass',
      path: ['orientation_url'],
    });
  }
  if (data.status === 'passed_onsite' && !data.onsite_instructions) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Address instructions are required for Onsite Pass',
      path: ['onsite_instructions'],
    });
  }
});

type ResultFormValues = z.infer<typeof resultSchema>;

export default function CandidateResultPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      status: 'pending',
    },
  });

  const selectedStatus = watch('status');

  const onSubmit = async (data: ResultFormValues) => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      alert('Candidate result updated successfully.');
      router.push('/store/calendar');
    } catch (err) {
      alert('Failed to update result.');
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Interview Result
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Record the outcome of the candidate&apos;s interview.
          </p>
        </div>
      </div>

      <div className="mt-8 mx-auto max-w-2xl bg-white p-6 shadow sm:rounded-md border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="text-base font-medium text-gray-900">Outcome</label>
            <p className="text-sm leading-5 text-gray-500">Please select the final status.</p>
            <fieldset className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="pending"
                    type="radio"
                    value="pending"
                    {...register('status')}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="pending" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                    <Clock className="mr-2 h-4 w-4 text-gray-400" /> Pending (No Decision Yet)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="passed_online"
                    type="radio"
                    value="passed_online"
                    {...register('status')}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="passed_online" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Passed (Online Orientation)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="passed_onsite"
                    type="radio"
                    value="passed_onsite"
                    {...register('status')}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="passed_onsite" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Passed (Onsite Orientation)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="failed"
                    type="radio"
                    value="failed"
                    {...register('status')}
                    className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="failed" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                    <XCircle className="mr-2 h-4 w-4 text-red-500" /> Failed / Rejected
                  </label>
                </div>
              </div>
            </fieldset>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>

          {selectedStatus === 'passed_online' && (
            <div className="rounded-md bg-gray-50 p-4 border border-gray-200">
              <label htmlFor="orientation_url" className="block text-sm font-medium text-gray-700">
                Orientation URL
              </label>
              <input
                type="text"
                id="orientation_url"
                {...register('orientation_url')}
                placeholder="https://zoom.us/j/..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
              />
              {errors.orientation_url && <p className="mt-1 text-sm text-red-600">{errors.orientation_url.message}</p>}
            </div>
          )}

          {selectedStatus === 'passed_onsite' && (
            <div className="rounded-md bg-gray-50 p-4 border border-gray-200">
              <label htmlFor="onsite_instructions" className="block text-sm font-medium text-gray-700">
                Onsite Address & Instructions
              </label>
              <textarea
                id="onsite_instructions"
                rows={3}
                {...register('onsite_instructions')}
                placeholder="123 Main St, 2nd Floor..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
              />
              {errors.onsite_instructions && <p className="mt-1 text-sm text-red-600">{errors.onsite_instructions.message}</p>}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : 'Save Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
