import {body, validationResult} from "express-validator";

export const validarId = param("id").isInt({min:1});
const validarEmail = body('email').isEmail().withMessage('Email no válido');
const validarNombre = body('nombre').notEmpty().withMessage('campo obligatorio');
const validarApellido = body('apellido').notEmpty().withMessage('campo obligatorio');
const validarFecha =  body('fechaNacimiento').isDate().withMessage('Error, fecha invalida');



export const verificarValidaciones = (req, res, next) => {                     
    const validacion = validationResult(req);
    if(!validacion.isEmpty()){
        return res.status(400).json({
            success: false, message: "falla de validacion",
            errores: validacion.array(),
        });

    }
        next();

    
};


export const validacionRegistros = [
    validarNombre,
    validarEmail,
    body("contrasena").isLength({ min: 8 }).withMessage("ERROR, contraseña invalida, min 8 caracteres"),
    
    verificarValidaciones
];

export const validacionLogin = [
    validarEmail,
    body("contraseña").notEmpty().withMessage("campo obligatorio"),
    verificarValidaciones

];

export const validacionPacientes = [
    validarEmail,
    validarApellido,
    validarFecha,
    body("dni").notEmpty().isNumeric().withMessage("DNI incorrecto"),
    verificarValidaciones
];



