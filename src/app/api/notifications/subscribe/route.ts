import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { APP_USER } from '@/lib/workspace';

export async function POST(request: Request) {
  try {
    const { subscription } = await request.json();
    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription' }, { status: 400 });
    }

    const userId = APP_USER.id;
    const { endpoint, keys } = subscription;
    
    // check if this endpoint already exists to avoid duplicates
    const existing = await prisma.pushSubscription.findFirst({
      where: { endpoint }
    });

    if (existing) {
      if (existing.userId !== userId) {
        // update user id if it changed
        await prisma.pushSubscription.update({
          where: { id: existing.id },
          data: { userId }
        });
      }
      return NextResponse.json({ success: true, message: 'Already subscribed' });
    }

    // Save to database
    await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}
