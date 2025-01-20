import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
}

const TipList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState<Tip[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await fetch('/api/tips');
        if (!response.ok) {
          throw new Error('İpuçları getirilemedi');
        }
        const data = await response.json();
        setTips(data);
        setError(null);
      } catch (error) {
        console.error('Fetch tips error:', error);
        setError('İpuçları yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">{error}</div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tips.map((tip) => (
        <div key={tip.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{tip.title}</h3>
          <p className="text-gray-600 mb-4">{tip.content}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{tip.category}</span>
            <span>{new Date(tip.date).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TipList; 