// src/lib/db.js
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('Please define MONGO_URI in .env.local');
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const MONGODB_URI = "mongodb+srv://antoniasoliscc:4p4IuL5atCGLcq90@cluster0.mbzwww1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
