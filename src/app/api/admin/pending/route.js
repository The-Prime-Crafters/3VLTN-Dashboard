import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { getPendingUsers } from '@/lib/auth';

export async function GET() {
  try {
    // Only admins can view pending users
    const { authorized } = await requireRole(['admin']);

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const pendingUsers = await getPendingUsers();

    return NextResponse.json({ pendingUsers });
  } catch (error) {
    console.error('Get pending users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

