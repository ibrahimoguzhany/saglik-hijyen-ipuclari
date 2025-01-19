import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    message: 'Çıkış başarılı'
  });

  // Auth token'ı sil
  response.cookies.delete('authToken');

  return response;
} 