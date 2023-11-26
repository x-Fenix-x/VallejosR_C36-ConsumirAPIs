const express = require('express');
const router = express.Router();
const {list, detail, add, create, edit, update, remove, destroy} = require('../controllers/genresController');
const genresAddValidator = require('../validation/genresAddValidator');
const genresEditValidator = require('../validation/genresEditValidator');

router.get('/genres', list);
router.get('/genres/detail/:id', detail);

//Rutas creación del CRUD
router
    .get('/genres/add', add)
    .post('/genres/create', genresAddValidator, create)
    .get('/genres/edit/:id', edit)
    .put('/genres/update/:id',genresEditValidator, update)
    .get('/genres/delete/:id', remove)
    .delete('/genres/delete/:id', destroy);

module.exports = router;
