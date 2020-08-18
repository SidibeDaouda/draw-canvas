"use strict";
const utilisateurs = [];

const ajouterUtilisateur = ({
  id,
  nomUtilisateur,
  room
}) => {
  // Nettoyer les données
  nomUtilisateur = nomUtilisateur.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Valider les données
  if (!nomUtilisateur || !room) {
    return {
      error: "Veuillez entrer tous les champs",
    };
  }
  if (utilisateurs.length > 10) {
    return {
      error: "Le salon est complet",
    };
  }

  // Vérifier l'utilisateur existant
  const utilisateurExiste = utilisateurs.find((utilisateur) => {
    return (
      utilisateur.room === room && utilisateur.nomUtilisateur === nomUtilisateur
    );
  });

  // valider nomUtilisateur
  if (utilisateurExiste) {
    return {
      error: "Le nom d'utilisateur est utilisé !",
    };
  }

  // Stocker utilisateur
  const utilisateur = {
    id,
    nomUtilisateur,
    room,
  };
  utilisateurs.push(utilisateur);
  return {
    utilisateur,
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
  room = room.trim().toLowerCase();
  return utilisateurs.filter((utilisateur) => utilisateur.room === room);
};

module.exports = {
  ajouterUtilisateur,
  supprimerUtilisateur,
  getUtilisateur,
  getUtilisateurDansLeSalon,
};