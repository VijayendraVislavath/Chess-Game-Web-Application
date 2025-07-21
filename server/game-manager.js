const { Chess } = require('chess.js');

class GameManager {
  constructor(io) {
    this.io = io;
    this.rooms = {}; // roomId -> { chess, history: [] }
  }

  createGame(socket, uid) {
    const roomId = socket.id.slice(0, 6); // lightweight id
    socket.join(roomId);
    this.rooms[roomId] = { chess: new Chess(), history: [] };
    this.io.to(roomId).emit('system', `Game ${roomId} created by ${uid}`);
    socket.emit('gameCreated', roomId);
  }

  joinGame(socket, roomId, uid) {
    const room = this.rooms[roomId];
    if (!room) return socket.emit('error', 'Room not found');
    socket.join(roomId);
    this.io.to(roomId).emit('system', `${uid} joined`);
    socket.emit('gameJoined', { fen: room.chess.fen(), history: room.history });
  }

  handleMove(socket, { roomId, from, to, promotion }) {
    const room = this.rooms[roomId];
    if (!room) return;
    const { chess, history } = room;
    const move = chess.move({ from, to, promotion });
    if (!move) return;

    history.push(move);
    this.io.to(roomId).emit('move', { fen: chess.fen(), move });
    if (chess.game_over()) this.io.to(roomId).emit('gameOver', chess.pgn());
  }

  handleChat(socket, { roomId, uid, text }) {
    this.io.to(roomId).emit('chat', { uid, text, ts: Date.now() });
  }

  cleanup(socketId) {
    // optional: remove empty rooms
  }
}

module.exports = GameManager;
