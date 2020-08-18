"use strict";
var socket = io();

// Options récupère les données présents dansl'url
const {
  nomUtilisateur,
  room
} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

/**
 * Pour rejoindre le salon
 */
socket.emit(
  "rejoindreSalon", {
    nomUtilisateur,
    room,
  },
  (error) => {
    if (error) {
      alert(error);
      location.href = "/salon";
    }
  }
);

/**
 *Données du salon
 */
socket.on("donneesDuSalon", ({
  room,
  utilisateurs
}) => {
  const donnees = {
    room,
    utilisateurs,
  };

  document.querySelector(
    "#nbParticipant"
  ).innerText = `Participant(s): ${utilisateurs.length}`;

  document.querySelector("#nomDuSalon").innerText = donnees.room;
  const div = document.querySelector("#listeParticipants");
  div.innerHTML = "";
  // parcourir les uilisateurs pour les affichers dans la liste
  for (let i = 0; i < utilisateurs.length; i++) {
    let p = document.createElement("p");
    const utilisateur = utilisateurs[i].nomUtilisateur;
    p.innerText = utilisateur;
    div.appendChild(p);
  }
});

/**
 * Message qui s'affiche dans le chatBox quand un utilisateur rejoint ou quitte le salon
 */
socket.on("message", (message) => {
  const donnees = {
    nomUtilisateur: message.nomUtilisateur,
    message: message.text,
    heureDenvoi: moment(message.heureDenvoi).format("HH:mm "),
  };

  const messages = document.querySelector("#messages");
  const infosMessages = document.createElement("span");
  const messagesText = document.createElement("p");

  infosMessages.setAttribute("class", "infosMessages");
  infosMessages.innerHTML = donnees.nomUtilisateur + ": " + donnees.heureDenvoi;
  messagesText.innerHTML = donnees.message;

  messages.appendChild(infosMessages);
  messages.appendChild(messagesText);

  messages.scrollTop = messages.scrollHeight;
});

/**
 * Envoi d'un message => evenement submit du formulaire de message
 */
const messageForm = document.querySelector("#messagesForm");
const messageFormInput = messageForm.querySelector("#messagesForm input");
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageFormInput.value;

  socket.emit("envoyerMessage", message, (error) => {
    messageFormInput.value = "";
    if (error) {
      return console.log(error);
    }
  });
});

/**
 * Lancement de la partie
 */
const cardInfoGame = document.querySelector("#card-infoGame");
cardInfoGame.setAttribute("class", "cacher");
const cardInfoPartieFrom = document.querySelector("form#reglages");
const cardInfoPartie = document.querySelector("#card-infoPartie");

cardInfoPartieFrom.addEventListener("submit", (e) => {
  e.preventDefault();
  cardInfoGame.removeAttribute("class", "cacher");
  cardInfoGame.setAttribute("class", "card");
  cardInfoPartie.setAttribute("class", "cacher");

  let selectTour = document.querySelector("#selectTour").value;
  let tempsDeJeuAChaqueTour = document.querySelector("#selectTemps").value;
  let secondeDecompte = tempsDeJeuAChaqueTour;

  let tempsDeJeu = document.querySelector("#temps");
  tempsDeJeu.innerText = "Temps : " + secondeDecompte + "s";

  let nombreDeTour = document.querySelector("#tour");
  nombreDeTour.innerText = "Tour restant(s) : " + selectTour;

  let unePartie = setInterval(function () {
    secondeDecompte--;
    tempsDeJeu.innerText = "Temps : " + secondeDecompte + "s";

    if (secondeDecompte === 0) {
      selectTour--;
      secondeDecompte = tempsDeJeuAChaqueTour;
      nombreDeTour.innerText = "Tour restant(s) : " + selectTour;
    }

    if (selectTour == 0) {
      clearInterval(unePartie);
      alert("Partie terminé !");
    }
  }, 1000);
});