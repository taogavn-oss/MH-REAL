'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { AlertCircle, Save, Send } from 'lucide-react';

const requirementSchema = z.object({
  headcount: z.coerce.number().min(1, 'Headcount must be at least 1').max(99),
  hourly_wage: z.coerce.number().min(1000, 'Minimum wage is 1000¥'),
  recruitment_channel: z.enum(['internal', 'external', 'agency']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof requirementSchema>;

type HttpError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

export default function NewRequirementPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(requirementSchema) as any,
    defaultValues: {
      recruitment_channel: 'internal',
    },
  });

  const handleSaveDraft = async (data: FormValues) => {
    // Save as draft, might skip some strict validation in a real scenario
    submitForm(data, 'draft');
  };

  const handleSubmitForApproval = async (data: FormValues) => {
    // Validate everything
    const isValid = await trigger();
    if (isValid) {
      submitForm(data, 'pending_am');
    }
  };

  const submitForm = async (data: FormValues, action: 'draft' | 'pending_am') => {
    setErrorMsg(null);
    setConflictMsg(null);

    try {
      // Mock API call since backend is down
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate a 409 Conflict if they edit something stale (mocked randomly for demo)
          if (Math.random() > 0.9) {
            reject({ response: { status: 409, data: { message: 'Version conflict. Someone else edited this.' } } });
          } else {
            resolve({ data: { success: true } });
          }
        }, 800);
      });

      router.push('/store/requirements');
    } catch (error: unknown) {
      const httpError = error as HttpError;
      if (httpError.response?.status === 409) {
        setConflictMsg(httpError.response?.data?.message || 'Conflict occurred.');
      } else {
        setErrorMsg('Failed to save requirement.');
      }
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Create Job Requirement
          </h2>
        </div>
      </div>

      <div className="mt-8 mx-auto max-w-2xl">
        {conflictMsg && (
          <div className="mb-4 rounded-md bg-yellow-50 p-4 border border-yellow-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Version Conflict</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{conflictMsg}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-400 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form className="space-y-6 bg-white p-6 shadow sm:rounded-md">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            
            <div className="sm:col-span-1">
              <label htmlFor="headcount" className="block text-sm font-medium text-gray-700">
                Headcount
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="headcount"
                  {...register('headcount')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                />
                {errors.headcount && <p className="mt-1 text-sm text-red-600">{errors.headcount.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="hourly_wage" className="block text-sm font-medium text-gray-700">
                Hourly Wage (¥)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="hourly_wage"
                  {...register('hourly_wage')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                />
                {errors.hourly_wage && <p className="mt-1 text-sm text-red-600">{errors.hourly_wage.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="recruitment_channel" className="block text-sm font-medium text-gray-700">
                Recruitment Channel
              </label>
              <div className="mt-1">
                <select
                  id="recruitment_channel"
                  {...register('recruitment_channel')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                >
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                  <option value="agency">Agency</option>
                </select>
                {errors.recruitment_channel && <p className="mt-1 text-sm text-red-600">{errors.recruitment_channel.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  rows={3}
                  {...register('notes')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleSubmit(handleSaveDraft)}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit(handleSubmitForApproval)}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Send className="-ml-1 mr-2 h-4 w-4" />
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
