"use strict";

const Utilisateur = require("../models/Utilisateur");

const utilisateurs = [];

const ajouterUtilisateur = ({
  id,
  idUtilisateurSession,
  nomUtilisateur,
  room // l'objet room envoyé depuis le client 
}) => {
  // Nettoyer les données
  idUtilisateurSession = idUtilisateurSession.trim().toLowerCase();
  nomUtilisateur = nomUtilisateur.trim().toLowerCase();
  let nomRoom = room.nom.trim().toLowerCase();

  // Valider les données
  if (!nomUtilisateur || !nomRoom) {
    return {
      error: "Veuillez entrer tous les champs"
    };
  }
  if (utilisateurs.length > 9) {
    return {
      error: "Le salon est complet !"
    };
  }

  // Vérifier l'utilisateur existant
  const utilisateurExiste = utilisateurs.find((utilisateur) => {
    return (utilisateur.room.nom === nomRoom && utilisateur.nomUtilisateur === nomUtilisateur);
  });

  // valider nomUtilisateur
  if (utilisateurExiste) {
    return {
      error: "Le nom d'utilisateur est utilisé !"
    };
  }
  // Stocker utilisateur
  const utilisateur = {
    id,
    idUtilisateurSession,
    nomUtilisateur,
    room,
  };

  utilisateurs.push(utilisateur);

  utilisateurs.find((utilisateur) => {
    utilisateur.room.idCreateur = utilisateurs[0].idUtilisateurSession;
  })

  return {
    utilisateur
  };
};

const supprimerUtilisateur = (id) => {
  const index = utilisateurs.findIndex((utilisateur) => utilisateur.id === id);

  if (index !== -1) {
    return utilisateurs.splice(index, 1)[0];
  }
};

const getUtilisateur = (id) => {
  return utilisateurs.find((utilisateur) => utilisateur.id === id);
};

const getUtilisateurDansLeSalon = (room) => {
  let nomRoom = room.nom.trim().toLowerCase();
  return utilisateurs.filter((utilisateur) => utilisateur.room.nom === nomRoom);
};

module.exports = {
  ajouterUtilisateur,
  supprimerUtilisateur,
  getUtilisateur,
  getUtilisateurDansLeSalon,
};