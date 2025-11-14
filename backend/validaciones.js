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

export const validacionUsuarios = [
    validarNombre,
    validarEmail,
    body("contraseña").notEmpty().withMessage("La contraseña es obligatoria.")
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 0,
            minNumbers: 1,
            minSymbols: 0,
        })

]

export const validacionTurnos = [
    body("paciente_id")
        .isInt({ min: 1 }).withMessage("El ID del paciente debe ser un número entero positivo.")
        .custom(async (value) => {
            const [rows] = await db.execute("SELECT * FROM pacientes WHERE id = ?", [value]);
            if (rows.length === 0) {
                throw new Error("El paciente no existe.");
            }
            return true;
        }),

    body("medico_id")
        .isInt({ min: 1 }).withMessage("El ID del médico debe ser un número entero positivo.")
        .custom(async (value) => {
            const [rows] = await db.execute("SELECT * FROM medicos WHERE id = ?", [value]);
            if (rows.length === 0) {
                throw new Error("El médico no existe.");
            }
            return true;
        }),

    body("fecha")
        .notEmpty().withMessage("La fecha es obligatoria.")
        .isISO8601().withMessage("La fecha debe tener un formato válido (YYYY-MM-DD).")
        .custom((value) => {
            const fechaTurno = new Date(value);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fechaTurno < hoy) {
                throw new Error("La fecha del turno no puede ser en el pasado.");
            }
            return true;
        }),

    body("hora")
        .notEmpty().withMessage("La hora es obligatoria.")
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("La hora debe tener un formato válido (HH:MM).")
        .custom(async (value, { req }) => {
            const { medico_id, fecha } = req.body;
            const turnoId = req.params.id;

            if (!medico_id || !fecha) return true;

            const [existe] = await db.execute(
                "SELECT * FROM turnos WHERE medico_id = ? AND fecha = ? AND hora = ? AND id != ?",
                [medico_id, fecha, value, turnoId]
            );

            if (existe.length > 0) {
                throw new Error("El médico ya tiene un turno en ese horario.");
            }

            return true;
        }),

    body("estado")
        .isString().withMessage("El estado debe ser una cadena de texto.")
        .isIn(["pendiente", "atendido", "cancelado"]).withMessage("El estado debe ser: 'pendiente', 'atendido' o 'cancelado'."),

    body("observaciones")
        .optional()
        .isString().withMessage("Las observaciones deben ser una cadena de texto.")
        .isLength({ max: 200 }).withMessage("Máximo 200 caracteres.")
];