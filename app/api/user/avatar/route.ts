import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession, SESSION_COOKIE, toPublicUser, updateUser } from '../../_db';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  const user = getUserBySession(sessionId);

  if (!user) {
    return NextResponse.json({ ok: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const formData = await request.formData();
  const avatar = formData.get('avatar');
  if (!(avatar instanceof File)) {
    return NextResponse.json({ ok: false, message: 'Avatar file is required.' }, { status: 400 });
  }

  const avatarUrl = `/avatars/demo.svg?ts=${Date.now()}`;
  const updated = updateUser(user.id, { avatarUrl });

  return NextResponse.json({
    ok: true,
    avatarUrl,
    user: updated ? toPublicUser(updated) : undefined,
  });
}
