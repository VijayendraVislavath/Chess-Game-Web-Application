import { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import Board from './components/Board';
import Chat from './components/Chat';
import History from './components/History';
import { socket } from './socket';

export default function App() {
  const [roomId, setRoomId] = useState(null);
  const [aiDepth, setAiDepth] = useState(10);

  function login() { signInWithPopup(auth, googleProvider); }
  function logout() { signOut(auth); }

  function createRoom() {
    socket.emit('createGame', { uid: auth.currentUser.uid });
    socket.once('gameCreated', id => setRoomId(id));
  }

  function joinRoom() {
    const id = prompt('Room code?');
    if (id) {
      socket.emit('joinGame', { gameId: id, uid: auth.currentUser.uid });
      setRoomId(id);
    }
  }

  return (
    <div className="app">
      {!auth.currentUser ? (
        <button onClick={login}>Login with Google</button>
      ) : (
        <>
          <header>
            <button onClick={logout}>Logout</button>
            <button onClick={createRoom}>Create Game</button>
            <button onClick={joinRoom}>Join Game</button>
            <label>
              AI depth
              <input
                type="number"
                min="1"
                max="20"
                value={aiDepth}
                onChange={e => setAiDepth(+e.target.value)}
              />
            </label>
          </header>
          <main>
            <Board roomId={roomId} aiDepth={aiDepth} />
            <Chat roomId={roomId} />
            <History />
          </main>
        </>
      )}
    </div>
  );
}
