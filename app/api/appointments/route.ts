import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Appointment from '../../../models/Appointment';
import User from '../../../models/User';
import Service from '../../../models/Service';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const adminId = searchParams.get('adminId');

    const query: Record<string, unknown> = {};

    if (adminId) {
      const admin = await User.findById(adminId);
      if (admin?.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
      }
    } else if (userId) {
      query.userId = userId;
    } else {
      return NextResponse.json({ message: 'userId or adminId is required' }, { status: 400 });
    }

    const appointments = await Appointment.find(query)
      .populate('userId', 'name email')
      .populate('serviceId', 'name price duration category')
      .sort({ createdAt: -1 });

    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, serviceId, date, time } = body as {
      userId?: string;
      serviceId?: string;
      date?: string;
      time?: string;
    };

    if (!userId || !serviceId || !date || !time) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user || user.role !== 'customer') {
      return NextResponse.json({ message: 'Invalid customer' }, { status: 400 });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    const existing = await Appointment.findOne({
      date,
      time,
      status: { $in: ['pending', 'approved'] }
    });

    if (existing) {
      return NextResponse.json({ message: 'Slot not available' }, { status: 409 });
    }

    const appointment = await Appointment.create({
      userId,
      serviceId,
      date,
      time,
      status: 'pending'
    });

    return NextResponse.json({ message: 'Appointment booked', appointment });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}
