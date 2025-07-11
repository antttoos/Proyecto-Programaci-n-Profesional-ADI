import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req) {
  await connectDB();
  const { email, telefono, direccion, tratamientos } = await req.json();

  // Actualiza o crea el usuario por email
  const user = await User.findOneAndUpdate(
    { email },
    { telefono, direccion, tratamientos },
    { upsert: true, new: true }
  );

  return Response.json({ success: true, user });
}
