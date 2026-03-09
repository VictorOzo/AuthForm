import { NextRequest, NextResponse } from 'next/server';
import { createSessionForUser, getOrCreateUserByEmail, SESSION_COOKIE, toPublicUser } from '../../_db';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ ok: false, message: 'Email is required.' }, { status: 400 });
  }

  const user = getOrCreateUserByEmail(email);
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Unable to log in user.' }, { status: 500 });
  }

  const sessionId = createSessionForUser(user.id);
  const response = NextResponse.json({ ok: true, user: toPublicUser(user) });
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
