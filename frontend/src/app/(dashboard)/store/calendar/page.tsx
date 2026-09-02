'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar as CalendarIcon, ShieldAlert } from 'lucide-react';

const slotSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  capacity: z.coerce.number().min(1).max(10),
});

type SlotFormValues = z.infer<typeof slotSchema>;

type HttpError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

export default function StoreCalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SlotFormValues>({
    resolver: zodResolver(slotSchema) as any,
  });

  // Mock fetching current slots
  const { data: slots } = useQuery({
    queryKey: ['slots'],
    queryFn: async () => {
      return [
        { id: 1, date: '2026-09-10', start: '10:00', end: '11:00', capacity: 2, booked: 1 },
        { id: 2, date: '2026-09-12', start: '14:00', end: '15:30', capacity: 3, booked: 3 },
      ];
    },
  });

  const openSlotModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    reset({ date: dateStr, capacity: 1, startTime: '09:00', endTime: '10:00' });
    setConflictError(null);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: SlotFormValues) => {
    setConflictError(null);
    try {
      // Mock API call checking overlap
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (data.startTime >= data.endTime) {
            reject({ response: { status: 400, data: { message: 'End time must be after start time' } } });
          } else if (Math.random() > 0.8) {
            reject({ response: { status: 409, data: { message: 'Conflict: Slot overlaps with an existing interval' } } });
          } else {
            resolve(true);
          }
        }, 500);
      });
      setIsModalOpen(false);
    } catch (error: unknown) {
      const httpError = error as HttpError;
      if (httpError.response?.status === 409 || httpError.response?.status === 400) {
        setConflictError(httpError.response.data?.message ?? 'Unable to create the slot.');
      } else {
        setConflictError('Failed to create slot.');
      }
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Interview Schedule Calendar
          </h2>
          <p className="mt-2 text-sm text-gray-700">Manage store interview availability and active slots.</p>
        </div>
      </div>

      {/* Mock Calendar Grid for September 2026 */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 gap-px border-b border-gray-200 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700">
          <div className="bg-white py-2">M</div><div className="bg-white py-2">T</div><div className="bg-white py-2">W</div>
          <div className="bg-white py-2">T</div><div className="bg-white py-2">F</div><div className="bg-white py-2">S</div>
          <div className="bg-white py-2">S</div>
        </div>
        <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 grid grid-cols-7 gap-px">
          {/* Creating a mock 4-week grid */}
          {Array.from({ length: 28 }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `2026-09-${dayNum.toString().padStart(2, '0')}`;
            const daySlots = slots?.filter(s => s.date === dateStr) || [];
            
            return (
              <div key={i} onClick={() => openSlotModal(dateStr)} className="min-h-[120px] bg-white p-2 hover:bg-gray-50 cursor-pointer transition-colors relative">
                <span className="font-semibold text-gray-900">{dayNum}</span>
                <div className="mt-2 space-y-1">
                  {daySlots.map(slot => (
                    <div key={slot.id} className={`text-[10px] rounded px-1.5 py-0.5 font-medium flex items-center justify-between ${
                      slot.booked >= slot.capacity ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      <span>{slot.start}</span>
                      <span>{slot.booked}/{slot.capacity}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slot Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                  <CalendarIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Create Interview Slot
                  </h3>
                  <p className="text-sm text-gray-500">For {selectedDate}</p>
                </div>
              </div>

              {conflictError && (
                <div className="mt-4 rounded-md bg-yellow-50 p-4 border border-yellow-400">
                  <div className="flex items-center">
                    <ShieldAlert className="h-5 w-5 text-yellow-400 mr-2" />
                    <p className="text-sm font-medium text-yellow-800">{conflictError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="mt-5 sm:mt-6 space-y-4">
                <input type="hidden" {...register('date')} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      {...register('startTime')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                    />
                    {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      {...register('endTime')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                    />
                    {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Capacity</label>
                  <input
                    type="number"
                    {...register('capacity')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                  />
                  {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity.message}</p>}
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  >
                    Save Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
