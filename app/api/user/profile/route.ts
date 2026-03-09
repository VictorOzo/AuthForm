import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession, SESSION_COOKIE, toPublicUser, updateUser } from '../../_db';

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  const user = getUserBySession(sessionId);

  if (!user) {
    return NextResponse.json({ ok: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    firstName?: string;
    lastName?: string;
    username?: string;
  };

  const updated = updateUser(user.id, {
    firstName: payload.firstName?.trim() || user.firstName,
    lastName: payload.lastName?.trim() || user.lastName,
    username: payload.username?.trim() || user.username,
  });

  if (!updated) {
    return NextResponse.json({ ok: false, message: 'Unable to update profile.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user: toPublicUser(updated) });
}
