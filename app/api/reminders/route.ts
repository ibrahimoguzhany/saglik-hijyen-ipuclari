import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getReminders, createReminder } from '@/app/lib/db';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');

interface JWTPayload {
  userId: number;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('authToken');

    if (!authToken?.value) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    const verified = await jwtVerify(authToken.value, secret);
    const { userId } = verified.payload as unknown as JWTPayload;

    const reminders = getReminders(userId);
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Reminders error:', error);
    return NextResponse.json(
      { error: 'Hatırlatıcılar getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('authToken');

    if (!authToken?.value) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    const verified = await jwtVerify(authToken.value, secret);
    const { userId } = verified.payload as unknown as JWTPayload;

    const data = await request.json();
    console.log('Received reminder data:', data);
    
    if (!data.title || !data.time || !data.type) {
      return NextResponse.json(
        { error: 'Eksik bilgi' },
        { status: 400 }
      );
    }

    try {
      console.log('Creating reminder for user:', userId, 'with data:', data);
      const result = createReminder(userId, {
        title: data.title,
        time: data.time,
        type: data.type,
        isActive: data.isActive
      });
      console.log('Reminder creation result:', result);

      return NextResponse.json({
        id: result.lastInsertRowid,
        title: data.title,
        time: data.time,
        type: data.type,
        isActive: true
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: `Veritabanı hatası: ${dbError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Create reminder error:', error);
    return NextResponse.json(
      { error: `Hatırlatıcı oluşturulamadı: ${error.message}` },
      { status: 500 }
    );
  }
} 