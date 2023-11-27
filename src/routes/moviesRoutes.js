const express = require('express');
const router = express.Router();
const {
    list,
    recomended,
    detail,
    new: newest,
    search,
    add,
    create,
    edit,
    update,
    delete: remove,
    destroy,
} = require('../controllers/moviesController');
const upload = require('../middlewares/upload');

router
    .get('/movies', list)
    .get('/movies/new', newest)
    .get('/movies/recommended', recomended)
    .get('/movies/detail/:id', detail)

    //Rutas creación del CRUD
    .get('/movies/add', add)
    .get('/movies/search', search)
    .post('/movies/create', upload.single('image'), create)
    .get('/movies/edit/:id', edit)
    .put('/movies/update/:id', upload.single('image'), update)
    .get('/movies/delete/:id', remove)
    .delete('/movies/delete/:id', destroy);

module.exports = router;
