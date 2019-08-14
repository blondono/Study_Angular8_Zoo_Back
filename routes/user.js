'use strict'

var express = require('express');
var userController = require('../Controllers/user');

var api = express.Router();
var mw_auth = require('../middlewares/autenticate');

//subir archivos
var multipart = require('connect-multiparty');
var md_upload = multipart ({ uploadDir: './uploads/users/' });

api.get('/pruebas-del-controlador', mw_auth.ensureAuth, userController.pruebas);
api.post('/user/register', userController.saveUser);
api.post('/login', userController.login);
api.put('/user/update/:id', mw_auth.ensureAuth, userController.updateUser);
api.post('/user/uploadFile/:id', [mw_auth.ensureAuth, md_upload], userController.uploadFile);
api.get('/user/getFile/:fileName', userController.getFile);
api.get('/user/keppers', userController.getKeepers);
module.exports = api;