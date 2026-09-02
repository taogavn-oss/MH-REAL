'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertOctagon, MailX, MessageSquareWarning } from 'lucide-react';

type NotificationFailure = {
  id: string;
  type: 'email' | 'sms' | 'webhook';
  recipientMasked: string;
  errorReason: string;
  failedAt: string;
  attempts: number;
};

export default function HQNotificationsPage() {
  const { data: failures, isLoading } = useQuery({
    queryKey: ['notification-failures'],
    queryFn: async () => {
      // Mock fetching failures
      return new Promise<NotificationFailure[]>((resolve) => {
        setTimeout(() => {
          resolve([
            { id: 'err_1', type: 'email', recipientMasked: 'c***@gmail.com', errorReason: 'Bounce: Recipient address rejected', failedAt: '2026-09-02 14:32:00', attempts: 5 },
            { id: 'err_2', type: 'sms', recipientMasked: '+81 90-****-1234', errorReason: 'Carrier blocked: Spam detection', failedAt: '2026-09-02 15:10:00', attempts: 3 },
            { id: 'err_3', type: 'webhook', recipientMasked: 'RikuOp ATS Endpoint', errorReason: 'Connection Timeout (504)', failedAt: '2026-09-02 16:45:00', attempts: 5 },
          ]);
        }, 600);
      });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return <MailX className="h-5 w-5 text-red-500" />;
      case 'sms': return <MessageSquareWarning className="h-5 w-5 text-yellow-500" />;
      default: return <AlertOctagon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Terminal Notification Failures
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Read-only view of background jobs that failed to deliver after maximum retries. PII is masked.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Target (Masked)</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reason</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Attempts</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Failed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                        Loading system logs...
                      </td>
                    </tr>
                  )}
                  {!isLoading && failures?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                        No delivery failures recorded. System healthy.
                      </td>
                    </tr>
                  )}
                  {failures?.map((err) => (
                    <tr key={err.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 flex items-center">
                        {getIcon(err.type)}
                        <span className="ml-2 capitalize">{err.type}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-gray-600">{err.recipientMasked}</td>
                      <td className="px-3 py-4 text-sm text-red-600 max-w-xs truncate">{err.errorReason}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{err.attempts} / {err.attempts}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{err.failedAt}</td>
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
