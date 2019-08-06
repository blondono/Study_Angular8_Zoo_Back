'use strict'

//filesystem
var fs = require('fs');
var path = require('path');

//modelos
var User = require('../models/user');
var Animal = require('../models/animal');

// servicios jwt
var jwt = require('../services/jwt');

//acciones
function pruebas(req, res){
    res.status(200).send({
        message: 'Probando el controlador de animales',
        user: req.user
    });
}

function save(req, res){
    var animal = new Animal();

    var params = req.body;

    if(params.name) {
        animal.name = params.name;
        animal.description = params.description;
        animal.year = params.year;
        animal.image = null;
        animal.user = req.user.sub;

        animal.save((err, animalSaved) => {
            if(err){
                res.status(200).send({ message: 'Error al guardar animal'  });
            } else {
                if(!animalSaved){
                    res.status(404).send({ message: 'No se pudo guardar el animal'  });
                } else {
                    res.status(200).send({ message: 'Animal guardado', animal: animalSaved  });
                }
            }
        })
    } else {
        res.status(200).send({ message: 'El nombre del animal es obligatorio'  })
    }
}

function getAll(req, res) {
    Animal.find({}).populate({ path: 'user' }).exec((err, animals) => {
        if(err){
            res.status(500).send({ message: 'Error en la petición'  });
        } else {
            if(!animals){
                res.status(404).send({ message: 'No hay animales' });
            } else {
                res.status(200).send({ message: 'Listado de animnales', animals: animals  });
            }
        }
    });
}

function find(req, res) {
    var animalId = req.params.id;

    Animal.findById(animalId).populate({ path: 'user' }).exec((err, animals) => {
        if(err){
            res.status(500).send({ message: 'Error en la petición'  });
        } else {
            if(!animals){
                res.status(404).send({ message: 'No hay animales' });
            } else {
                res.status(200).send({ message: 'Listado de animnales', animal: animals  });
            }
        }
    });
}

function update(req, res){
    var animalId = req.params.id;
    var update = req.body;

    Animal.findByIdAndUpdate(animalId, update, {new:true}, (err, animalUpdated) => {
        if(err){
            res.status(500).send({ message: 'Error al actualizar el animal' });
        } else {
            if(!animalUpdated){
                res.status(404).send({ message: 'No se ha podido actualizar el animal' });
            } else {
                res.status(200).send({ message: 'Animal actualizado', animalUpdated: animalUpdated });
            }
        }
    });
}

function uploadFile(req, res) {
    var animalId = req.params.id;
    var file_name = 'No ha subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg'
        || file_ext == 'gif'){        
            Animal.findByIdAndUpdate(animalId, {image: file_name}, {new:true}, (err, animalUpdated) => {
                if(err){
                    res.status(500).send({ message: 'Error al actualizar el animal' });
                } else {
                    if(!animalUpdated){
                        res.status(404).send({ message: 'No se ha podido actualizar el animal' });
                    } else {
                        res.status(200).send({ message: 'Animal actualizado', AnimalUpdated: animalUpdated, image: file_name });
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
    var path_file = './uploads/animals/' + fileName;

    fs.exists(path_file, function(exists){

        if(exists){
            res.sendFile(path.resolve(path_file));
        }else {
            res.status(404).send({ message: 'No existe la imagen' });
        }
    });   
}

function deleteAnimal (req, res) {
    var animalId = req.params.id;
    Animal.findByIdAndRemove(animalId, (err, animalRemoved) => {
        if(err){
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if(!animalRemoved){
                res.status(404).send({ message: 'No existe el animal' });
            } else {
                res.status(200).send({ message: 'Animal eliminado', animalRemoved: animalRemoved });
            }
        }
    });
}


module.exports = {
    pruebas,
    save,
    getAll,
    find,
    update,
    uploadFile,
    getFile,
    deleteAnimal
}