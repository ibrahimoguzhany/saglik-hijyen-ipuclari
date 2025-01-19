import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getUserById } from '@/app/lib/db';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');

interface JWTPayload {
  userId: number;
}

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('authToken')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    // Token'ı doğrula
    const verified = await jwtVerify(authToken, secret);
    const { userId } = verified.payload as unknown as JWTPayload;
    
    // Kullanıcı bilgilerini veritabanından al
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Yetkilendirme başarısız' },
      { status: 401 }
    );
  }
} 