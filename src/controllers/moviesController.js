const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const moment = require('moment');

//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;
const API = 'http://www.omdbapi.com/?apikey=d399100a';

const moviesController = {
    list: async (req, res) => {
        try {
            const movies = await db.Movie.findAll({
                include: ['genre', 'actors'],
            });

            const actors = await db.Actor.findAll({
                order: [['first_name'], ['last_name']],
            });

            res.render('moviesList.ejs', {
                movies,
                moment,
                actors,
            });
        } catch (error) {
            console.log('Error:', error);
        }
    },
    detail: (req, res) => {
        db.Movie.findByPk(req.params.id, {
            include: ['genre', 'actors'],
        }).then((movie) => {
            const actors = movie.actors;
            return res.render('moviesDetail.ejs', {
                ...movie.dataValues,
                moment,
                actors,
            });
        });
    },
    new: (req, res) => {
        db.Movie.findAll({
            order: [['release_date', 'DESC']],
            limit: 5,
        }).then((movies) => {
            return res.render('newestMovies', { movies, moment });
        });
    },
    recomended: (req, res) => {
        db.Movie.findAll({
            where: {
                rating: { [db.Sequelize.Op.gte]: 8 },
            },
            order: [['rating', 'DESC']],
        }).then((movies) => {
            return res.render('recommendedMovies.ejs', { movies });
        });
    },
    search: (req, res) => {
        const title = req.query.titulo;

        fetch(`${API}&t=${title}`)
            .then((data) => {
                return data.json(); //parsear información
            })
            .then((movie) => {
                // console.log(movie);
                return res.render('moviesDetailOmdb', {
                    movie,
                });
            })
            .catch((error) => console.log(error));
    },

    // Rutas para trabajar con el CRUD

    add: function (req, res) {
        const actors = db.Actor.findAll({
            order: [['first_name'], ['last_name']],
        });

        const genres = db.Genre.findAll({
            order: ['name'],
        });

        const movie = db.Movie.findByPk(req.params.id, {
            include: ['actors'],
        });

        Promise.all([actors, genres, movie])
            .then(([actors, genres, movie]) => {
                return res.render('moviesAdd', {
                    genres,
                    actors,
                    Movie: movie,
                });
            })
            .catch((error) => console.log(error));
    },
    create: function (req, res) {
        const { title, rating, awards, release_date, length, genre_id } =
            req.body;

        const actors = [req.body.actors].flat();
        console.log('>>>>>>>>>>>>>>', actors);

        db.Movie.create({
            title: title.trim(),
            rating,
            awards,
            release_date,
            length,
            genre_id,
            image: req.file ? req.file.filename : null,
        })
            .then((movie) => {
                if (actors) {
                    const actorsDB = actors.map((actor) => {
                        return {
                            movie_id: movie.id,
                            actor_id: actor,
                        };
                    });

                    db.Actor_Movie.bulkCreate(actorsDB, {
                        validate: true,
                    }).then(() => {
                        console.log('actores agregados correctamente');
                        return res.redirect('/movies');
                    });
                } else {
                    return res.redirect('/movies');
                }
            })
            .catch((error) => console.log(error));
    },
    edit: function (req, res) {
        const genres = db.Genre.findAll({
            order: ['name'],
        });
        const movie = db.Movie.findByPk(req.params.id, {
            include: ['actors'],
        });
        const actors = db.Actor.findAll({
            order: [
                ['first_name', 'ASC'],
                ['last_name', 'ASC'],
            ],
        });

        Promise.all([genres, movie, actors])
            .then(([genres, movie, actors]) => {
                // return res.send(movie)
                return res.render('moviesEdit', {
                    genres,
                    Movie: movie,
                    actors,
                    moment,
                });
            })
            .catch((error) => console.log(error));
    },
    update: function (req, res) {
        let { title, rating, awards, release_date, length, genre_id, actors } =
            req.body;
        actors = typeof actors === 'string' ? [actors] : actors;

        const newImage = req.file ? req.file.filename : null;

        db.Movie.update(
            {
                title: title.trim(),
                rating,
                awards,
                release_date,
                length,
                genre_id,
                image: newImage || sequelize.literal('image'),
            },
            {
                where: {
                    id: req.params.id,
                },
            }
        )
            .then(() => {
                db.Actor_Movie.destroy({
                    where: {
                        movie_id: req.params.id,
                    },
                }).then(() => {
                    if (actors) {
                        const actorsDB = actors.map((actor) => {
                            return {
                                movie_id: req.params.id,
                                actor_id: actor,
                            };
                        });

                        db.Actor_Movie.bulkCreate(actorsDB, {
                            validate: true,
                        }).then(() =>
                            console.log('actores agregados correctamente')
                        );
                    }
                });
            })
            .catch((error) => console.log(error))
            .finally(() => res.redirect('/movies'));
    },
    delete: function (req, res) {
        db.Movie.findByPk(req.params.id).then((movie) => {
            return res.render('moviesDelete', {
                movie,
            });
        });
    },
    destroy: function (req, res) {
        db.Actor_Movie.destroy({
            where: {
                movie_id: req.params.id,
            },
        })
            .then(() => {
                db.Actor.update(
                    {
                        favorite_movie_id: null,
                    },
                    {
                        where: {
                            favorite_movie_id: req.params.id,
                        },
                    }
                ).then(() => {
                    db.Movie.destroy({
                        where: {
                            id: req.params.id,
                        },
                    }).then(() => {
                        return res.redirect('/movies');
                    });
                });
            })
            .catch((error) => console.log(error));
    },
};

module.exports = moviesController;
