import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { clearSession, SESSION_COOKIE } from '../../_db';

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  clearSession(sessionId);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });

  return response;
}
