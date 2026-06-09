import { NextResponse } from 'next/server';
import { upsertCustomerFromAuth0Profile } from '@/lib/auth0SyncUser';

export async function POST(request: Request) {
  try {
    const { user, secret } = await request.json();

    if (secret !== process.env.INTERNAL_SYNC_SECRET) {
      console.error('[Sync Route] Unauthorized sync attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user || !user.sub || !user.email) {
      return NextResponse.json({ error: 'Missing user data' }, { status: 400 });
    }

    console.log(`[Sync Route] Synchronizing user: ${user.email} (sub: ${user.sub})`);

    const synced = await upsertCustomerFromAuth0Profile({
      sub: user.sub,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
    });

    console.log(
      `[Sync Route] Successfully synced user: ${synced.email} with role: ${synced.role}`
    );

    return NextResponse.json({
      success: true,
      user: synced,
    });
  } catch (error) {
    console.error('[Sync Route] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
