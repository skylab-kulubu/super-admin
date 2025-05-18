import Link from 'next/link';
import React from 'react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center px-4">
      <h1 className="text-6xl font-bold text-primary">403</h1>
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mt-4 mb-2">Erişim Reddedildi</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.
      </p>
      <Link href="/" className="px-6 py-3 bg-primary text-white rounded-md hover:bg-red-700 transition-colors">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
