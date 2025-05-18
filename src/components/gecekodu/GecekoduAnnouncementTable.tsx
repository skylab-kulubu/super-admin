"use client";

import React from 'react';
import { GecekoduAnnouncement } from '@/types'; // Use GecekoduAnnouncement type
import Button from '@/components/ui/Button';
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface GecekoduAnnouncementTableProps {
  announcements: GecekoduAnnouncement[];
  onEditAnnouncement: (announcement: GecekoduAnnouncement) => void;
}

const GecekoduAnnouncementTable: React.FC<GecekoduAnnouncementTableProps> = ({ announcements, onEditAnnouncement }) => {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Başlık</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İçerik (Kısaltılmış)</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Yayın Tarihi</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Yazar</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aktif</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Eylemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {announcements.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Duyuru bulunamadı.
              </td>
            </tr>
          )}
          {announcements.map((announcement) => (
            <tr key={announcement.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{announcement.title}</td>
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 max-w-md truncate" title={announcement.content}>
                {announcement.content.substring(0, 100)}{announcement.content.length > 100 ? '...' : ''}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{announcement.date}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{announcement.author || '-'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                {announcement.isActive ? <CheckCircleIcon className="h-5 w-5 text-green-500 inline" /> : <XCircleIcon className="h-5 w-5 text-red-500 inline" />}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <Button variant="secondary" onClick={() => onEditAnnouncement(announcement)} className="!p-1.5" title="Düzenle">
                  <PencilSquareIcon className="h-5 w-5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GecekoduAnnouncementTable;
