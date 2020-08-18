"use strict";

const socket = io();
// Options récupère les données présents dansl'url
const {
  idUtilisateurSession,
  nomUtilisateur,
  room
} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

let utilisateur = {
  nomUtilisateur,
  room: {
    nom: room,
  },
  idUtilisateurSession
}

//Pour rejoindre le salon
socket.emit("rejoindreSalon", utilisateur, (error) => {
  if (error) {
    alert(error);
    location.href = "/salon";
  }
});

socket.on("redirection", donnees => {
  location.href = donnees.chemin;
  // alert("L'hôte du salon a quitté la partie.")
})

function estJoueur(utilisateur) {
  return socket.id === utilisateur.id
}

//Données du salon
socket.on("donneesDuSalon", ({
  room,
  utilisateurs,
}) => {
  let joueur = utilisateurs.find((utilisateur, index) => {
    return estJoueur(utilisateur);
  });

  // console.log("joueur", joueur)

  document.querySelector("#nbParticipant").innerHTML = `<p>Nombre de participant(s): <span>${utilisateurs.length}</span>/10</p>`;
  document.querySelector("#nomDuSalon").innerText = "Salle d'attente - salon : " + room.nom;

  let btnJouer = document.querySelector("#jouer");
  let selectTour = document.querySelector("#selectTour");
  let selectTemps = document.querySelector("#selectTemps");

  if (joueur.room.idCreateur !== joueur.idUtilisateurSession) {
    btnJouer.setAttribute("disabled", "disabled");
    selectTour.setAttribute("disabled", "disabled");
    selectTemps.setAttribute("disabled", "disabled");
  }

  let ParticipantsSalleAttente = document.querySelector("#ParticipantsSalleAttente");
  let listeParticipants = document.querySelector("#listeParticipants");
  ParticipantsSalleAttente.innerHTML = "";
  listeParticipants.innerHTML = "";

  // parcourir les uilisateurs pour les affichers dans la liste
  for (let i = 0; i < utilisateurs.length; i++) {
    let p = document.createElement("p");
    const utilisateur = utilisateurs[i].nomUtilisateur;
    p.innerText = utilisateur;
    ParticipantsSalleAttente.appendChild(p);
    listeParticipants.innerHTML = ParticipantsSalleAttente.innerHTML;
  }

  // socket.emit("listeDeJoueurPartie", utilisateurs);

  const btnStartGame = document.querySelector("form#reglages");
  btnStartGame.addEventListener("submit", (e) => {
    e.preventDefault();
    let nbDeParticipant = document.querySelector("#nbParticipant p span").innerText;
    const selectTour = document.querySelector("#selectTour").value;
    const tempsDeJeuAChaqueTour = document.querySelector("#selectTemps").value;
    const gameParam = {
      cacher: "cacher",
      selectTour,
      tempsDeJeuAChaqueTour
    }
    if (nbDeParticipant < 2) {
      alert("2 joueurs minimun requis pour joueur.")
    } else {
      socket.emit("startGame", gameParam);
    }
  })

  //Apres avoir cliqué sur le bouton jouer, la salle d'attente sera cacher et la partie sera lancé  
  socket.on("startGame", (gameParam) => {

    console.log(utilisateurs)

    const partie = document.querySelector("div.partie");
    partie.classList.remove(gameParam.cacher);
    const salleAttente = document.querySelector(".salleAttente");
    salleAttente.classList.add(gameParam.cacher);

    let selectTour = gameParam.selectTour;
    let tempsDeJeuAChaqueTour = gameParam.tempsDeJeuAChaqueTour;
    let secondeDecompte = tempsDeJeuAChaqueTour;

    let tempsDeJeu = document.querySelector("#temps");
    tempsDeJeu.innerText = "Temps : " + secondeDecompte + "s";

    let nombreDeTour = document.querySelector("#tour");
    nombreDeTour.innerText = "Tour restant(s) : " + selectTour;

    /**  
    - une boîtes de dialogue s'ouvre au lancement de la partie, 
    - le premier joueur choisit un mot dans la liste puis le compte a rebour se déclanche
    - enfin le joueur peut commencer a dessiner
    */
    let motsRestants = lesMots.slice(0); // Dupliquer le tableau pour tirages avec suppression
    let troisAleatoires = [];
    // Pousser un élément de rang aléatoire dans le tableau tant sa longuer est inférieure à 3
    while (troisAleatoires.length < 3) {
      troisAleatoires.push(motsRestants.splice(Math.floor(Math.random() * motsRestants.length), 1)[0]);
    }

    document.getElementById("mot1").innerText = troisAleatoires[0];
    document.getElementById("mot2").innerText = troisAleatoires[1];
    document.getElementById("mot3").innerText = troisAleatoires[2];
    let choixMot = document.querySelectorAll(".modal-card-body a"); //nodelist

    for (let i = 0; i < choixMot.length; ++i) {
      choixMot[i].addEventListener("click", (e) => {

        const motAtrouver = e.target.innerText;
        console.log("mot à trouver", motAtrouver)

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

      })
    }

    setTimeout("CallButton()", 10);
  });
});


// ouvrir la modal
function CallButton() {
  document.getElementById("modalContentin").click();
}


// Message qui s'affiche dans le chatBox quand un utilisateur rejoint ou quitte le salon
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


//Envoi d'un message => evenement submit du formulaire de message
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