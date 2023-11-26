const express = require('express');
const router = express.Router();
const {list, detail, add, create, edit, update, remove, destroy} = require('../controllers/actorsController');
const actorsAddValidator = require('../validation/actorsAddValidator');
const actorsEditValidator = require('../validation/actorsEditValidator');


router
    .get('/actors', list)
    .get('/actors/detail/:id', detail)

    //Rutas creación del CRUD
    .get('/actors/add', add)
    .post('/actors/create', actorsAddValidator, create)
    .get('/actors/edit/:id', edit)
    .put('/actors/update/:id', actorsEditValidator, update)
    .get('/actors/delete/:id', remove)
    .delete('/actors/delete/:id', destroy);

module.exports = router;
