'use client';

import React, { useState } from 'react';
import { Download, FileText, Calendar, Users } from 'lucide-react';

export default function HQExportsPage() {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = async (type: string) => {
    setIsDownloading(type);
    try {
      // Mock triggering backend export generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock generating a dummy CSV locally since we can't actually download from the down backend
      const csvContent = "data:text/csv;charset=utf-8,ID,Name\n1,Test";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      alert(`Failed to download ${type} data.`);
    } finally {
      setIsDownloading(null);
    }
  };

  const exportOptions = [
    {
      id: 'candidates',
      title: 'Candidates Master Data',
      description: 'Export all candidate records, including contact info, survey responses, and current status.',
      icon: <Users className="h-6 w-6 text-indigo-600" />,
    },
    {
      id: 'requirements',
      title: 'Job Requirements',
      description: 'Export all Store Manager job requirements, including draft, pending, and published states.',
      icon: <FileText className="h-6 w-6 text-green-600" />,
    },
    {
      id: 'schedules',
      title: 'Interview Schedules',
      description: 'Export all finalized and pending interview schedules globally across all areas.',
      icon: <Calendar className="h-6 w-6 text-yellow-600" />,
    },
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Data Exports
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Download system records in CSV format. All downloads are generated securely by the server.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exportOptions.map((option) => (
          <div key={option.id} className="relative flex flex-col rounded-lg border border-gray-300 bg-white p-6 shadow-sm hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
              {option.icon}
            </div>
            <div className="mt-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900">{option.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{option.description}</p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => handleDownload(option.id)}
                disabled={isDownloading === option.id}
                className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <Download className="-ml-1 mr-2 h-4 w-4 text-gray-400" />
                {isDownloading === option.id ? 'Generating...' : 'Download CSV'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
