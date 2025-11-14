import {Router} from "express";
import pool from "../db.js";
import { verificarValidaciones } from "../validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

const router = Router();

export function authConfig() {
  // configuracion de passport-jwt
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  // Creo estrategia jwt
  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      
      next(null, payload);
    })
  );
}

export const verificarAutenticacion = passport.authenticate("jwt", {
  session: false,
});

// Ruta de registro
router.post(
  "/login",
  body("nombre").notEmpty().isAlphanumeric("es-ES").isLength({ max: 16 }),
  body("email").isEmail().normalizeEmail(),
  body("contraseña").isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  }),
  verificarValidaciones, async (req, res) => {
    try {
      const { nombre, email, contraseña } = req.body;

      // Verificacion de usuario
      const [existeUsuario] = await pool.query(
        "SELECT id FROM usuarios WHERE email = ?",
        [email]
      );

      if (existeUsuario.length > 0) {
        return res.status(400).json({ success: false, error: "usuario ya registrado " });
      }

      // hash contraseña
      const hashedPassword = await bcrypt.hash(contraseña, 12);

  

      // Insertar usuario
      const [result] = await pool.query(
        "INSERT INTO usuario (nombre, email, contraseña) VALUES (?, ?, ?)",
        [nombre, email, contraseña]
      );

      // Generar token jwt
      const payload = { userId: result.insertId, email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      res.status(201).json({ success: true, token, message: "Usuario registrado", username: { id: result.insertId, nombre, email },

      });

    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ success: false, error: "Error al registrar usuario",

      });
    }
  }
);

// Ruta de login
router.post( "/login", body("email").isEmail().normalizeEmail(), body("contraseña").notEmpty(),
verificarValidaciones, async (req, res) => {
    try { const { email, contraseña } = req.body;

      // Consultar por el usuario
      const [usuarios] = await pool.query(
        "SELECT * FROM usuario WHERE email = ?",
        [email]
      );

      if (usuarios.length === 0) {
        return res.status(401).json({
          success: false,
          error: "usuario inválidas",
        });
      }

      // comparar contraseña
      const usuario = usuarios[0];
      const contraseñaCompared = await bcrypt.compare(contraseña, usuario.contraseña);

      if (!contraseñaCompared) {
        return res.status(401).json({
          success: false,
          error: "contraseña inválidas",
        });
      }

      //generar JWT
      const payload = { userId: usuario.id, email: usuario.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      // Devolver token y datos del usuario - sin la contraseña
      res.json({ success: true,token, username: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, },

      });

    } catch (error) { console.error("Login incorrecto :", error);

      res.status(500).json({ success: false, error: "sesion incorrecta",

      });
    }
  }
);

export default router;