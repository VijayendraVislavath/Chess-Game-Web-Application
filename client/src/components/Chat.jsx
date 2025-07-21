import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { auth } from '../firebase';

export default function Chat({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    socket.on('chat', msg => setMessages(prev => [...prev, msg]));
    socket.on('system', msg => setMessages(prev => [...prev, { uid: 'SYS', text: msg }]));
    return () => socket.off('chat').off('system');
  }, []);

  function send() {
    if (!text.trim()) return;
    socket.emit('chat', { roomId, uid: auth.currentUser.uid, text });
    setText('');
  }

  return (
    <div className="chat">
      <ul>{messages.map((m, i) => <li key={i}><b>{m.uid}</b>: {m.text}</li>)}</ul>
      <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} />
      <button onClick={send}>Send</button>
    </div>
  );
}
