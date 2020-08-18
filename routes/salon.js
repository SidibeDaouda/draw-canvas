"use strict";
const express = require("express");
const router = express.Router();

const {
    assurerAuthentifcation,
} = require("../config/auth");


router.get("/partie-de-dessin", assurerAuthentifcation, (req, res) => {
    res.render("lancerPartie.pug", {
        utilisateur: req.user,
    });
});

module.exports = router;