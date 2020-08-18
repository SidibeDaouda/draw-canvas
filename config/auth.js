"use strict";
module.exports = {
  // s'assurer que l'utilisateur est authentifié
  assurerAuthentifcation: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    req.flash("msg_erreur", "Veuillez vous connecter pour voir cette page");
    res.redirect("/utilisateurs/login");
  },
  // Authentifié
  authentifie: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    // si l'authentifacation reussi redirection vers le salon
    res.redirect("/salon");
  },
};