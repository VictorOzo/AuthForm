import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    ok: true,
    avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=AuthForm',
  });
}
