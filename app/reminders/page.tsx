'use client';

import ReminderSystem from '../components/ReminderSystem';

export default function RemindersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Hatırlatıcılar</h1>
            <p className="mt-2 text-gray-600">
              Sağlıklı yaşam için önemli aktivitelerinizi planlamak ve takip etmek için hatırlatıcıları kullanın.
            </p>
          </div>

          <div className="grid gap-6">
            <ReminderSystem />

            {/* Hatırlatıcı İstatistikleri */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hatırlatıcı İpuçları</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">💧 Su İçme</h3>
                  <p className="text-blue-700 text-sm">
                    Günde en az 8 bardak su için. Her 2 saatte bir hatırlatıcı kurun.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">🏃‍♂️ Egzersiz</h3>
                  <p className="text-green-700 text-sm">
                    Haftada en az 3 gün egzersiz yapın. Sabah veya akşam rutininize ekleyin.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">😴 Uyku</h3>
                  <p className="text-purple-700 text-sm">
                    Her gün aynı saatte yatın ve kalkın. Yatmadan 1 saat önce hatırlatıcı kurun.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">💊 İlaç</h3>
                  <p className="text-yellow-700 text-sm">
                    İlaçlarınızı düzenli almak için öğün zamanlarına hatırlatıcı ekleyin.
                  </p>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <h3 className="font-medium text-pink-900 mb-2">🧼 El Yıkama</h3>
                  <p className="text-pink-700 text-sm">
                    Özellikle yemek öncesi ve sonrası için hatırlatıcı oluşturun.
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h3 className="font-medium text-indigo-900 mb-2">⚡ İpucu</h3>
                  <p className="text-indigo-700 text-sm">
                    Hatırlatıcıları günlük rutininize göre ayarlayın ve aktif tutun.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 