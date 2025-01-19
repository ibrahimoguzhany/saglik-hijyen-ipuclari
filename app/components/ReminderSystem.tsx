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
  const [newReminder, setNewReminder] = useState({
    title: '',
    time: '',
    type: 'water'
  });

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
        body: JSON.stringify(newReminder)
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
              <div className={reminder.isActive ? '' : 'line-through text-gray-500'}>
                <div className="font-medium">{reminder.title}</div>
                <div className="text-sm text-gray-600">
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