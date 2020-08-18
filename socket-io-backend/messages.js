"use strict";
const generateMessage = (nomUtilisateur, text) => {
  return {
    nomUtilisateur,
    text,
    heureDenvoi: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
};