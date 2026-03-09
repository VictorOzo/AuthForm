import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getUserBySession, SESSION_COOKIE, toPublicUser } from '../../_db';

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  const user = getUserBySession(sessionId);

  if (!user) {
    return NextResponse.json({ ok: false, message: 'Unauthenticated' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user: toPublicUser(user) });
}
