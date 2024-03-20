const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());
const items = require('./utils/items');
const pathfinding = require("pathfinding");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const port = 3001;
const characters = [];
const map = {
  size: [10, 10],
  gridDivision: 2,
  items: [
    {
      ...items.showerRound,
      gridPosition: [0, 0],
    },
    {
      ...items.toiletSquare,
      gridPosition: [0, 3],
      rotation: 1,
    },
    {
      ...items.washer,
      gridPosition: [5, 0],
    },
    {
      ...items.bathroomSink,
      gridPosition: [7, 0],
    },
    {
      ...items.trashcan,
      gridPosition: [0, 5],
      rotation: 1,
    },
    {
      ...items.bathroomCabinetDrawer,
      gridPosition: [3, 0],
    },
    {
      ...items.bathtub,
      gridPosition: [4, 4],
    },
    {
      ...items.bathtub,
      gridPosition: [0, 8],
      rotation: 3,
    },
    {
      ...items.bathroomCabinet,
      gridPosition: [3, 0],
    },
    {
      ...items.bathroomMirror,
      gridPosition: [0, 8],
      rotation: 1,
    },
    {
      ...items.bathroomMirror,
      gridPosition: [, 10],
      rotation: 1,
    },
    {
      ...items.tableCoffee,
      gridPosition: [10, 8],
    },
    {
      ...items.rugRectangle,
      gridPosition: [8, 7],
    },
    {
      ...items.loungeSofaCorner,
      gridPosition: [6, 10],
    },
    {
      ...items.bear,
      gridPosition: [0, 3],
      rotation: 1,
    },
    {
      ...items.plant,
      gridPosition: [11, 13],
    },
    {
      ...items.cabinetBedDrawerTable,
      gridPosition: [13, 19],
    },
    {
      ...items.cabinetBedDrawer,
      gridPosition: [19, 19],
    },
    {
      ...items.bedDouble,
      gridPosition: [14, 15],
    },
    {
      ...items.bookcaseClosedWide,
      gridPosition: [12, 0],
      rotation: 2,
    },
    {
      ...items.speaker,
      gridPosition: [11, 0],
    },
    {
      ...items.speakerSmall,
      gridPosition: [15, 0],
    },
    {
      ...items.loungeChair,
      gridPosition: [10, 4],
    },
    {
      ...items.loungeSofaOttoman,
      gridPosition: [14, 4],
    },
    {
      ...items.loungeDesignSofa,
      gridPosition: [18, 0],
      rotation: 1,
    },
    {
      ...items.kitchenCabinetCornerRound,
      gridPosition: [2, 18],
      rotation: 2,
    },
    {
      ...items.kitchenCabinetCornerInner,
      gridPosition: [0, 18],
      rotation: 2,
    },
    {
      ...items.kitchenStove,
      gridPosition: [0, 16],
      rotation: 1,
    },
    {
      ...items.dryer,
      gridPosition: [0, 14],
      rotation: 1,
    },
    {
      ...items.lampRoundFloor,
      gridPosition: [0, 12],
    },
  ],
};

const grid = new pathfinding.Grid(
  map.size[0] * map.gridDivision,
  map.size[1] * map.gridDivision
);

const finder = new pathfinding.AStarFinder({
  allowDiagonal: true,
  dontCrossCorners: true,
});

const findPath = (start, end) => {
  const gridClone = grid.clone();
  const path = finder.findPath(start[0], start[1], end[0], end[1], gridClone);
  return path;
};

const updateGrid = () => {
  for (let x = 0; x < map.size[0] * map.gridDivision; x++) {
    for (let y = 0; y < map.size[1] * map.gridDivision; y++) {
      grid.setWalkableAt(x, y, true);
    }
  }

  map.items.forEach((item) => {
    if (item.walkable || item.wall) {
      return;
    }
    const width =
      item.rotation === 1 || item.rotation === 3 ? item.size[1] : item.size[0];
    const height =
      item.rotation === 1 || item.rotation === 3 ? item.size[0] : item.size[1];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        grid.setWalkableAt(
          item.gridPosition[0] + x,
          item.gridPosition[1] + y,
          false
        );
      }
    }
  });
};

updateGrid();

const generateRandomPosition = () => {
  for (let i = 0; i < 100; i++) {
    const x = Math.floor(Math.random() * map.size[0] * map.gridDivision);
    const y = Math.floor(Math.random() * map.size[1] * map.gridDivision);
    if (grid.isWalkableAt(x, y)) {
      return [x, y];
    }
  }
};

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
  socket.emit('hello', {
    map,
    characters,
    id: socket.id,
    items
  });

  io.emit('characters', characters);

  socket.on("move", (from, to) => {
    const character = characters.find(
      (character) => character.id === socket.id
    );
    const path = findPath(from, to);
    if (!path) {
      return;
    }
    character.position = from;
    character.path = path;
    io.emit("playerMove", character);
  });

  socket.on('itemsUpdate', (items) => {
    map.items = items;
    characters.forEach((character) => {
      character.path = [];
      character.position = generateRandomPosition();
    });
    updateGrid();
    io.emit('mapUpdated', {map, characters});
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