import express from "express"
import cors from "cors"
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from "url";

import { conectarMongo } from "./src/database/cnx-mongo.js"
import usuariosRouter from "./src/routes/usuariosRouter.js"
import lecturasRouter from "./src/routes/lecturasRouter.js"
import pagosRouter from "./src/routes/pagosRouter.js"
import loginRouter from "./src/routes/loginRouter.js"
import notificacionesRouter from "./src/routes/notificacionesRouter.js"
import { configurarTareasProgramadas } from "./src/helpers/cron.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
conectarMongo();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "*", // Permite tu Netlify o todo si no está definido
  optionsSuccessStatus: 200
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use("/api/usuario", usuariosRouter);
app.use("/api/login", loginRouter);
app.use("/api/lectura", lecturasRouter);
app.use("/api/pagos", pagosRouter);
app.use("/api/notificaciones", notificacionesRouter);

// Servir archivos estáticos de forma relativa (si decides subir el frontend junto al backend)
// O simplemente desactiva esto si el frontend está en otro hosting
const frontendPath = path.join(__dirname, "public"); 
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.send("Backend de Numerología funcionando correctamente.");
});

// Inicializar tareas programadas (Cron jobs)
configurarTareasProgramadas();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`👂 Servidor escuchando en el puerto ${PORT}`);
});