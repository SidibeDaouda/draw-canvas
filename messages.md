~~A detailler~~

# Client

- `connection` :
- `c-drawing` :
- `c-start-game`

# Server

- `s-drawing` :
- `s-message` :
- `s-start-game` :

L'utilisateur clique sur "Jouer":

1. envoi de `c-start-game`
2. broadcast de `s-start-game` à tous les utilisateurs SAUF le joueur qui a envoyé `c-start-game`
3. (CÔTE CLIENT) à la réception de `s-start-game`, lancer la partie :

- cacher l'image sur le canvas
- démarrer le compte à rebours
- etc.
