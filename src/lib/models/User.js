// src/lib/models/User.js
import mongoose from 'mongoose';

const TratamientoSchema = new mongoose.Schema({
  nombre: String,
  dosis: String,
  frecuencia: String,
  ultimaCompra: String,
  farmacia: String,
  historialPrecios: [Number],
  tendencia: String,
  notas: String // comentarios adicionales
});

const UserSchema = new mongoose.Schema({
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true }, // hashed
  resetToken:       String,
  resetTokenExpiry: Date,
  telefono:         String,
  direccion:        String,
  tratamientos:     [TratamientoSchema]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
