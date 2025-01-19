import { NextRequest, NextResponse } from 'next/server';
import { createReminder, getReminders, updateReminder, deleteReminder } from '@/app/lib/db';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');

interface JWTPayload {
  userId: number;
}

async function authenticateUser(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload as unknown as JWTPayload;
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Yetkilendirme gerekli' },
      { status: 401 }
    );
  }

  try {
    const reminders = await getReminders(user.userId);
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json(
      { error: 'Hatırlatıcılar getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Yetkilendirme gerekli' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    if (!data.title || !data.time || !data.type) {
      return NextResponse.json(
        { error: 'Tüm alanlar gereklidir' },
        { status: 400 }
      );
    }

    const result = await createReminder(user.userId, data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Create reminder error:', error);
    return NextResponse.json(
      { error: 'Hatırlatıcı oluşturulamadı' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Yetkilendirme gerekli' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    if (typeof data.id !== 'number' || typeof data.isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const result = await updateReminder(user.userId, data.id, { isActive: data.isActive });
    if (!result) {
      return NextResponse.json(
        { error: 'Hatırlatıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update reminder error:', error);
    return NextResponse.json(
      { error: 'Hatırlatıcı güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Yetkilendirme gerekli' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'ID gerekli' },
        { status: 400 }
      );
    }

    const result = await deleteReminder(user.userId, parseInt(id));
    if (!result) {
      return NextResponse.json(
        { error: 'Hatırlatıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete reminder error:', error);
    return NextResponse.json(
      { error: 'Hatırlatıcı silinemedi' },
      { status: 500 }
    );
  }
} 