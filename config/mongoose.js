"use strict";
const mongoose = require("mongoose");
const db = 'mongodb://localhost:27017/jeuMulti';

const connectionOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(db, connectionOptions)
    .then(() => {
        console.log("Connecté à MongoDB avec succèss :)");
    })
    .catch((e) => {
        console.log("Erreur de connexion à MongoDB");
        console.log(e);
    });

module.exports = {
    mongoose,
};