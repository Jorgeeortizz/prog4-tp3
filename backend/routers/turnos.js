import express from "express";
import {db} from "../db.js";
import { validarId, verificarValidaciones, validacionTurnos } from "../validaciones.js";
import {verificarAutenticacion } from './auth.js';

const router = express.Router();


router.get('/', verificarAutenticacion, async (req, res) => {
    let sql = `
        SELECT t.id, t.fecha, t.hora, t.estado, t.observaciones,
            p.id as paciente_id, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
            m.id as medico_id, m.nombre as medico_nombre, m.apellido as medico_apellido, m.especialidad
            FROM turnos t
            JOIN pacientes p ON t.paciente_id = p.id
            JOIN medicos m ON t.medico_id = m.id
`;

    const [rows] = await db.execute(sql);
    res.json({ success: true, data: rows });
});


// turnos pacientes
router.get('/pacientes/:id/turnos', verificarAutenticacion,validarId, verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM turnos WHERE paciente_id = ?", [id]);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "paciente no registrado" });
    }
    res.json({ success: true, data: rows });
});


// turnos medicos
router.get('/medicos/:id/turnos',verificarAutenticacion, validarId, verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM turnos WHERE medico_id = ?", [id]);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "El médico no registrado" });
    }
    res.json({ success: true, data: rows });
});


// buscar turno por id
router.get('/:id',verificarAutenticacion, validarId, verificarValidaciones, async (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT t.id, t.fecha, t.hora, t.estado, t.observaciones,
            p.id AS paciente_id, 
            p.nombre AS paciente_nombre, 
            p.apellido AS paciente_apellido,
            m.id AS medico_id, 
            m.nombre AS medico_nombre, 
            m.apellido AS medico_apellido,
            m.especialidad
        FROM turnos t
        JOIN pacientes p ON t.paciente_id = p.id
        JOIN medicos m ON t.medico_id = m.id
        WHERE t.id = ?
    `;

    const [rows] = await db.execute(sql, [id]);

    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Turno registrado" });
    }

    res.json({ success: true, data: rows[0] });
});

router.post("/", verificarAutenticacion, validacionTurnos, verificarValidaciones, async (req, res) => {
    const { paciente_id, medico_id, fecha, hora, estado, observaciones } = req.body;

    const [result] = await db.execute(
        "INSERT INTO turnos (paciente_id, medico_id, fecha, hora, estado, observaciones) VALUES (?,?,?,?,?,?)",
        [paciente_id, medico_id, fecha, hora, estado, observaciones]
    );

    res.status(201).json({
        success: true,
        data: { id: result.insertId, paciente_id, medico_id, fecha, hora, estado, observaciones },
    });
});


router.put( "/:id",verificarAutenticacion, validarId, validacionTurnos,  verificarValidaciones, async (req, res) => {
        const { id } = req.params;
        const { paciente_id, medico_id, fecha, hora, estado, observaciones } = req.body;

        await db.execute(
            "UPDATE turnos SET paciente_id=?, medico_id=?, fecha=?, hora=?, estado=?, observaciones=? WHERE id=?",
            [paciente_id, medico_id, fecha, hora, estado, observaciones, id]
        );

        res.json({
            success: true,
            data: { id: Number(id), paciente_id, medico_id, fecha, hora, estado, observaciones }
        });
    }
);

router.delete("/:id", verificarAutenticacion, validarId, verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    await db.execute("DELETE FROM turnos WHERE id=?", [id]);
    res.json({ success: true, message: "Turno eliminado" });
});

export default router;