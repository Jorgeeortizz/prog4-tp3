import express from "express";
import {db} from "..db.js";
import { validarId, verificarValidaciones, validacionUsuarios } from "../validaciones.js";
import { verificarAutenticacion } from "./auth.js";
import bcrypt from "bcrypt";


const router = express.Router();


router.get("/", verificarAutenticacion, async (req, res) => {

        const [rows] = await db.execute("SELECT * FROM usuarios");

        res.json({success: true,  usuarios: rows.map((u) => ({ ...u, password_hash: undefined })),

        });
    }
);



router.get("/:id",verificarAutenticacion, validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [existe] = await db.execute("SELECT * FROM usuarios WHERE id=?", [id]);

    if (existe.length === 0) {
        return res.status(404).json({ success: false, error: "Usuario no registrado" });
    }


    const [rows] = await db.execute( "SELECT id, nombre, email FROM usuarios WHERE id=?",
        [id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
});


router.post( "/",verificarAutenticacion, validacionUsuarios, verificarValidaciones, async (req, res) => {
        const { nombre, contraseña, email } = req.body;

        const hashContraseña = await bcrypt.hash(contraseña, 12);

        const [result] = await db.execute( "INSERT INTO usuarios (nombre, email, contraseña) VALUES (?,?,?)",
            [nombre, email, hashContraseña]
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, nombre, email },
        });
    }
);



router.put("/:id", verificarAutenticacion, validarId,validacionUsuarios,verificarValidaciones,async (req, res) => {
        const { nombre, contraseña, email } = req.body;
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM usuarios WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Usuario no registrado" });
        }

        const hashContraseña = password ? await bcrypt.hash(password, 12) : usuario.password_hash;

        await db.execute( "UPDATE usuarios SET nombre=?, contraseña=?, email=? WHERE id=?",
            [nombre, hashContraseña, email, id]
        );

        return res.status(200).json({
            success: true,
            data: { id: Number(id), nombre, email },
        });

    });


    router.delete("/:id", verificarAutenticacion, validarId, verificarValidaciones, async (req, res) => {
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM usuarios WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Usuario no registrado" });
        }

        await db.execute("DELETE FROM usuarios WHERE id=?", [id]);

        res.json({ success: true, message: "Usuario eliminado" });
    });


export default router;