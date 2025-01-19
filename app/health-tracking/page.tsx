'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import DataEntryForm from './components/DataEntryForm';

interface HealthData {
  date: string;
  steps: number;
  waterIntake: number;
  sleepHours: number;
  sleepQuality: number;
}

export default function HealthTrackingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'steps' | 'water' | 'sleep'>('steps');
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [todayData, setTodayData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyGoals, setDailyGoals] = useState({
    steps: 10000,
    waterIntake: 2500,
    sleepHours: 8
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/health-tracking');
    } else if (user) {
      fetchHealthData();
    }
  }, [user, loading, router]);

  const fetchHealthData = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/health-data?userId=${user.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Veriler alınamadı');
      }

      setHealthData(result.data);
      if (result.data.length > 0) {
        setTodayData(result.data[0]);
      }
    } catch (error) {
      console.error('Veri alma hatası:', error);
      setError('Veriler alınamadı. Lütfen daha sonra tekrar deneyin.');
    }
  };

  const handleDataSubmit = async (data: {
    steps: number;
    waterIntake: number;
    sleepHours: number;
    sleepQuality: number;
  }) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/health-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          data
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Veri kaydedilemedi');
      }

      setHealthData(result.data);
      if (result.data.length > 0) {
        setTodayData(result.data[0]);
      }
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
      setError('Veriler kaydedilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const renderChart = () => {
    if (selectedTab === 'steps') {
      return (
        <LineChart data={healthData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="steps"
            name="Adım Sayısı"
            stroke="#2563eb"
            strokeWidth={2}
          />
        </LineChart>
      );
    }

    if (selectedTab === 'water') {
      return (
        <BarChart data={healthData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="waterIntake"
            name="Su Tüketimi (ml)"
            fill="#2563eb"
          />
        </BarChart>
      );
    }

    return (
      <LineChart data={healthData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="sleepHours"
          name="Uyku Süresi (saat)"
          stroke="#2563eb"
          strokeWidth={2}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="sleepQuality"
          name="Uyku Kalitesi (%)"
          stroke="#16a34a"
          strokeWidth={2}
        />
      </LineChart>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Kişisel Sağlık Takibi</h1>
            <p className="mt-2 text-gray-600">
              Günlük aktivitelerinizi takip edin ve sağlıklı yaşam hedeflerinize ulaşın.
            </p>
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 rounded-md p-2">
                {error}
              </div>
            )}
          </div>

          <div className="mb-8">
            <DataEntryForm onSubmit={handleDataSubmit} isLoading={isLoading} />
          </div>

          {todayData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Adım Sayısı Kartı */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">👣 Adım Sayısı</h3>
                  <span className="text-sm text-gray-500">Günlük Hedef: {dailyGoals.steps}</span>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {todayData.steps.toLocaleString()}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${calculateProgress(todayData.steps, dailyGoals.steps)}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Hedefinizin %{calculateProgress(todayData.steps, dailyGoals.steps)}'sine ulaştınız
                </p>
              </div>

              {/* Su Tüketimi Kartı */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">💧 Su Tüketimi</h3>
                  <span className="text-sm text-gray-500">Günlük Hedef: {dailyGoals.waterIntake}ml</span>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {todayData.waterIntake}ml
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${calculateProgress(todayData.waterIntake, dailyGoals.waterIntake)}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Hedefinizin %{calculateProgress(todayData.waterIntake, dailyGoals.waterIntake)}'sine ulaştınız
                </p>
              </div>

              {/* Uyku Takibi Kartı */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">😴 Uyku Süresi</h3>
                  <span className="text-sm text-gray-500">Günlük Hedef: {dailyGoals.sleepHours} saat</span>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {todayData.sleepHours} saat
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${calculateProgress(todayData.sleepHours, dailyGoals.sleepHours)}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Uyku kalitesi: %{todayData.sleepQuality}
                </p>
              </div>
            </div>
          )}

          {/* Grafik Seçim Tabları */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('steps')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'steps'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👣 Adım Sayısı
              </button>
              <button
                onClick={() => setSelectedTab('water')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'water'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💧 Su Tüketimi
              </button>
              <button
                onClick={() => setSelectedTab('sleep')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'sleep'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                😴 Uyku Analizi
              </button>
            </nav>
          </div>

          {/* Grafik Alanı */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 