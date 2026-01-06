import { NextResponse } from 'next/server';
import { getUsers, getUserCount } from '../../../lib/users';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const subsTier = searchParams.get('subsTier') || 'all';
    
    const offset = (page - 1) * limit;
    
    const [users, totalCount] = await Promise.all([
      getUsers(limit, offset, search, status, subsTier),
      getUserCount(search, status, subsTier)
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
