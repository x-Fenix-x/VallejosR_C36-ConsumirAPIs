const { check } = require('express-validator');

module.exports = [
    check('name')
        .notEmpty()
        .withMessage('El titulo es obligatorio')
        .bail()
        .isLength({
            min: 2,
            max: 25,
        })
        .withMessage('Debe tener entre 2 y 25 caracteres'),
    check('ranking')
        .notEmpty()
        .withMessage('Ingrese un ranking')
        .isInt({
            min: 1,
        })
        .withMessage('Debe ser positivo'),
];
