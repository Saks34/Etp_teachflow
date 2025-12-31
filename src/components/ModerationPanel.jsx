import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../services/api';

export default function ModerationPanel({ liveClassId, batchId, token }) {
  const [connected, setConnected] = useState(false);
  const [info, setInfo] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    if (!liveClassId || !token) return;
    const url = `${API_BASE}`;
    const socket = io(url + '/live-classes', { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', { liveClassId, batchId, historyLimit: 0 }, (ack) => {
        if (!ack?.ok) setInfo(ack?.error || 'join failed');
      });
    });
    socket.on('disconnect', () => setConnected(false));

    return () => {
      try { socket.emit('leave-room', { liveClassId }); } catch {}
      socket.disconnect();
      socketRef.current = null;
    };
  }, [liveClassId, batchId, token]);

  const emit = (event, payload) => {
    const s = socketRef.current;
    if (!s) return;
    s.emit(event, payload, (ack) => {
      if (!ack?.ok) setInfo(ack?.error || `${event} failed`);
      else setInfo(`${event} ok`);
    });
  };

  if (!liveClassId) return null;

  return (
    <div style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Moderation</div>
      <div style={{ fontSize: 12, color: connected ? 'green' : 'red', marginBottom: 8 }}>
        {connected ? 'Connected' : 'Disconnected'} {info ? `- ${info}` : ''}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => emit('clear-chat', { liveClassId })}>Clear Chat</button>
        <button onClick={() => {
          const targetUserId = prompt('User ID to mute:');
          if (targetUserId) emit('mute-user', { liveClassId, targetUserId });
        }}>Mute User</button>
        <button onClick={() => {
          const targetUserId = prompt('User ID to unmute:');
          if (targetUserId) emit('unmute-user', { liveClassId, targetUserId });
        }}>Unmute User</button>
        <button onClick={() => {
          const targetUserId = prompt('User ID to remove:');
          if (targetUserId) emit('remove-user', { liveClassId, targetUserId });
        }}>Remove User</button>
      </div>
    </div>
  );
}
