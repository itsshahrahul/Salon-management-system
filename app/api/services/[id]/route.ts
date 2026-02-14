import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Service from '../../../../models/Service';
import User from '../../../../models/User';

type Params = { params: { id: string } };

type ServicePayload = {
  adminId?: string;
  name?: string;
  price?: number | string;
  duration?: number | string;
  category?: string;
  description?: string;
};

async function isAdmin(adminId?: string): Promise<boolean> {
  if (!adminId) return false;
  const admin = await User.findById(adminId);
  return admin?.role === 'admin';
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const service = await Service.findById(params.id);

    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = (await request.json()) as ServicePayload;
    const { adminId, name, price, duration, category, description } = body;

    if (!name || !price || !duration || !category || !description) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connectDB();

    const allowed = await isAdmin(adminId);
    if (!allowed) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const service = await Service.findByIdAndUpdate(
      params.id,
      {
        name,
        price: Number(price),
        duration: Number(duration),
        category,
        description
      },
      { new: true }
    );

    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Service updated', service });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const body = (await request.json()) as { adminId?: string };
    const { adminId } = body;

    await connectDB();

    const allowed = await isAdmin(adminId);
    if (!allowed) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const service = await Service.findByIdAndDelete(params.id);

    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Service deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}
