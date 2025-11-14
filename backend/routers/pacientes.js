import {Router} from "express";
import pool from "../db.js";
import { validacionPacientes, validarId, verificarValidaciones } from "../validaciones";
import { verificarAutenticacion } from "./auth.js";

const router = Router();


// mostrar pacientes 
router.get("/", verificarAutenticacion, async (req , res ) => {
    const [rows] = await pool.query("SELECT id, nombre, apellido, DNI, fechaNacimiento, obraSocial FROM pacientes ORDER BY nombre, apellido");
    res.json(rows);
});

// buscar paciente
router.get("/id", verificarAutenticacion, validarId, verificarValidaciones, async (req, res ) => {
    const [rows] = await pool.query("SELECT * FROM pacientes WHERE id = ? ", [req.params.id]);

    if(rows.length === 0){
        return res.status(404).json({message: "paciente no registrado"});
        }
        res.json(rows[0]);
});


// registrar paciente
router.post('/', verificarAutenticacion, validacionPacientes, async (req, res) => {
  const { nombre, apellido, dni, fechaNacimiento, obraSocial } = req.body;


  // Verificar dni
      const [existe] = await db.execute(
        "SELECT id FROM pacientes WHERE dni = ?",
        [dni]
      );

      if (existe.length > 0) {
        return res.status(400).json({ success: false, error: "Ya existe un paciente con ese DNI", });
      }

  const [result] = await pool.query(
    'INSERT INTO pacientes (nombre, apellido, dni, fechaNacimiento, obraSocial) VALUES (?, ?, ?, ?, ?)',
    [nombre, apellido, dni, fechaNacimiento, obraSocial]
  );

  res.status(201).json({ id: result.insertId, message: "paciente registrado" });

});


// Editar paciente 
router.put('/:id', verificarAutenticacion, validarId, validacionPacientes, verificarValidaciones, async (req, res) => {
  
  const { nombre, apellido, dni, fechaNacimiento, obraSocial } = req.body;

  const [result] = await pool.query(
    "UPDATE pacientes SET nombre = ?, apellido = ?, dni = ?, fechaNacimiento = ?, obraSocial = ? WHERE id = ?",
    [nombre, apellido, dni, fechaNacimiento, obraSocial, req.params.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "paciente no registrado" });
  }
  res.json({ message: "paciente modificado" });

});

//eliminar paciente
router.delete('/:id', verificarAutenticacion, validarId, verificarValidaciones, async (req, res) => {
  const [result] = await pool.query("DELETE FROM pacientes WHERE id = ?", [req.params.id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "paciente no registrado" });
  }
  res.json({ message: "paciente eliminado" });
});