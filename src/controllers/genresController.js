const db = require('../database/models');
const sequelize = db.sequelize;
const { validationResult } = require('express-validator');

const genresController = {
    list: (req, res) => {
        db.Genre.findAll({
            include: ['movies'],
        }).then((genres) => {
            // return res.send(genres);
            return res.render('genresList', { genres });
        });
    },
    detail: (req, res) => {
        db.Genre.findByPk(req.params.id).then((genre) => {
            return res.render('genresDetail', { genre });
        });
    },

    // Rutas para trabajar con el CRUD

    add: function (req, res) {
        const genres = db.Genre.findAll({
            order: ['name'],
        })
            .then(() => {
                return res.render('genresAdd', {
                    genres,
                });
            })
            .catch((error) => console.log(error));
    },
    create: function (req, res) {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            const { name, ranking, active, notActive } = req.body;

            const activeValue = active === '1' ? 1 : notActive;

            db.Genre.create({
                name: name.trim(),
                ranking: ranking,
                active: activeValue,
            })
                .then(() => {
                    console.log('Género agregado correctamente');
                    return res.redirect('/genres');
                })
                .catch((error) => {
                    console.error('Error al agregar el género:', error);
                });
        } else {
            return res.render('genresAdd', {
                errors: errors.mapped(),
                old: req.body,
            });
        }
    },
    edit: function (req, res) {
        db.Genre.findByPk(req.params.id)
            .then((genre) => {
                return res.render('genresEdit', { genre });
            })
            .catch((error) => {
                console.log(error);
            });
    },
    update: function (req, res) {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            const { name, ranking, active, notActive } = req.body;

            const activeValue = active === '1' ? 1 : notActive;

            db.Genre.update(
                {
                    name: name.trim(),
                    ranking,
                    active: activeValue,
                },
                {
                    where: {
                        id: req.params.id,
                    },
                }
            )
                .then(() => {
                    console.log('Género actualizado correctamente');
                    return res.redirect('/genres');
                })
                .catch((error) => console.log(error));
        } else {
            db.Genre.findByPk(req.params.id).then((genre) => {
                return res.render('genresEdit', {
                    errors: errors.mapped(),
                    old: req.body,
                    genre,
                });
            });
        }
    },
    remove: function (req, res) {
        db.Genre.findByPk(req.params.id).then((genre) => {
            return res.render('genresDelete', {
                genre,
            });
        });
    },
    destroy: function (req, res) {
        db.Genre.destroy({
            where: {
                id: req.params.id,
            },
        })
            .then(() => {
                console.log('Género borrado correctamente');
                return res.redirect('/genres');
            })
            .catch((error) => console.log(error));
    },
};

module.exports = genresController;
