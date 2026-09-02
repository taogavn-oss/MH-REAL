'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, FileEdit, User } from 'lucide-react';
import { useParams } from 'next/navigation';

type AuditEvent = {
  id: string;
  timestamp: string;
  actorRole: string;
  actorName: string;
  action: 'Created' | 'Submitted' | 'Approved' | 'Rejected' | 'Edited';
  comment?: string;
  version: number;
};

export default function RequirementHistoryPage() {
  const params = useParams();
  const reqId = params.id as string;

  const { data: history, isLoading } = useQuery({
    queryKey: ['requirement-history', reqId],
    queryFn: async () => {
      return new Promise<AuditEvent[]>((resolve) => {
        setTimeout(() => {
          resolve([
            { id: '4', timestamp: '2026-09-02 14:00', actorRole: 'HQ', actorName: 'HQ Admin', action: 'Approved', version: 3 },
            { id: '3', timestamp: '2026-09-02 10:30', actorRole: 'Store Manager', actorName: 'Tanaka Y.', action: 'Submitted', comment: 'Adjusted headcount based on feedback.', version: 2 },
            { id: '2', timestamp: '2026-09-01 16:45', actorRole: 'Area Manager', actorName: 'Suzuki K.', action: 'Rejected', comment: 'Headcount too high for Q3 budget. Please reduce to 2.', version: 1 },
            { id: '1', timestamp: '2026-09-01 09:00', actorRole: 'Store Manager', actorName: 'Tanaka Y.', action: 'Created', version: 1 },
          ]);
        }, 500);
      });
    },
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Created': return <FileEdit className="h-5 w-5 text-gray-500" />;
      case 'Submitted': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <FileEdit className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Created': return 'bg-gray-100 text-gray-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between border-b pb-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Requirement Audit History
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Timeline of all state transitions and approvals for Requirement #{reqId}.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500 py-10">Loading timeline...</p>
      ) : (
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {history?.map((event, eventIdx) => (
              <li key={event.id}>
                <div className="relative pb-8">
                  {eventIdx !== history.length - 1 ? (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-white flex items-center justify-center ring-8 ring-white">
                        {getActionIcon(event.action)}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionColor(event.action)} mr-2`}>
                            {event.action}
                          </span>
                          <span className="font-medium text-gray-900 mr-2">{event.actorName}</span>
                          <span className="text-gray-400 text-xs">({event.actorRole})</span>
                        </p>
                        {event.comment && (
                          <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                            {event.comment}
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-400">Version: {event.version}</p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time dateTime={event.timestamp}>{event.timestamp}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
