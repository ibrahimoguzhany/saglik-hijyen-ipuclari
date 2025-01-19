import { NextRequest, NextResponse } from 'next/server';
import { getTipById, updateTip, deleteTip } from '@/app/lib/db';
import { jwtVerify } from 'jose';

interface JWTPayload {
  userId: number;
  role: string;
}

async function authenticateUser(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  if (!token) {
    return null;
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set');
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload as unknown as JWTPayload;
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Yetkilendirme gerekli' },
      { status: 401 }
    );
  }

  try {
    const tip = await getTipById(parseInt(params.id));
    if (!tip) {
      return NextResponse.json(
        { error: 'İpucu bulunamadı' },
        { status: 404 }
      );
    }
    return NextResponse.json(tip);
  } catch (error) {
    console.error('Get tip error:', error);
    return NextResponse.json(
      { error: 'İpucu getirilemedi' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const tip = await updateTip(parseInt(params.id), data);
    if (!tip) {
      return NextResponse.json(
        { error: 'İpucu bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(tip);
  } catch (error) {
    console.error('Update tip error:', error);
    return NextResponse.json(
      { error: 'İpucu güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Yetkilendirme gerekli' },
      { status: 401 }
    );
  }

  try {
    const success = await deleteTip(parseInt(params.id));
    if (!success) {
      return NextResponse.json(
        { error: 'İpucu bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'İpucu başarıyla silindi' });
  } catch (error) {
    console.error('Delete tip error:', error);
    return NextResponse.json(
      { error: 'İpucu silinemedi' },
      { status: 500 }
    );
  }
} 