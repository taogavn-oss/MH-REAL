'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';

type Slot = {
  id: string;
  date: string;
  start: string;
  end: string;
};

export default function CandidatePreferencesPage() {
  const router = useRouter();
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock fetching available slots
  const { data: availableSlots, isLoading } = useQuery({
    queryKey: ['available-slots'],
    queryFn: async () => {
      return new Promise<Slot[]>((resolve) => {
        setTimeout(() => {
          resolve([
            { id: '1', date: '2026-09-10', start: '10:00', end: '11:00' },
            { id: '2', date: '2026-09-10', start: '13:00', end: '14:00' },
            { id: '3', date: '2026-09-11', start: '09:00', end: '10:00' },
            { id: '4', date: '2026-09-11', start: '15:00', end: '16:00' },
            { id: '5', date: '2026-09-12', start: '10:00', end: '11:00' },
          ]);
        }, 500);
      });
    },
  });

  const toggleSlot = (id: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      }
      if (prev.length >= 3) {
        alert('You can only select up to 3 preferred slots.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const submitPreferences = async () => {
    if (selectedSlots.length === 0) {
      alert('Please select at least 1 slot.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Mock API call to submit matching preferences
      await new Promise(resolve => setTimeout(resolve, 800));
      router.push('/surveys/success'); // Reuse success page
    } catch (err) {
      alert('Failed to submit preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Loading available slots...</p></div>;
  }

  return (
    <div className="flex min-h-screen justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8 rounded-xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Select Interview Preferences
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please choose up to 3 time slots that work best for you. We will automatically match you with the first available slot.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center bg-indigo-50 px-4 py-2 rounded-md">
            <span className="text-sm font-medium text-indigo-800">Selected Slots:</span>
            <span className="text-sm font-bold text-indigo-900">{selectedSlots.length} / 3</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {availableSlots?.map(slot => {
              const isSelected = selectedSlots.includes(slot.id);
              const rank = selectedSlots.indexOf(slot.id) + 1;

              return (
                <div
                  key={slot.id}
                  onClick={() => toggleSlot(slot.id)}
                  className={`relative cursor-pointer rounded-lg border p-4 shadow-sm transition-all ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {rank}
                    </div>
                  )}
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    {slot.date}
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Clock className="mr-2 h-4 w-4 text-gray-400" />
                    {slot.start} - {slot.end}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={submitPreferences}
            disabled={isSubmitting || selectedSlots.length === 0}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
