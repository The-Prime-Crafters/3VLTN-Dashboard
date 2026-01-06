import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createDashboardUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, fullName, role } = await request.json();

    // Validate input
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate role - only developer and support can self-register
    // Admin accounts must be created by existing admins or via script
    const validRoles = ['developer', 'support'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Only developer and support roles can be self-registered.' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await createDashboardUser(email, passwordHash, fullName, role);

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Your account is pending approval from an administrator.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isApproved: user.is_approved
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for duplicate email
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

