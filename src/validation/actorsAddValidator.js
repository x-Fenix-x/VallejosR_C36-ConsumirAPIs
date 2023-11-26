const { check } = require('express-validator');

module.exports = [
    check('first_name')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .bail()
        .isLength({
            min: 2,
            max: 25,
        })
        .withMessage('Debe tener entre 2 y 25 caracteres'),
    check('last_name')
        .notEmpty()
        .withMessage('El apellido es obligatorio')
        .bail()
        .isLength({
            min: 2,
            max: 25,
        })
        .withMessage('Debe tener entre 2 y 25 caracteres'),
    check('rating')
        .notEmpty()
        .withMessage('Ingrese un rating')
        .isFloat({ min: 1, max: 99 })
        .withMessage('Debe ser positivo y menor a 100'),
];
