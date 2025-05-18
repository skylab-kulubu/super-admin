"use client";

import React from 'react';
import { AgcStaff } from '@/types'; // Use AgcStaff type
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { PencilSquareIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface AgcStaffTableProps {
  staffMembers: AgcStaff[];
  onEditStaff: (staff: AgcStaff) => void;
}

const AgcStaffTable: React.FC<AgcStaffTableProps> = ({ staffMembers, onEditStaff }) => {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fotoğraf</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ad Soyad</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Departman</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">LinkedIn</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Eylemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {staffMembers.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Ekip üyesi bulunamadı.
              </td>
            </tr>
          )}
          {staffMembers.map((staff) => (
            <tr key={staff.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td className="px-4 py-3 whitespace-nowrap">
                {staff.photo?.photoUrl ? (
                  <Image src={staff.photo.photoUrl} alt={`${staff.firstName} ${staff.lastName}`} width={40} height={40} className="rounded-full object-cover" />
                ) : (
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{staff.firstName} {staff.lastName}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{staff.department || '-'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {staff.linkedin ? (
                  <a href={staff.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Profil
                  </a>
                ) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <Button variant="secondary" onClick={() => onEditStaff(staff)} className="!p-1.5" title="Düzenle">
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

export default AgcStaffTable;
