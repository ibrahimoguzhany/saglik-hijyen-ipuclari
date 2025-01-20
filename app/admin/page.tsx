'use client';

import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-4 text-red-500">
        Bu sayfaya erişim yetkiniz yok
      </div>
    );
  }

  const adminFeatures = [
    {
      title: 'İpuçları Yönetimi',
      description: 'Sağlık ve hijyen ipuçlarını ekleyin, düzenleyin veya silin.',
      href: '/admin/tips',
      icon: '📝'
    },
    {
      title: 'Kullanıcı İstatistikleri',
      description: 'Kullanıcı aktivitelerini ve sağlık verilerini görüntüleyin.',
      href: '#',
      icon: '📊',
      comingSoon: true
    },
    {
      title: 'İçerik Yönetimi',
      description: 'Site içeriğini ve kategorileri yönetin.',
      href: '#',
      icon: '📚',
      comingSoon: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Yönetici Paneli</h1>
        <p className="mt-2 text-gray-600">
          Hoş geldiniz! Bu panelden site içeriğini ve kullanıcı verilerini yönetebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adminFeatures.map((feature) => (
          <div
            key={feature.title}
            className="relative group bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="text-lg font-medium text-gray-900">
                {feature.title}
              </h3>
            </div>
            <p className="mt-2 text-gray-500">{feature.description}</p>
            {feature.comingSoon ? (
              <span className="mt-4 inline-block px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
                Yakında
              </span>
            ) : (
              <Link
                href={feature.href}
                className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Yönet
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 