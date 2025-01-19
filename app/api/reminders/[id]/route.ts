import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { updateReminder, deleteReminder } from '@/app/lib/db';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');

interface JWTPayload {
  userId: number;
  role: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (typeof data.isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const result = updateReminder(userId, parseInt(params.id), data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Update reminder error:', error);
    return NextResponse.json(
      { error: 'Hatırlatıcı güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const result = deleteReminder(userId, parseInt(params.id));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete reminder error:', error);
    return NextResponse.json(
      { error: 'Hatırlatıcı silinemedi' },
      { status: 500 }
    );
  }
} 