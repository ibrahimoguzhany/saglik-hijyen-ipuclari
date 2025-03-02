'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import LoadingSpinner from '../../../../components/LoadingSpinner';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
}

export default function EditTipPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const response = await fetch(`/api/admin/tips/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('İpucu getirilemedi');
        }
        const data = await response.json();
        setTip(data);
      } catch (error) {
        console.error('Fetch tip error:', error);
        setError('İpucu yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchTip();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tip) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/tips/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tip),
      });

      if (!response.ok) {
        throw new Error('İpucu güncellenemedi');
      }

      router.push('/admin/tips');
    } catch (error) {
      console.error('Update tip error:', error);
      setError('İpucu güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTip(prev => prev ? { ...prev, [name]: value } : null);
  };

  if (loading || authLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">İpucu Düzenle</h1>
        </div>

        {error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : tip ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Başlık
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={tip.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 font-medium"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                İçerik
              </label>
              <textarea
                name="content"
                id="content"
                rows={4}
                value={tip.content}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 font-medium"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Kategori
              </label>
              <input
                type="text"
                name="category"
                id="category"
                value={tip.category}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 font-medium"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Tarih
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={tip.date}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 font-medium"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/tips')}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
} 