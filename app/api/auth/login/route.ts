import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@beardshop.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email.toLowerCase() === adminEmail.toLowerCase() && password === adminPassword) {
      let adminUser = await User.findOne({ email: adminEmail.toLowerCase() });

      if (!adminUser) {
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
        adminUser = await User.create({
          name: 'Admin',
          email: adminEmail.toLowerCase(),
          password: hashedAdminPassword,
          role: 'admin'
        });
      }

      return NextResponse.json({
        message: 'Login successful',
        user: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    return NextResponse.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}
