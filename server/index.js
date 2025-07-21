// server/index.js
require('dotenv').config();
const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const cors = require('cors');

const GameManager = require('./game-manager');

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

const games = new GameManager(io);

io.on('connection', socket => {
  console.log('🔌', socket.id, 'connected');

  socket.on('createGame', ({ uid }) => games.createGame(socket, uid));
  socket.on('joinGame', ({ gameId, uid }) => games.joinGame(socket, gameId, uid));
  socket.on('move', data => games.handleMove(socket, data));
  socket.on('chat', data => games.handleChat(socket, data));
  socket.on('disconnect', () => games.cleanup(socket.id));
});

httpServer.listen(3_000, () => console.log('Server on http://localhost:3000'));
