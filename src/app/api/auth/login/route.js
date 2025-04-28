// src/app/api/auth/login/route.js
import { NextResponse }   from 'next/server';
import { connectDB }      from '@/lib/db';
import User               from '@/lib/models/User';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({ userId: user._id, email: user.email });
  return NextResponse.json({ token }, { status: 200 });
}
