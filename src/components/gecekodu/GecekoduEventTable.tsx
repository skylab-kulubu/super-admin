"use client";

import React from 'react';
import { GecekoduEvent } from '@/types';
import Button from '@/components/ui/Button';
import { PencilSquareIcon, PhotoIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface GecekoduEventTableProps {
  events: GecekoduEvent[];
  onEditEvent: (event: GecekoduEvent) => void;
  onManagePhotos: (event: GecekoduEvent) => void;
}

const GecekoduEventTable: React.FC<GecekoduEventTableProps> = ({ events, onEditEvent, onManagePhotos }) => {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {/* guestName column removed */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Başlık</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tarih</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tip</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aktif</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Eylemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {events.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Etkinlik bulunamadı.
              </td>
            </tr>
          )}
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 max-w-xs truncate" title={event.title}>{event.title}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{event.date}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{event.type || '-'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                {event.isActive ? <CheckCircleIcon className="h-5 w-5 text-green-500 inline" /> : <XCircleIcon className="h-5 w-5 text-red-500 inline" />}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                <Button variant="secondary" onClick={() => onEditEvent(event)} className="!p-1.5" title="Düzenle">
                  <PencilSquareIcon className="h-5 w-5" />
                </Button>
                <Button variant="secondary" onClick={() => onManagePhotos(event)} className="!p-1.5" title="Fotoğrafları Yönet">
                  <PhotoIcon className="h-5 w-5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GecekoduEventTable;
