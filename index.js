'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.port || 3789;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/Zoo', { useMongoClient: true})
.then(() => {
     console.log('la conexión a la bd Zoo se ha realizado correctamente');
     app.listen(port, () => {
        console.log('El servidor local con node y express está corriendo');
     });
})
.catch(err => console.log(err))