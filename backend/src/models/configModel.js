import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
  precioSuscripcion: { type: Number, default: 49.99 },
  moneda: { type: String, default: "COP" },
  modoMantenimiento: { type: Boolean, default: false },
  aiCreativity: { type: Number, default: 0.7 }, // Temperatura de la IA
  lastBackup: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Configuracion", configSchema);