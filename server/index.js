const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const port = 3001;

const characters = [];

const generateRandomPosition = () => {
  return [Math.random() * 3, 0, Math.random() * 3];
}

const generateRandomHexColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

io.on('connection', (socket) => {
  console.log('user connected');

  characters.push({
    id: socket.id,
    position: generateRandomPosition(),
    hairColor: generateRandomHexColor(),
    topColor: generateRandomHexColor(),
    bottomColor: generateRandomHexColor()
  });
  socket.emit('hello');

  io.emit('characters', characters);

  socket.on("move", (position) => {
    const character = characters.find(
      (character) => character.id === socket.id
    );
    character.position = position;
    io.emit("characters", characters);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    characters.splice(
      characters.findIndex((character) => character.id === socket.id),
      1
    );
    io.emit("characters", characters);
  })

  socket.on('keydown', ({keycode, sequenceNumber}) => {
    backendPlayers[socket.id].sequenceNumber = sequenceNumber;
    switch(keycode) {
      case 'KeyW':
        backendPlayers[socket.id].y -= SPEED;
        break;
      case 'KeyA':
        backendPlayers[socket.id].x -= SPEED;
        break;
      case 'KeyS':
        backendPlayers[socket.id].y += SPEED;
        break;
      case 'KeyD':
        backendPlayers[socket.id].x += SPEED;
        break;
      }
  })
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})