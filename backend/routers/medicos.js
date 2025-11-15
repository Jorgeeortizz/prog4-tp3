import express from 'express';
import {db} from '../db.js';
import { body } from "express-validator";
import { validacionMedico, validarId, verificarValidaciones } from "../validaciones.js";
import { verificarAutenticacion } from "./auth.js";

const router = express.Router();

// mostrar medicos
router.get("/", verificarAutenticacion, async (req, res) => {
  try {
    const [rows] = await db.execute( "SELECT id, nombre, apellido, especialidad, matricula FROM medicos ORDER BY nombre, apellido"
    );

    res.json({ success: true, medicos: rows, });
  } catch (error) {
    console.error("Error en tabla medicos:", error);

    res.status(500).json({ success: false, error: "Error al mostrar médicos",
    });
  }
});

// buscar medico
router.get('/:id', verificarAutenticacion, validarId,  verificarValidaciones , async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM medicos WHERE id = ?", [req.params.id]);

  if (rows.length <= 0) {
    return res.status(404).json({ message: "Médico no registrado" });
  }
    res.json({ success: true, medico: rows[0], });

});

// registrar medico
router.post('/', verificarAutenticacion, validacionMedico, verificarValidaciones , async (req, res) => {
  const { nombre, apellido, especialidad, matricula } = req.body;

  // Verificar matricula
      const [existe] = await db.execute(
        "SELECT id FROM medicos WHERE matricula = ?",
        [matricula]
      );

      if (existe.length > 0) {
        return res.status(400).json({success: false, error: "matricula ya registrada",
        });
      }

  const [result] = await db.execute(
    "INSERT INTO medicos (nombre, apellido, especialidad, matricula) VALUES (?, ?, ?, ?)",
    [nombre, apellido, especialidad, matricula]
  );

  res.status(201).json({ id: result.insertId, message: "Médico creado" });
});



// editar médico
router.put("/:id", verificarAutenticacion, validarId, validacionMedico, verificarValidaciones, async (req, res) => {
  const { nombre, apellido, especialidad, matricula } = req.body;

  // Verificar si la matrícula ya existe
      const [existe] = await db.execute(  "SELECT id FROM medicos WHERE matricula = ?",
        [matricula]
      );

      if (existe.length > 0) {
        return res.status(400).json({success: false, error: "matricula ya registrada",
        });
      }
  

  const [result] = await db.execute( "UPDATE medicos SET nombre = ?, apellido = ?, especialidad = ?, matricula = ? WHERE id = ?",
    [nombre, apellido, especialidad, matricula, req.params.id] );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "medico no registrado" });
  }
  res.json({ message: "medico modificado" });
});

// Eliminar médico
router.delete('/:id', verificarAutenticacion, validarId, verificarValidaciones, async (req, res) => {
  const [result] = await db.execute("DELETE FROM medicos WHERE id = ?", [req.params.id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "medico no registrado" });
  }
  res.json({ message: "medico eliminado" });
});

export default router;