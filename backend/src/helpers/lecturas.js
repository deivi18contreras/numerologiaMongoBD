import Lectura, { lecturaDiaria } from "../models/lecturasModel.js";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import "dotenv/config";
import { crearNotificacion } from "../controllers/notificacionesController.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
  safetySettings
});

async function respuestaIA(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("❌ Error al consultar Gemini:", error);
    return null;
  }
}

export const validarLecturaPrincipal = async (usuarioId) => {
  const existe = await Lectura.findOne({
    usuarioId,
    tipo: "principal"
  });

  if (existe) {
    throw new Error("El usuario ya tiene una lectura principal");
  }
};

export async function procesarGeneracionLecturaDiaria(usuarioId) {
  try {
    const resultado = await lecturaDiaria(usuarioId);

    if (!resultado.usuario) return { error: "Usuario no encontrado", status: 404 };

    if (resultado.usuario.estado !== 1) {
      return { error: "Acceso denegado. Suscripción inactiva.", status: 403 };
    }

    const lecturaP = await resultado.obtenerLecturaPrincipal(usuarioId);
    if (!lecturaP) return { error: "Primero genera tu lectura principal gratuita.", status: 400 };

    const lecturaHoy = await resultado.obtenerLecturaDiariaHoy(usuarioId);
    if (lecturaHoy) {
      return {
        msg: "Tu guía de hoy ya está disponible",
        id: lecturaHoy.id,
        contenido: JSON.parse(lecturaHoy.contenido),
        yaExistia: true
      };
    }

    const prompt = `
      Eres un numerólogo experto. Genera una lectura diaria mística en ESPAÑOL.
      Base de personalidad: ${lecturaP.contenido}.
      Fecha: ${new Date().toLocaleDateString('es-ES')}.
      Instrucciones:
      1. Sé profundo y espiritual.
      2. Devuelve ÚNICAMENTE un JSON válido con este formato:
      { "fecha": "${new Date().toLocaleDateString('es-ES')}", "mensaje": "...", "energiaDelDia": "Un título BREVE (máximo 3 palabras)", "consejo": "..." }
    `;

    const contenidoJSON = await respuestaIA(prompt);
    if (!contenidoJSON) return { error: "El oráculo está fuera de línea. Intenta más tarde.", status: 500 };

    const idLectura = await resultado.crear(
      usuarioId,
      "diaria",
      JSON.stringify(contenidoJSON)
    );

    await crearNotificacion(
      usuarioId,
      "Nueva Alineación Cósmica",
      "Tu lectura diaria está lista. Descubre lo que el universo tiene preparado para ti hoy.",
      "lectura"
    );

    return {
      msg: "Lectura diaria generada con éxito",
      id: idLectura,
      contenido: contenidoJSON,
      yaExistia: false
    };
  } catch (error) {
    console.error("Error en procesarGeneracionLecturaDiaria:", error);
    throw error;
  }
}
