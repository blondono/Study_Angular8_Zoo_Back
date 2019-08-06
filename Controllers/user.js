'use strict'

var bcrypt = require('bcrypt-nodejs');

//filesystem
var fs = require('fs');
var path = require('path');

//modelos
var User = require('../models/user');

// servicios jwt
var jwt = require('../services/jwt');

//acciones
function pruebas(req, res){
    res.status(200).send({
        message: 'Probando el controlador de usuarios y la acción pruebas',
        user: req.user
    });
}

function saveUser(req, res){
    //Crear el objeto del usuario
    var user = new User();

    //Recojer los parámetros que nos llegan en el body
    var params = req.body;

    console.log(params);

    if(params.password && params.name && params.surname
        && params.email){
        //asignamos valores al objeto del usuario
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.role = params.role;
        user.image = null;
        
        User.findOne({email: user.email.toLowerCase()}, (err, issetUser) => {
            if(err){
                res.status(500).send({
                    message: 'Error al comprobar el usuario usuario'
                })
            } else {
                if(!issetUser){
                    bcrypt.hash(params.password, null, null, function(err, hash) {
                        user.password = hash;
                        
                        // guardo usuario en base de datos
                        user.save((err, userStored) => {
                            if(err){
                                res.status(500).send({
                                    message: 'Error al guardar usuario'
                                })
                            } else {
                                if(!userStored){
                                    res.status(404).send({
                                        message: 'No se ha registrado el usuario'
                                    })
                                } else {
                                    res.status(200).send({ user: userStored  })
                                }
                            }
                        });
                    });
                } else {
                    res.status(200).send({ message: 'El usuario ya existe'  })
                }
            }
        });        
    } else {
        res.status(500).send({
            message: 'Introduce los datos correctamente para poder registrar al usuario'
        })
    }
}

function login(req, res){
    var params = req.body;


    var email = params.email;
    var password = params.password;

    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if(err){
            res.status(500).send({
                message: 'Error al comprobar el usuario usuario'
            })
        } else {
            if(user){
                bcrypt.compare(password, user.password, (err, check) => {
                    if(check){

                        //comprobamos y generamos el token
                        if(params.gettoken){
                            //devolvemos el token
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        }else{
                            res.status(200).send({ user });
                        }
                    } else {                        
                        res.status(404).send({
                            message: 'usuario y contraseña incorrecto'
                        })
                    }
                })

            } else {
                res.status(404).send({
                    message: 'El usuario no existe'
                })
            }
        }
    });
}

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    if(userId != req.user.sub){
        res.status(500).send({ message: 'No tienes permisos para actualizar el usuario' });
    } 

    User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
        if(err){
            res.status(500).send({ message: 'Error al actualizar usuario' });
        } else {
            if(!userUpdated){
                res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
            } else {
                res.status(200).send({ message: 'Usuario actualizado', oldUser: userUpdated });
            }
        }
    });
}

function uploadFile(req, res) {
    var userId = req.params.id;
    var file_name = 'No ha subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg'
        || file_ext == 'gif'){
            if(userId != req.user.sub){
                res.status(500).send({ message: 'No tienes permisos para actualizar el usuario' });
            } 
        
            User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdated) => {
                if(err){
                    res.status(500).send({ message: 'Error al actualizar usuario' });
                } else {
                    if(!userUpdated){
                        res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
                    } else {
                        res.status(200).send({ message: 'Usuario actualizado', User: userUpdated, image: file_name });
                    }
                }
            });
        } else {

            fs.unlink(file_path, (err) => {
                if(err){
                    res.status(500).send({ message: 'Extensión no válida, fichero no eliminado' });
                } else {
                    res.status(500).send({ message: 'Extensión no válida, fichero eliminado' });
                }
            });
        }
    } else {
        res.status(200).send({ message: 'No se han subido ficheros' });
    }
}

function getFile(req, res){

    var fileName = req.params.fileName;
    var path_file = './uploads/users/' + fileName;

    fs.exists(path_file, function(exists){

        if(exists){
            res.sendFile(path.resolve(path_file));
        }else {
            res.status(404).send({ message: 'No existe la imagen' });
        }
    });   
}

function getKeepers(req, res){
    User.find({
        role:'ROLE_ADMIN'
    }).exec((err, users) => {
        if(err){
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if(!users){
                res.status(404).send({ message: 'No hay cuidadores' });
            } else {
                res.status(200).send({ message: 'cuidadores', keepers: users });
            }
        }
    });
}

module.exports = {
    pruebas,
    saveUser,
    login,
    updateUser,
    uploadFile,
    getFile,
    getKeepers
};