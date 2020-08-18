"use strict";
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const Socketio = require("socket.io");
const morgan = require("morgan");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// app.use(morgan("dev"));

// Passport Config
require("./config/passport")(passport);

// db config
const {
  mongoose
} = require("./config/mongoose");

// PUG
app.set("view engine", "pug");
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// mes fichier
app.use("/images", express.static(__dirname + "/src/images"));
app.use("/js", express.static(__dirname + "/src/js"));
app.use("/styles", express.static(__dirname + "/src/styles"));
app.use("/vendor", express.static(__dirname + "/src/vendor"));
app.use("/socket-io-backend", express.static(__dirname + "/socket-io-backend"));

// Connect flash
app.use(flash());

// variables Globales
app.use(function (req, res, next) {
  res.locals.msg_succes = req.flash("msg_succes");
  res.locals.msg_erreur = req.flash("msg_erreur");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index.js"));
app.use("/utilisateurs", require("./routes/utilisateurs.js"));
app.use("/salon", require("./routes/salon.js"));

const PORT = process.env.PORT || 4000;

const server = app.listen(
  PORT,
  console.log(
    `Le serveur a démarré sur le port ${PORT} => http://localhost:${PORT}/`
  )
);

/************************* SOCKET.IO *********************/
const io = new Socketio(server);

const {
  generateMessage
} = require("./socket-io-backend/messages");

const {
  ajouterUtilisateur,
  supprimerUtilisateur,
  getUtilisateur,
  getUtilisateurDansLeSalon,
} = require("./socket-io-backend/utilisateurs");

io.on("connection", (socket) => {
  console.log("Nouvelle connection socket.io");

  socket.on("rejoindreSalon", (options, callback) => {

    const {
      error,
      utilisateur
    } = ajouterUtilisateur({
      id: socket.id,
      ...options,
    });
    // console.log("option", options)
    if (error) {
      return callback(error);
    }
    let utilisateurs = getUtilisateurDansLeSalon(utilisateur.room);

    // l'utilisateur rejoin un salon
    socket.join(utilisateur.room);

    // renvoi un msg de bienvenue à seulement l'utilisateur qui a rejoint le salon
    socket.emit("message", generateMessage("Admin", "Bienvenue !"));

    // renvoi un msg a tous les utilisateurs pour dire qu'une nouvelle personne a rejoint le salon
    socket.broadcast
      .to(utilisateur.room)
      .emit(
        "message",
        generateMessage(
          "Admin",
          `${utilisateur.nomUtilisateur} a rejoint la partie !`
        )
      );

    // les donnees du salon
    io.to(utilisateur.room).emit("donneesDuSalon", {
      room: utilisateur.room,
      utilisateurs,
    });

    callback();
  });

  // Message envoyé par un utilisateur dans la partie lancé. Tous les autres utilisateurs verrons le messsage
  socket.on("envoyerMessage", (message, callback) => {
    const utilisateur = getUtilisateur(socket.id);
    io.to(utilisateur.room).emit(
      "message",
      generateMessage(utilisateur.nomUtilisateur, message)
    );
    callback();
  });

  //Apres avoir cliqué sur le bouton jouer, la salle d'attente sera cacher et la partie sera lancé
  socket.on("startGame", (gameParam) => {
    const utilisateur = getUtilisateur(socket.id);
    io.to(utilisateur.room).emit("startGame", gameParam);

    // canvas dessin
    socket.on("drawing", (data) => io.to(utilisateur.room).emit("drawing", data));

  });

  //Quand un utilisateur quitte la partie
  socket.on("disconnect", () => {
    console.log("deconnexion socket.io");
    const utilisateur = supprimerUtilisateur(socket.id);
    if (utilisateur) {
      io.to(utilisateur.room).emit(
        "message",
        generateMessage(
          "Admin",
          `${utilisateur.nomUtilisateur} a quitté la partie !`
        )
      );
      if (utilisateur.room.idCreateur === utilisateur.idUtilisateurSession) {
        // console.log("createur")
        const chemin = "/salon";
        const donnees = {
          chemin,
          utilisateur
        }
        socket.broadcast.to(utilisateur.room).emit("redirection", donnees)
      } else {
        io.to(utilisateur.room).emit("donneesDuSalon", {
          room: utilisateur.room,
          utilisateurs: getUtilisateurDansLeSalon(utilisateur.room),
        });
      }
    }
  });
});