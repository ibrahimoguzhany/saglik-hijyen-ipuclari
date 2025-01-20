'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Reminder {
  id: number;
  title: string;
  time: string;
  type: string;
  isActive: boolean;
}

const reminderTypes = {
  water: '💧 Su İçme',
  medicine: '💊 İlaç',
  exercise: '🏃‍♂️ Egzersiz',
  sleep: '😴 Uyku',
  handwashing: '🧼 El Yıkama'
};

export default function ReminderSystem() {
  const { user, loading: authLoading } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());
  const [newReminder, setNewReminder] = useState({
    title: '',
    time: '',
    type: 'water'
  });

  useEffect(() => {
    // Bildirim izni kontrolü
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Her gün gece yarısında shown notifications'ı sıfırla
  useEffect(() => {
    const resetShownNotifications = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setShownNotifications(new Set());
      }
    };

    const resetInterval = setInterval(resetShownNotifications, 60000);
    return () => clearInterval(resetInterval);
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      } catch (error) {
        console.error('Bildirim izni alınamadı:', error);
      }
    }
  };

  const scheduleReminders = (reminders: Reminder[]) => {
    const intervals: NodeJS.Timeout[] = [];

    reminders.forEach(reminder => {
      if (reminder.isActive) {
        const checkAndNotify = () => {
          const now = new Date();
          const [hours, minutes] = reminder.time.split(':').map(Number);
          const currentHours = now.getHours();
          const currentMinutes = now.getMinutes();
          const notificationKey = `${reminder.id}-${now.toDateString()}`;

          if (currentHours === hours && currentMinutes === minutes) {
            if (notificationPermission === 'granted' && !shownNotifications.has(notificationKey)) {
              try {
                const emoji = reminderTypes[reminder.type as keyof typeof reminderTypes].split(' ')[0];
                new Notification(`${emoji} ${reminder.title}`, {
                  body: `${reminderTypes[reminder.type as keyof typeof reminderTypes]} zamanı!`,
                  icon: '/favicon.ico',
                  requireInteraction: true,
                  silent: false
                });

                // Bildirimi gösterildi olarak işaretle
                setShownNotifications(prev => new Set(prev).add(notificationKey));
              } catch (error) {
                console.error('Bildirim gösterme hatası:', error);
              }
            }
          }
        };

        // İlk kontrol
        checkAndNotify();

        // Her 5 saniyede bir kontrol et
        const interval = setInterval(checkAndNotify, 5000);
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchReminders();
      } else {
        setLoading(false);
        setError('Hatırlatıcıları görmek için giriş yapmalısınız');
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (reminders.length > 0) {
      const cleanup = scheduleReminders(reminders);
      return cleanup;
    }
  }, [reminders, notificationPermission]);

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders');
      if (!response.ok) {
        throw new Error('Hatırlatıcılar getirilemedi');
      }
      const data = await response.json();
      setReminders(data);
      setError(null);
    } catch (error) {
      console.error('Fetch reminders error:', error);
      setError('Hatırlatıcılar getirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Hatırlatıcı eklemek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReminder,
          isActive: true
        })
      });

      if (!response.ok) {
        throw new Error('Hatırlatıcı eklenemedi');
      }

      const data = await response.json();
      setReminders([...reminders, data]);
      setNewReminder({ title: '', time: '', type: 'water' });
      setError(null);
    } catch (error) {
      console.error('Add reminder error:', error);
      setError('Hatırlatıcı eklenemedi');
    }
  };

  const toggleReminder = async (id: number) => {
    if (!user) {
      setError('Hatırlatıcıları düzenlemek için giriş yapmalısınız');
      return;
    }

    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return;

      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !reminder.isActive })
      });

      if (!response.ok) {
        throw new Error('Hatırlatıcı güncellenemedi');
      }

      setReminders(reminders.map(r =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      ));
      setError(null);
    } catch (error) {
      console.error('Toggle reminder error:', error);
      setError('Hatırlatıcı güncellenemedi');
    }
  };

  const deleteReminder = async (id: number) => {
    if (!user) {
      setError('Hatırlatıcıları silmek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Hatırlatıcı silinemedi');
      }

      setReminders(reminders.filter(r => r.id !== id));
      setError(null);
    } catch (error) {
      console.error('Delete reminder error:', error);
      setError('Hatırlatıcı silinemedi');
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-4 text-red-500">
        Hatırlatıcıları görmek için giriş yapmalısınız
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notificationPermission !== 'granted' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Hatırlatıcıları alabilmek için bildirim iznine ihtiyacımız var.
                <button
                  onClick={requestNotificationPermission}
                  className="ml-2 font-medium text-yellow-700 underline hover:text-yellow-600"
                >
                  İzin Ver
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {error && error.includes('Sistem bildirimlerini kontrol edin') && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
                <a
                  href="ms-settings:notifications"
                  className="ml-2 font-medium underline hover:text-red-600"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('ms-settings:notifications', '_blank');
                  }}
                >
                  Windows Bildirim Ayarlarını Aç
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleAddReminder} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={newReminder.title}
            onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
            placeholder="Hatırlatıcı başlığı"
            className="p-2 border rounded text-gray-900"
            required
          />
          <input
            type="time"
            value={newReminder.time}
            onChange={e => setNewReminder({ ...newReminder, time: e.target.value })}
            className="p-2 border rounded text-gray-900"
            required
          />
          <select
            value={newReminder.type}
            onChange={e => setNewReminder({ ...newReminder, type: e.target.value })}
            className="p-2 border rounded text-gray-900 bg-white cursor-pointer hover:bg-gray-50"
            required
          >
            {Object.entries(reminderTypes).map(([value, label]) => (
              <option key={value} value={value} className="text-gray-900">
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          Hatırlatıcı Ekle
        </button>
      </form>

      {error && (
        <div className="text-red-500 text-center py-2">{error}</div>
      )}

      <div className="space-y-2">
        {reminders.map(reminder => (
          <div
            key={reminder.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow"
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={reminder.isActive}
                onChange={() => toggleReminder(reminder.id)}
                className="h-5 w-5 text-blue-500"
              />
              <div className={reminder.isActive ? 'text-gray-900' : 'line-through text-gray-500'}>
                <div className="font-semibold text-base">{reminder.title}</div>
                <div className="text-sm text-gray-700">
                  {reminderTypes[reminder.type as keyof typeof reminderTypes]} - {reminder.time}
                </div>
              </div>
            </div>
            <button
              onClick={() => deleteReminder(reminder.id)}
              className="text-red-500 hover:text-red-600"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 