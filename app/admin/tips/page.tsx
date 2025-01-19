'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
}

export default function AdminTipsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await fetch('/api/admin/tips');
        if (!response.ok) {
          throw new Error('İpuçları getirilemedi');
        }
        const data = await response.json();
        setTips(data);
      } catch (error) {
        console.error('Fetch tips error:', error);
        setError('İpuçları yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu ipucunu silmek istediğinizden emin misiniz?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      const response = await fetch(`/api/admin/tips/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('İpucu silinemedi');
      }

      setTips(tips.filter(tip => tip.id !== id));
    } catch (error) {
      console.error('Delete tip error:', error);
      alert('İpucu silinirken bir hata oluştu');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-4 text-red-500">
        Bu sayfaya erişim yetkiniz yok
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">İpuçları Yönetimi</h1>
          <Link
            href="/admin/tips/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Yeni İpucu Ekle
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-4">Yükleniyor...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başlık
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tips.map((tip) => (
                  <tr key={tip.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tip.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tip.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tip.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/tips/${tip.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDelete(tip.id)}
                        disabled={deleteLoading === tip.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading === tip.id ? 'Siliniyor...' : 'Sil'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 