// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { connectDB }    from '@/lib/db';
import User             from '@/lib/models/User';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await connectDB();
  if (await User.findOne({ email })) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  const user   = await User.create({ email, password: hashed });
  const token = signToken({ userId: user._id, email: user.email });
  return NextResponse.json({ token }, { status: 201 });
}
