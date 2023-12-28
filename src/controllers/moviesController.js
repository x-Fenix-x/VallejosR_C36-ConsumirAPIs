const db = require('../database/models');
const paginate = require('express-paginate');
const moment = require('moment');
const { Op } = require('sequelize');
const translatte = require('translatte');
const axios = require('axios');

const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;
const URL_BASE = 'http://www.omdbapi.com/?&apikey=d399100a';

const moviesController = {
    list: async (req, res) => {
        try {
            const { count, rows } = await db.Movie.findAndCountAll({
                include: ['genre', 'actors'],
                limit: req.query.limit,
                offset: req.skip,
            });

            const pagesCount = Math.ceil(count / req.query.limit);

            const actors = await db.Actor.findAll({
                order: [['first_name'], ['last_name']],
            });

            res.render('moviesList.ejs', {
                movies: rows,
                moment,
                actors,
                result: 0,
                pages: paginate.getArrayPages(req)(
                    pagesCount,
                    pagesCount,
                    req.query.page
                ),
                paginate,
                pagesCount,
                currentPage: req.query.page,
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
    search: async (req, res) => {
        const { count, rows } = await db.Movie.findAndCountAll({
            include: ['genre', 'actors'],
            limit: req.query.limit,
            offset: req.skip,
        });
        const pagesCount = Math.ceil(count / req.query.limit);
        try {
            let keyword = req.query.keyword;
            keyword = keyword.trim();

            const movies = await db.Movie.findAll({
                where: {
                    [Op.or]: [
                        {
                            title: {
                                [Op.like]: `%${keyword}%`,
                            },
                        },
                    ],
                },
                include: ['actors'],
            });

            if (movies.length === 0) {
                const response = await axios.get(`${URL_BASE}&t=${keyword}`);
                const {
                    Title,
                    Released,
                    Genre,
                    Awards,
                    Poster,
                    Ratings,
                    Runtime,
                } = response.data;

                const awardsParseado = (awards) => {
                    if (awards === 'N/A') {
                        return 0;
                    }

                    const winsArray = awards.match(/(\d+) win/);
                    const wins = winsArray ? parseInt(winsArray[1]) : 0;

                    const oscarWinsArray = awards.match(/(\d+) Oscar/);
                    const oscarWins = oscarWinsArray
                        ? parseInt(oscarWinsArray[1])
                        : 0;

                    return wins + oscarWins;
                };

                const awards = awardsParseado(Awards);
                const rating = Ratings[0].Value.split('/')[0];
                const release_date = moment(Released);
                const image = Poster;
                const durationMovie = Runtime.match(/\d+/);
                const lengthParseado = durationMovie
                    ? parseInt(durationMovie[0])
                    : null;

                const newGenre = Genre.split(',')[0];
                let genre_id;
                if (newGenre) {
                    const { text } = await translatte(newGenre, { to: 'es' });

                    const genres = await db.Genre.findAll({
                        order: [['ranking', 'DESC']],
                    });

                    const [genre, genreCreated] = await db.Genre.findOrCreate({
                        where: { name: text },
                        defaults: {
                            active: 1,
                            ranking: genres[0].ranking + 1,
                        },
                    });
                    genre_id = genre.id;
                    // console.log(genre_id)
                }

                let newMovie = {
                    title: Title,
                    awards: awards,
                    rating,
                    release_date,
                    length: lengthParseado,
                    image,
                    actors: Array.isArray(Actors)
                        ? Actors.map((actor) => actor.name)
                        : typeof Actors === 'string'
                        ? Actors.split(',').map((actor) => actor.trim())
                        : [],
                    genre_id,
                };

                await db.Movie.create(newMovie);

                const updatedMovies = await db.Movie.findAll({
                    where: {
                        [Op.or]: [
                            {
                                title: {
                                    [Op.like]: `%${keyword}%`,
                                },
                            },
                        ],
                    },
                });

                return res.render('moviesList', {
                    movies: updatedMovies,
                    moment,
                    pages: paginate.getArrayPages(req)(
                        pagesCount,
                        pagesCount,
                        req.query.page
                    ),
                    paginate,
                    pagesCount,
                    currentPage: req.query.page,
                    result: 1,
                });
            } else {
                return res.render('moviesList', {
                    movies,
                    moment,
                    pages: paginate.getArrayPages(req)(
                        pagesCount,
                        pagesCount,
                        req.query.page
                    ),
                    paginate,
                    pagesCount,
                    currentPage: req.query.page,
                    result: 1,
                });
            }
        } catch (error) {
            console.error(error);
            return res.render('moviesList', {
                movies: [],
                moment,
                pages: paginate.getArrayPages(req)(
                    pagesCount,
                    pagesCount,
                    req.query.page
                ),
                paginate,
                pagesCount,
                currentPage: req.query.page,
                result: 1,
            });
        }
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
