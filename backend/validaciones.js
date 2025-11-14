import { param, body, validationResult } from "express-validator";

export const validarId = param("id").isInt({ min: 1 });

const validarEmail = body('email').isEmail().withMessage('Email no válido');
const validarNombre = body('nombre').notEmpty().withMessage('campo obligatorio');
const validarApellido = body('apellido').notEmpty().withMessage('campo obligatorio');
const validarFecha =  body('fechaNacimiento').isDate().withMessage('Error, fecha invalida');

// verificaciones Middleware 
export const verificarValidaciones = (req, res, next) => {
  const validacion = validationResult(req);
  if (!validacion.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "ERROR validacion",
      errores: validacion.array(),
    });
  }
  next();
};

export const validacionMedico = [
  validarNombre,
  validarApellido,
  body("especialidad").notEmpty().withMessage("campo obligatorio"),
  body("matricula").notEmpty().withMessage("campo obligatorio"),
  verificarValidaciones
];


export const validacionPacientes = [
    validarNombre,
    validarApellido,
    validarFecha,
    body("dni").notEmpty().isNumeric().withMessage("DNI incorrecto"),
    verificarValidaciones
];