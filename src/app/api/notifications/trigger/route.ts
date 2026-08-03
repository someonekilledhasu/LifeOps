import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';
import { APP_USER } from '@/lib/workspace';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@lifeops.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function POST(request: Request) {
  try {
    const { title, body, url } = await request.json();
    const userId = APP_USER.id;

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
    }

    const payload = JSON.stringify({
      title: title || 'LifeOps Reminder',
      body: body || 'Time to log your expenses and check your score!',
      url: url || '/'
    });

    const sendPromises = subscriptions.map(sub => 
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        },
        payload
      ).catch(e => {
        if (e.statusCode === 410 || e.statusCode === 404) {
          // Subscription has expired or is no longer valid
          return prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        console.error('Error sending push notification:', e);
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, count: subscriptions.length });
  } catch (error) {
    console.error('Error triggering notifications:', error);
    return NextResponse.json({ error: 'Failed to trigger notifications' }, { status: 500 });
  }
}
