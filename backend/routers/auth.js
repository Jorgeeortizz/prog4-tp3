import express from "express";
import { db } from "../db.js";
import { validarId, verificarValidaciones } from "../validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

export function authConfig() {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new Strategy(jwtOptions, async (payload, done) => {
      try {
        const [usuarios] = await db.execute("SELECT * FROM usuarios WHERE id = ?", [payload.userId]);
        if (usuarios.length === 0) return done(null, false);
        return done(null, usuarios[0]);
      } catch (error) {
        return done(error, false);
      }
    })
  );
}

export const verificarAutenticacion = passport.authenticate("jwt", { session: false });

// Registro
router.post(
  "/register",
  body("nombre").notEmpty().isAlphanumeric("es-ES").isLength({ max: 16 }),
  body("email").isEmail().normalizeEmail(),
  body("contraseña").isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { nombre, email, contraseña } = req.body;

      const [existeUsuario] = await db.execute("SELECT id FROM usuarios WHERE email = ?", [email]);
      if (existeUsuario.length > 0) {
        return res.status(400).json({ success: false, error: "usuario ya registrado" });
      }

      const hashContraseña = await bcrypt.hash(contraseña, 12);

      const [result] = await db.execute(
        "INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)",
        [nombre, email, hashContraseña]
      );

      const payload = { userId: result.insertId, email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

      res.status(201).json({
        success: true,
        token,
        message: "Usuario registrado",
        username: { id: result.insertId, nombre, email },
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ success: false, error: "Error al registrar usuario" });
    }
  }
);

// Login
router.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("contraseña").notEmpty(),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { email, contraseña } = req.body;

      const [usuarios] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
      if (usuarios.length === 0) {
        return res.status(401).json({ success: false, error: "usuario inválido" });
      }

      const usuario = usuarios[0];
      const contraseñaCompared = await bcrypt.compare(contraseña, usuario.contraseña);
      if (!contraseñaCompared) {
        return res.status(401).json({ success: false, error: "contraseña inválida" });
      }

      const payload = { userId: usuario.id, email: usuario.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

      res.json({
        success: true,
        token,
        username: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
      });
    } catch (error) {
      console.error("Login incorrecto:", error);
      res.status(500).json({ success: false, error: "sesión incorrecta" });
    }
  }
);

export default router;