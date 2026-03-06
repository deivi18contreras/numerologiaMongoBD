import {
  obtenerPagos,
  obtenerPagosUsuario,
  registrarPago,
  eliminarPago,
  verificarEstadoUsuario
} from "../models/pagosModel.js"
import Usuario from "../models/usuariosModel.js"; 
import { crearNotificacion } from "./notificacionesController.js";

export const getPagos = async (req, res) => {
// ... resto del código igual ...
  try {
    const pagos = await obtenerPagos();
    res.json(pagos);
  }catch(error){
    res.status(400).json({error: "Error al obtener los pagos" });
  }
};

export const getPagoUsuario = async (req, res) => {
  try{
    const pago = await obtenerPagosUsuario(req.params.id);

    if(!pago || pago.length ===0){
      return res.status(404).json({error: "Pago no encontrado" })
    }
    res.status(pago);
  }catch (error) {
    res.status(400).json({ error: "Error al obtener el pago" });
  }
}

export const postNuevoPago = async (req, res) => {
  try {
    const nuevoPago = await registrarPago(req.body);
    const {usuarioId} = req.body

    const usuarioActivo = await Usuario.findByIdAndUpdate(
      usuarioId,
      {estado : 1},
      {new: true}
    )

    // Notificar a los administradores sobre el pago
    try {
      const admins = await Usuario.find({ rol: "admin" });
      for (const admin of admins) {
        await crearNotificacion(
          admin._id,
          "Nuevo Intercambio Energético",
          `El alma ${usuarioActivo?.nombre} ha activado su plan Premium ($${req.body.monto}).`,
          "pago"
        );
      }
    } catch (notifError) {
      console.error("Error al notificar pago a admins:", notifError);
    }

   res.status(201).json({
    msg : "Pago registrado correctamente y cuenta activada",
    pago : nuevoPago,
    Usuario : {
      id : usuarioActivo?._id,
      nombre : usuarioActivo?.nombre,
      estado : usuarioActivo?.estado
    }
   });
   
  } catch (error) {
    res.status(400).json({ error: "Error al registrar el pago y activar usuario" });
  }
};

export const deletePago = async (req, res) => {
  try {
    const pagoEliminado = await eliminarPago(req.params.id);

    if (!pagoEliminado) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    res.json({ eliminado: pagoEliminado });
  } catch (error) {
    res.status(400).json({ error: "Error al eliminar el pago" });
  }
};

export const getEstadoUsuario = async (req, res) => {
  try {
    const estado = await verificarEstadoUsuario(req.params.id);
    res.json(estado);
  } catch (error) {
    res.status(400).json({ error: "Error al obtener estado del usuario" });
  }
};