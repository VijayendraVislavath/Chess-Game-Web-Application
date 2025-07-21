import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function History() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'games'),
      where('white', '==', auth.currentUser.email),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => setGames(snap.docs.map(d => d.data())));
  }, []);

  return (
    <aside>
      <h3>Past Games</h3>
      <ul>
        {games.map((g, i) => <li key={i}><code>{g.pgn.slice(0, 40)}…</code></li>)}
      </ul>
    </aside>
  );
}
