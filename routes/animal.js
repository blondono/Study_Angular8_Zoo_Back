'use strict'

var express = require('express');
var animalController = require('../Controllers/animal');

var api = express.Router();
var mw_auth = require('../middlewares/autenticate');
var mw_admin = require('../middlewares/isAdmin');

//subir archivos
var multipart = require('connect-multiparty');
var md_upload = multipart ({ uploadDir: './uploads/animals/' });

api.get('/pruebas-animales', mw_auth.ensureAuth, animalController.pruebas);
api.post('/animal/register', [mw_auth.ensureAuth, mw_admin.isAdmin], animalController.save);
api.get('/animal/getAll', animalController.getAll);
api.get('/animal/find/:id', animalController.find);
api.put('/animal/update/:id',[mw_auth.ensureAuth, mw_admin.isAdmin], animalController.update);
api.post('/animal/uploadFile/:id', [mw_auth.ensureAuth, mw_admin.isAdmin, md_upload], animalController.uploadFile);
api.post('/animal/getFile/:fileName', animalController.getFile);
api.delete('/animal/delete/:id', mw_auth.ensureAuth, animalController.deleteAnimal);
module.exports = api;