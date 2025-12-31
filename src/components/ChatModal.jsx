import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../services/api';

export default function ChatModal({ open, onClose, liveClassId, batchId, token, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const url = `${API_BASE}`; // same origin as API
    const socket = io(url + '/live-classes', {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-room', { liveClassId, batchId, historyLimit: 50 }, (ack) => {
        if (!ack?.ok) {
          console.warn('join failed', ack?.error);
        }
      });
    });

    socket.on('chat-history', (payload) => {
      setMessages(payload.messages || []);
    });
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('system', (evt) => {
      setMessages((prev) => [...prev, { type: 'system', text: evt.type, ts: evt.ts, by: evt.by }]);
    });

    return () => {
      try { socket.emit('leave-room', { liveClassId }); } catch {}
      socket.disconnect();
      socketRef.current = null;
      setMessages([]);
    };
  }, [open, liveClassId, batchId, token]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const s = socketRef.current;
    if (!s) return;
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    s.emit('send-message', { liveClassId, text: trimmed, batchId }, (ack) => {
      if (!ack?.ok) console.warn('send failed', ack?.error);
    });
    setText('');
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div style={{ width: 420, maxHeight: '80vh', overflow: 'auto', background: '#fff', margin: '5% auto', padding: 16 }} onClick={(e) => e.stopPropagation()}>
        <h3>Live Chat</h3>
        <div style={{ border: '1px solid #ddd', padding: 8, height: 300, overflowY: 'auto' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ marginBottom: 6, fontSize: 14 }}>
              {m.type === 'system' ? (
                <em style={{ color: '#666' }}>
                  [system] {m.text} {m.by?.name ? `by ${m.by.name}` : ''}
                </em>
              ) : (
                <span>
                  <strong>{m.senderName || 'User'}</strong> <small>({m.role})</small>: {m.text}
                </span>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" style={{ flex: 1 }} />
          <button onClick={send}>Send</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
