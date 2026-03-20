import {
  lecturaPrincipal,
  lecturasdeUnUsuario,
  lecturaPorId,
} from "../models/lecturasModel.js";
import { procesarGeneracionLecturaDiaria } from "../helpers/lecturas.js";

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
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

// Calcula número de camino de vida
function calcularCaminoDeVida(fecha_nacimiento) {
  const fecha = new Date(fecha_nacimiento);
  const dia = fecha.getUTCDate();
  const mes = fecha.getUTCMonth() + 1;
  const año = fecha.getUTCFullYear();

  const reducir = (num) => {
    if ([11, 22, 33].includes(num)) return num;
    while (num > 9) {
      num = num
        .toString()
        .split("")
        .reduce((a, b) => a + parseInt(b), 0);
    }
    return num;
  };

  const diaReducido = reducir(dia);
  const mesReducido = reducir(mes);
  const añoReducido = reducir(
    año
      .toString()
      .split("")
      .reduce((a, b) => a + parseInt(b), 0),
  );

  const suma = diaReducido + mesReducido + añoReducido;
  return reducir(suma);
}


export async function generarlecturaPrincipal(req, res) {
  const { usuarioId } = req.params;
  console.log("🔮 Petición recibida para Esencia Astral del usuario:", usuarioId);
  try {
    const resultado = await lecturaPrincipal(usuarioId);

    if (!resultado.usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    if (resultado.lecturaExistente) {
      return res.status(200).json({
        msg: "Lectura principal ya generada",
        id: resultado.lecturaExistente.id,
        contenido: JSON.parse(resultado.lecturaExistente.id ? resultado.lecturaExistente.contenido : "{}"),
      });
    }

    const numeroCamino = calcularCaminoDeVida(
      resultado.usuario.fechanacimiento,
    );

    const prompt = `
      Eres un numerólogo místico y profesional. 
      Instrucciones:
      1. Usa este número de Camino de Vida: ${numeroCamino}.
      2. Escribe TODO el contenido en ESPAÑOL.
      3. Da una descripción breve y muy acertada.
      4. Menciona 3 talentos ocultos en un array.
      5. En 'mensajeEspiritual', da una revelación impactante.
      Devuelve ÚNICAMENTE un JSON válido con este formato: 
      { "nombre": "${resultado.usuario.nombre}", "numeroCamino": ${numeroCamino}, "descripcion": "...", "talentos": ["...", "...", "..."], "mensajeEspiritual": "..." }
    `;

    const contenidoJSON = await respuestaIA(prompt);
    if (!contenidoJSON) {
      return res.status(500).json({ msg: "El oráculo no responde en este momento. Intenta de nuevo." });
    }

    const idLectura = await resultado.crear(
      usuarioId,
      "principal",
      JSON.stringify(contenidoJSON),
    );

    console.log("✅ Lectura principal creada con éxito para:", usuarioId);

    res.status(201).json({
      msg: "Tu esencia ha sido revelada.",
      id: idLectura,
      contenido: contenidoJSON,
    });
  } catch (error) {
    console.error("🔥 Error en generarlecturaPrincipal:", error);
    res.status(500).json({ msg: "Error al generar la lectura mística" });
  }
}

export async function generarlecturadiaria(req, res) {
  try {
    const { usuarioId } = req.params;
    const resultado = await procesarGeneracionLecturaDiaria(usuarioId);

    if (resultado.error) {
      return res.status(resultado.status).json({ msg: resultado.error });
    }

    res.status(resultado.yaExistia ? 200 : 201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error interno" });
  }
}

export async function obtenerlecturasdeunusuario(req, res) {
  try {
    const { usuarioId } = req.params;
    const lecturas = await lecturasdeUnUsuario(usuarioId);

    if (!lecturas.length)
      return res.status(404).json({ msg: "No hay lecturas" });

    res.status(200).json({
      msg: "Lecturas del usuario",
      lecturas,
      numeroLecturas: lecturas.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error interno" });
  }
}

export async function obtenerlecturaporid(req, res) {
  try {
    const { id } = req.params;
    const lectura = await lecturaPorId(id);

    if (!lectura) return res.status(404).json({ msg: "Lectura no encontrada" });

    let contenidoParseado = lectura.contenido;
    try {
      contenidoParseado =
        typeof lectura.contenido === "string"
          ? JSON.parse(lectura.contenido)
          : lectura.contenido;
    } catch { }

    res.status(200).json({
      msg: "Lectura encontrada",
      lectura: { ...lectura.toObject(), contenido: contenidoParseado },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error interno" });
  }
}
