'use client';

import { useState } from 'react';

interface DataEntryFormProps {
  onSubmit: (data: {
    steps: number;
    waterIntake: number;
    sleepHours: number;
    sleepQuality: number;
  }) => void;
  isLoading?: boolean;
}

export default function DataEntryForm({ onSubmit, isLoading }: DataEntryFormProps) {
  const [formData, setFormData] = useState({
    steps: '',
    waterIntake: '',
    sleepHours: '',
    sleepQuality: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      steps: parseInt(formData.steps) || 0,
      waterIntake: parseInt(formData.waterIntake) || 0,
      sleepHours: parseFloat(formData.sleepHours) || 0,
      sleepQuality: parseInt(formData.sleepQuality) || 0
    });
    // Form gönderildikten sonra temizle
    setFormData({
      steps: '',
      waterIntake: '',
      sleepHours: '',
      sleepQuality: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Günlük Veri Girişi</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="steps" className="block text-sm font-medium text-gray-900">
            👣 Adım Sayısı
          </label>
          <input
            type="number"
            id="steps"
            min="0"
            max="100000"
            value={formData.steps}
            onChange={(e) => setFormData(prev => ({ ...prev, steps: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 font-medium placeholder-gray-600"
            placeholder="Örn: 8000"
          />
        </div>

        <div>
          <label htmlFor="waterIntake" className="block text-sm font-medium text-gray-900">
            💧 Su Tüketimi (ml)
          </label>
          <input
            type="number"
            id="waterIntake"
            min="0"
            max="5000"
            step="100"
            value={formData.waterIntake}
            onChange={(e) => setFormData(prev => ({ ...prev, waterIntake: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 font-medium placeholder-gray-600"
            placeholder="Örn: 2000"
          />
        </div>

        <div>
          <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-900">
            😴 Uyku Süresi (saat)
          </label>
          <input
            type="number"
            id="sleepHours"
            min="0"
            max="24"
            step="0.5"
            value={formData.sleepHours}
            onChange={(e) => setFormData(prev => ({ ...prev, sleepHours: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 font-medium placeholder-gray-600"
            placeholder="Örn: 7.5"
          />
        </div>

        <div>
          <label htmlFor="sleepQuality" className="block text-sm font-medium text-gray-900">
            🌟 Uyku Kalitesi (0-100)
          </label>
          <input
            type="number"
            id="sleepQuality"
            min="0"
            max="100"
            value={formData.sleepQuality}
            onChange={(e) => setFormData(prev => ({ ...prev, sleepQuality: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 font-medium placeholder-gray-600"
            placeholder="Örn: 85"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
        >
          {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
} 