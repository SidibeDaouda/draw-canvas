"use strict";
const express = require("express");
const router = express.Router();
const {
  assurerAuthentifcation,
} = require("../config/auth");

// page d'accueil
router.get("/", (req, res) => res.redirect("accueil"));

router.get("/accueil", (req, res) => res.render("accueil", {
  utilisateur: req.user,
}));

// acces au Salon
router.get("/salon", assurerAuthentifcation, (req, res) => {
  res.render("salon", {
    utilisateur: req.user,
  });
});

// acces au profil
router.get("/profil", assurerAuthentifcation, (req, res) => {
  res.render("profil", {
    utilisateur: req.user,
  });
});

module.exports = router;