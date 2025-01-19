import { NextRequest, NextResponse } from 'next/server';
import { getTips, createTip } from '@/app/lib/db';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

interface JWTPayload {
  userId: number;
  role: string;
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

export async function GET() {
  try {
    const tips = await getTips();
    return NextResponse.json(tips);
  } catch (error) {
    console.error('Get tips error:', error);
    return NextResponse.json(
      { error: 'İpuçları getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Yetkilendirme gerekli' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    if (!data.title || !data.content || !data.category || !data.date) {
      return NextResponse.json(
        { error: 'Tüm alanlar gereklidir' },
        { status: 400 }
      );
    }

    const tip = await createTip(data);
    return NextResponse.json(tip);
  } catch (error) {
    console.error('Create tip error:', error);
    return NextResponse.json(
      { error: 'İpucu oluşturulamadı' },
      { status: 500 }
    );
  }
} 