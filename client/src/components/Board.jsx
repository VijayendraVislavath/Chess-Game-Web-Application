import { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import createEngine from '../utils/stockfishWorker';
import { socket } from '../socket';

export default function Board({ roomId, aiDepth }) {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [engine] = useState(() => createEngine(aiDepth));

  useEffect(() => {
    socket.on('move', ({ fen: newFen }) => setFen(newFen));
    return () => socket.off('move');
  }, []);

  async function onDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (!move) return false;
    setFen(game.fen());
    socket.emit('move', { roomId, ...move });

    if (!roomId) {
      const best = await engine.getBestMove(game.fen());
      game.move({ from: best.slice(0, 2), to: best.slice(2, 4), promotion: 'q' });
      setFen(game.fen());
    }
    return true;
  }

  return <Chessboard position={fen} onPieceDrop={onDrop} boardWidth={400} />;
}
