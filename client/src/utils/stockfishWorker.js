export default function createEngine(depth = 10) {
  const worker = new Worker('/stockfish-nnue-16-single.js');
  worker.postMessage('uci');
  worker.postMessage('isready');
  worker.postMessage('ucinewgame');

  function getBestMove(fen) {
    return new Promise(res => {
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${depth}`);
      worker.onmessage = e => {
        if (e.data.startsWith('bestmove')) {
          const move = e.data.split(' ')[1];
          res(move);
        }
      };
    });
  }
  return { getBestMove };
}
