import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

export default function ChatPanel({ liveClassId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        // Connect to Socket.IO server
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: {
                token: localStorage.getItem('token'),
            },
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat');
            newSocket.emit('joinClass', { liveClassId });
        });

        newSocket.on('chatMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        newSocket.on('chatHistory', (history) => {
            setMessages(history);
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leaveClass', { liveClassId });
            newSocket.close();
        };
    }, [liveClassId]);

    useEffect(() => {
        // Auto-scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('sendMessage', {
            liveClassId,
            message: newMessage.trim(),
        });

        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-white border border-admin-border rounded-lg">
            <div className="p-4 border-b border-admin-border">
                <h3 className="font-semibold text-admin-text">Live Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <p className="text-center text-admin-text-muted text-sm">
                        No messages yet
                    </p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="font-medium text-sm text-admin-text">
                                    {msg.sender?.name || msg.senderName || 'Anonymous'}
                                </span>
                                <span className="text-xs text-admin-text-muted">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                            <p className="text-sm text-admin-text mt-1">{msg.message}</p>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-admin-border">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="btn btn-primary px-4 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
