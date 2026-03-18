import Configuracion from "../models/configModel.js";

export const verificarMantenimiento = async (req, res, next) => {
  try {
    const config = await Configuracion.findOne();
    
    // Si no hay config o el modo mantenimiento está apagado, pasamos directo
    if (!config || !config.modoMantenimiento) {
      return next();
    }

    // Si el usuario ya está autenticado (gracias al middleware validarJWT) 
    // y es admin, lo dejamos pasar siempre.
    if (req.usuario && req.usuario.rol === "admin") {
      return next();
    }

    // En cualquier otro caso (usuario no admin o no logueado), bloqueamos si es una ruta protegida
    // Permitimos siempre el login para que el admin no se bloquee a sí mismo afuera
    if (req.path.includes('/login')) {
      return next();
    }

    return res.status(503).json({
      msg: "EL COSMOS ESTÁ EN MANTENIMIENTO: Por favor, vuelve más tarde.",
      mantenimiento: true
    });
  } catch (error) {
    next();
  }
};