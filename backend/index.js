import express from "express";
import { conectarDB } from "./db.js";

import RouterMedicos from "./routers/medicos.js";
import RouterPacientes from "./routers/pacientes.js";
import RouterTurnos from "./routers/turnos.js";
import RouterUsuarios from "./routers/usuarios.js";

import RouterAuth, { authConfig } from "./routers/auth.js";
import cors from "cors";




saludar();




conectarDB();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
authConfig();


app.use("/medicos", RouterMedicos);
app.use('/pacientes', RouterPacientes); 
app.use("/turnos", RouterTurnos);
app.use("/auths", RouterUsuarios);
app.use("/auth", RouterAuth);





app.listen(PORT, () => {
  console.log(`puerto http://localhost:${PORT} funcionando`);

});
