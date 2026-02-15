import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json({ message: 'Email and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@beardshop.com').toLowerCase();
    if (email.toLowerCase() === adminEmail) {
      return NextResponse.json(
        { message: 'Admin password is controlled by ADMIN_PASSWORD in .env.local' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}
