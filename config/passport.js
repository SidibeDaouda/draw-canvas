"use strict";
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Chargement modele Utilisateur
const Utilisateur = require("../models/Utilisateur");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({
        // le champ email et mdp seront utilisés pour se connecter
        usernameField: "email",
        passwordField: "mdp",
      },
      (email, mdp, done) => {
        // vérifie si l'utilisateur saisi correspond à un utilisateur dans la bdd
        Utilisateur.findOne({
          email: email,
        }).then((utilisateur) => {
          if (!utilisateur) {
            return done(null, false, {
              message: "Cet email n'est pas enregistré",
            });
          }

          // Vérifie si le mdp saisi correspond au mdp de l'utilisateur
          bcrypt.compare(mdp, utilisateur.mdp, (err, correspond) => {
            if (err) throw err;
            if (correspond) {
              return done(null, utilisateur);
            } else {
              return done(null, false, {
                message: "Mot de passe incorrect",
              });
            }
          });
        });
      }
    )
  );

  // Aide: http://www.passportjs.org/docs/downloads/html/
  // Seul l'ID utilisateur est sérialisé dans la session, ce qui réduit la quantité de données stockées dans la session. Lorsque des demandes ultérieures sont reçues, cet ID est utilisé pour trouver l'utilisateur, qui sera restauré req.user
  passport.serializeUser(function (utilisateur, done) {
    done(null, utilisateur.id);
  });

  passport.deserializeUser(function (id, done) {
    Utilisateur.findById(id, function (err, utilisateur) {
      done(err, utilisateur);
    });
  });
};