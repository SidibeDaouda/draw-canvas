"use strict";
const mongoose = require('mongoose');

const MotSchema = new mongoose.Schema({
    text: {
        type: String
    }
});
const Mot = mongoose.model('Mot', MotSchema);

module.exports = Mot;