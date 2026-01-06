import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { approveUser, rejectUser } from '@/lib/auth';

export async function POST(request) {
  try {
    // Only admins can approve/reject users
    const { authorized, session } = await requireRole(['admin']);

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const user = await approveUser(userId, session.id);
      return NextResponse.json({
        success: true,
        message: 'User approved successfully',
        user
      });
    } else if (action === 'reject') {
      await rejectUser(userId);
      return NextResponse.json({
        success: true,
        message: 'User rejected successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Approve/reject user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

