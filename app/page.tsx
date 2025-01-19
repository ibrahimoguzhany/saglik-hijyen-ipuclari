'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
}

const emergencyContacts = [
  { name: 'Acil Servis', number: '112' },
  { name: 'Polis', number: '155' },
  { name: 'İtfaiye', number: '110' },
  { name: 'Zehir Danışma', number: '114' }
];

export default function Home() {
  const router = useRouter();
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
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
      } catch (error) {
        console.error('İpuçları yükleme hatası:', error);
        setError('İpuçları yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const navigateToTip = (id: number) => {
    router.push(`/tips/${id}`);
  };

  const handleShare = async (tip: Tip) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tip.title,
          text: tip.content,
          url: window.location.origin + `/tips/${tip.id}`
        });
      } catch (error) {
        console.error('Paylaşım hatası:', error);
      }
    } else {
      alert('Paylaşım özelliği bu tarayıcıda desteklenmiyor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" role="main">
        {/* Acil Durum Bilgileri */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8" role="alert">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Acil Durum Numaraları</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {emergencyContacts.map((contact) => (
              <button
                key={contact.number}
                onClick={() => handleCall(contact.number)}
                className="flex items-center justify-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                aria-label={`${contact.name} numarası: ${contact.number}`}
              >
                <div className="text-center">
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-red-600 text-lg">{contact.number}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Günün İpucu */}
        {tips.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Günün İpucu</h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">{tips[0].title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  tips[0].category === 'sağlık' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {tips[0].category}
                </span>
              </div>
              <p className="mt-2 text-gray-600">{tips[0].content}</p>
            </div>
          </div>
        )}

        {/* Tüm İpuçları */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tüm İpuçları</h2>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-600">İpuçları yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2" role="list">
                {tips.map((tip) => (
                  <div 
                    key={tip.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" 
                    role="listitem"
                    onClick={() => navigateToTip(tip.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{tip.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tip.category === 'sağlık' ? 'bg-green-100 text-green-800' : 
                        tip.category === 'hijyen' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`} role="status">
                        {tip.category}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{tip.content}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">{tip.date}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(tip);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        aria-label={`${tip.title} ipucunu paylaş`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Paylaş
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white shadow mt-8" role="contentinfo">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Bu uygulama toplum sağlığına katkıda bulunmak amacıyla hazırlanmıştır.
            <br />
            Acil durumlarda profesyonel sağlık kuruluşlarına başvurunuz.
          </p>
        </div>
      </footer>
    </div>
  );
}
