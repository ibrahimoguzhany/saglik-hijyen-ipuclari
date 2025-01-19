import { NextRequest, NextResponse } from 'next/server';
import { verify, JwtPayload } from 'jsonwebtoken';
import { getUserById } from '@/app/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken extends JwtPayload {
  userId: number;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    // Token'ı doğrula
    let decoded: DecodedToken;
    try {
      decoded = verify(token, JWT_SECRET) as DecodedToken;
    } catch (error) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }
    
    // Kullanıcı bilgilerini getir
    const user = getUserById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Kullanıcı bilgileri alma hatası:', error);
    return NextResponse.json(
      { error: 'Oturum geçersiz' },
      { status: 401 }
    );
  }
} 