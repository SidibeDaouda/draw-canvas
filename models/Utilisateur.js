"use strict";
const mongoose = require('mongoose');

const UtilisateurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
  },
  mdp: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Utilisateur = mongoose.model('Utilisateur', UtilisateurSchema);

module.exports = Utilisateur;