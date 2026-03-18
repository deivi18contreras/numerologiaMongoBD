import Configuracion from "../models/configModel.js";

// Obtener la configuración actual (o crearla si no existe)
export const getConfig = async (req, res) => {
  try {
    let config = await Configuracion.findOne();
    if (!config) {
      config = new Configuracion();
      await config.save();
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener la configuración" });
  }
};

// Actualizar los parámetros globales
export const updateConfig = async (req, res) => {
  try {
    const { precioSuscripcion, moneda, modoMantenimiento, aiCreativity } = req.body;
    
    let config = await Configuracion.findOne();
    if (!config) config = new Configuracion();

    config.precioSuscripcion = precioSuscripcion ?? config.precioSuscripcion;
    config.moneda = moneda ?? config.moneda;
    config.modoMantenimiento = modoMantenimiento ?? config.modoMantenimiento;
    config.aiCreativity = aiCreativity ?? config.aiCreativity;

    await config.save();
    res.json({ msg: "Sistemas actualizados correctamente", config });
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar los protocolos" });
  }
};