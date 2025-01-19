import { NextResponse } from 'next/server';
import { upsertHealthData, getHealthData } from '@/app/lib/db';

interface HealthDataRequest {
  userId: number;
  data: {
    steps: number;
    waterIntake: number;
    sleepHours: number;
    sleepQuality: number;
  };
}

export async function POST(request: Request) {
  try {
    const { userId, data } = await request.json() as HealthDataRequest;

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID\'si gerekli' },
        { status: 400 }
      );
    }

    // Veriyi kaydet
    await upsertHealthData(userId, data);

    // Güncel verileri getir
    const updatedData = await getHealthData(userId);

    return NextResponse.json({
      message: 'Veri başarıyla kaydedildi',
      data: updatedData
    });
  } catch (error) {
    console.error('Veri kaydetme hatası:', error);
    return NextResponse.json(
      { error: 'Veri kaydedilemedi' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');

    if (!userIdParam) {
      return NextResponse.json(
        { error: 'Kullanıcı ID\'si gerekli' },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı ID\'si' },
        { status: 400 }
      );
    }

    const healthData = await getHealthData(userId);

    return NextResponse.json({ data: healthData });
  } catch (error) {
    console.error('Veri alma hatası:', error);
    return NextResponse.json(
      { error: 'Veriler alınamadı' },
      { status: 500 }
    );
  }
} 