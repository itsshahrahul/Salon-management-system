import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Service from '../../../../models/Service';
import Appointment from '../../../../models/Appointment';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');

    if (!adminId) {
      return NextResponse.json({ message: 'adminId is required' }, { status: 400 });
    }

    const admin = await User.findById(adminId);
    if (admin?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const totalServices = await Service.countDocuments();
    const pendingBookings = await Appointment.countDocuments({ status: 'pending' });
    const approvedBookings = await Appointment.countDocuments({ status: 'approved' });

    return NextResponse.json({ totalServices, pendingBookings, approvedBookings });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}
