import { NextResponse } from 'next/server';
import { getPlanStats } from '../../../../lib/users';

export async function GET() {
  try {
    const stats = await getPlanStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching plan stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan stats' },
      { status: 500 }
    );
  }
}
