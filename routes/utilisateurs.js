"use strict";
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

//  Utilisateur model
const Utilisateur = require("../models/Utilisateur");

const {
  authentifie
} = require("../config/auth");

// Page de login
router.get("/login", authentifie, (req, res, next) => res.render("login"));

// Page d'inscription
router.get("/inscription", authentifie, (req, res, next) =>
  res.render("inscription")
);

// post inscription
router.post("/inscription", (req, res, next) => {
  const {
    nom,
    email,
    mdp,
    mdp2
  } = req.body;

  let erreurs = [];

  if (!nom || !email || !mdp || !mdp2) {
    erreurs.push({
      msg: "Veuillez entrer tous les champs",
    });
  }

  if (mdp != mdp2) {
    erreurs.push({
      msg: "Les mots de passe ne correspondent pas",
    });
  }

  if (mdp.length < 6) {
    erreurs.push({
      msg: "Le mot de passe doit être au moins de 6 caractères",
    });
  }

  if (erreurs.length > 0) {
    res.render("inscription", {
      erreurs,
      nom,
      email,
      mdp,
      mdp2,
    });
  } else {
    Utilisateur.findOne({
      email: email,
    }).then((utilisateur) => {
      if (utilisateur) {
        erreurs.push({
          msg: "L'email existe déjà",
        });
        res.render("inscription", {
          erreurs,
          nom,
          email,
          mdp,
          mdp2,
        });
      } else {
        const newUser = new Utilisateur({
          nom,
          email,
          mdp,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.mdp, salt, (err, hash) => {
            if (err) throw err;
            newUser.mdp = hash;
            newUser
              .save()
              .then((utilisateur) => {
                // req.flash(
                //   "msg_succes",
                //   "Vous êtes maintenant inscrit et pouvez vous connecter"
                // );
                // connexion automatique apres l'inscription réussi
                req.login(utilisateur, function (err) {
                  if (err) {
                    return next(err);
                  }
                  return res.redirect('/salon');
                });
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  // utilisateur = req.session.passport;
  // console.log("utilisateur", utilisateur);
  passport.authenticate("local", {
    successRedirect: "/salon",
    failureRedirect: "/utilisateurs/login",
    badRequestMessage: "Veuillez entrer tous les champs",
    failureFlash: true,
  })(req, res, next);
});

// Déconnexion
router.get("/deconnexion", (req, res) => {
  req.logout();
  req.flash("msg_succes", "Vous êtes déconnecté");
  res.redirect("/utilisateurs/login");
});

module.exports = router;