import { Router } from "express";
import { getConfig, updateConfig } from "../controllers/configController.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { admiRol } from "../middlewares/validar-rol.js";

const router = Router();

// Solo los administradores pueden ver y cambiar la configuración global
router.get("/", [validarJWT, admiRol], getConfig);
router.put("/", [validarJWT, admiRol], updateConfig);

export default router;