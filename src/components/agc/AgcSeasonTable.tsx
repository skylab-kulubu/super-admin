import React from 'react';
import { Season } from '@/types';
import { PencilIcon, UsersIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { formatDateToLocale, parseApiTimestampToYyyyMmDd } from '@/lib/utils';
import { useRouter } from 'next/navigation'; // Import useRouter

interface AgcSeasonTableProps {
  seasons: Season[];
  onEditSeason: (season: Season) => void;
  // onManageCompetitors prop is removed
}

const AgcSeasonTable: React.FC<AgcSeasonTableProps> = ({ seasons, onEditSeason }) => {
  const router = useRouter(); // Initialize router

  if (!seasons.length) {
    return <p className="text-center text-gray-600 dark:text-gray-400 py-4">Henüz AGC sezonu eklenmemiş.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Sezon Adı
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Başlangıç
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Bitiş
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Yarışmacılar
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Aktif
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {seasons.map((season) => (
            <tr key={season.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {season.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {season.startDate ? formatDateToLocale(parseApiTimestampToYyyyMmDd(season.startDate)) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {season.endDate ? formatDateToLocale(parseApiTimestampToYyyyMmDd(season.endDate)) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">
                {season.competitors?.length || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                {season.isActive ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500 inline-block" title='Aktif' />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-500 inline-block" title='Pasif' />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Button
                  variant="primary"
                  onClick={() => router.push(`/agc/seasons/${season.id}`)} // Navigate to season detail page
                  aria-label="Sezon Detayları ve Yarışmacılar"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <EyeIcon className="h-5 w-5 mr-1 sm:mr-0" /> <span className="hidden sm:inline">Detaylar</span>
                </Button>
                <Button
                  variant="primary"
                  onClick={() => onEditSeason(season)}
                  aria-label="Sezonu Düzenle"
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <PencilIcon className="h-5 w-5 mr-1 sm:mr-0" /> <span className="hidden sm:inline">Düzenle</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgcSeasonTable;
