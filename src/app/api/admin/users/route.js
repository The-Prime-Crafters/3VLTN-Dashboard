import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { getAllDashboardUsers } from '@/lib/auth';

export async function GET() {
  try {
    // Only admins can view all dashboard users
    const { authorized, session } = await requireRole(['admin']);

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const users = await getAllDashboardUsers();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get dashboard users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

