import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Appointment from '../../../../models/Appointment';
import User from '../../../../models/User';

export async function PATCH(request: Request, { params }: any) {
  try {
    const body = await request.json();
    const { status, userId, adminId } = body;
    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }
    await connectDB();
    const appointment = await Appointment.findById(params.id);
    if (!appointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    }
    if (status === 'cancelled') {
      if (!userId || appointment.userId.toString() !== userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
      }
      appointment.status = 'cancelled';
      await appointment.save();
      return NextResponse.json({ message: 'Appointment cancelled', appointment });
    }
    if (status === 'approved' || status === 'rejected') {
      const admin = await User.findById(adminId);
      if (admin?.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
      }
      appointment.status = status;
      await appointment.save();
      return NextResponse.json({ message: `Appointment ${status}`, appointment });
    }
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}
