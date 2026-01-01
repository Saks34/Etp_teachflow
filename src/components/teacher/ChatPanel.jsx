import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Send } from 'lucide-react';

export default function ChatPanel({ liveClassId, batchId, token, user }) {
    const { isDark } = useTheme();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const socketRef = useRef(null);
    const bottomRef = useRef(null);

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const bgCard = isDark ? 'bg-gray-800' : 'bg-white';
    const bgInput = isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

    useEffect(() => {
        if (!liveClassId) return;

        const url = `${API_BASE}`;
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
            try {
                socket.emit('leave-room', { liveClassId });
            } catch { }
            socket.disconnect();
            socketRef.current = null;
            setMessages([]);
        };
    }, [liveClassId, batchId, token]);

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = (e) => {
        e?.preventDefault();
        const s = socketRef.current;
        if (!s) return;
        const trimmed = (text || '').trim();
        if (!trimmed) return;
        s.emit('send-message', { liveClassId, text: trimmed, batchId }, (ack) => {
            if (!ack?.ok) console.warn('send failed', ack?.error);
        });
        setText('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(e);
        }
    };

    return (
        <div className={`${bgCard} rounded-2xl p-6 shadow-xl border ${borderColor} flex flex-col h-full`}>
            <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Live Chat</h3>

            {/* Messages Area */}
            <div className={`flex-1 border ${borderColor} rounded-lg p-4 mb-4 overflow-y-auto`} style={{ minHeight: '300px', maxHeight: '400px' }}>
                <div className="space-y-3">
                    {messages.length === 0 ? (
                        <p className={`${textSecondary} text-center text-sm py-4`}>
                            No messages yet. Start the conversation!
                        </p>
                    ) : (
                        messages.map((m, idx) => (
                            <div key={idx}>
                                {m.type === 'system' ? (
                                    <div className={`text-xs ${textSecondary} italic text-center py-1`}>
                                        {m.text} {m.by?.name && `by ${m.by.name}`}
                                    </div>
                                ) : (
                                    <div className={`${bgInput} rounded-lg p-3`}>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className={`font-semibold text-sm ${textPrimary}`}>
                                                {m.senderName || 'User'}
                                            </span>
                                            <span className={`text-xs ${textSecondary}`}>
                                                ({m.role})
                                            </span>
                                        </div>
                                        <p className={`text-sm ${textPrimary}`}>{m.text}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Input Area */}
            <form onSubmit={send} className="flex gap-2">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${bgInput} focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm`}
                />
                <button
                    type="submit"
                    className="btn btn-primary bg-gradient-to-r from-violet-600 to-purple-600 border-none px-4 py-2 flex items-center gap-2"
                >
                    <Send size={16} />
                    <span className="hidden sm:inline">Send</span>
                </button>
            </form>
        </div>
    );
}
