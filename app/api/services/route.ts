import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Service from '../../../models/Service';
import User from '../../../models/User';

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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    const query: Record<string, unknown> = {};

    if (search.trim()) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category.trim()) {
      query.category = category;
    }

    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    const services = await Service.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const service = await Service.create({
      name,
      price: Number(price),
      duration: Number(duration),
      category,
      description
    });

    return NextResponse.json({ message: 'Service added', service });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as Error).message }, { status: 500 });
  }
}
