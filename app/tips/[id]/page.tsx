'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
}

export default function TipDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTip();
  }, [id]);

  const fetchTip = async () => {
    try {
      const response = await fetch(`/api/tips/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İpucu yüklenemedi');
      }

      setTip(data);
    } catch (error) {
      console.error('İpucu yükleme hatası:', error);
      setError('İpucu yüklenemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!tip) return;

    try {
      await navigator.share({
        title: tip.title,
        text: tip.content,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !tip) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hata</h2>
          <p className="text-gray-600">{error || 'İpucu bulunamadı'}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">{tip.title}</h1>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                Paylaş
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              <div className="prose prose-blue max-w-none">
                <p className="text-lg text-gray-900 leading-relaxed">{tip.content}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {tip.category === 'hijyen' && '🧼'}
                    {tip.category === 'sağlık' && '🏥'}
                    {tip.category === 'spor' && '🏃‍♂️'}
                    {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(tip.date).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
} 