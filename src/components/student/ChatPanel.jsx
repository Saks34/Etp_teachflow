import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ChatPanel({ liveClassId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [connected, setConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const { user } = useAuth();

    const token = localStorage.getItem('accessToken'); // Ensure we grab the token

    useEffect(() => {
        if (!liveClassId || !token) return;

        // Connect to the Live Classes namespace
        const socket = io(`${API_BASE}/live-classes`, {
            auth: { token },
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to chat');
            setConnected(true);

            // Join the room
            // Students must provide batchId for validation
            const batchId = user?.batch?._id || user?.batch;

            socket.emit('join-room', {
                liveClassId,
                batchId,
                historyLimit: 50
            }, (ack) => {
                if (!ack?.ok) {
                    console.error('Failed to join chat room:', ack?.error);
                }
            });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from chat');
            setConnected(false);
        });

        // Listen for incoming messages
        socket.on('message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        // Listen for chat history
        socket.on('chat-history', (payload) => {
            if (payload && payload.messages) {
                setMessages(payload.messages);
            }
        });

        // Listen for system events (muted, cleared, etc.)
        socket.on('system', (evt) => {
            setMessages((prev) => [...prev, { ...evt, type: 'system' }]);

            // Handle specific system actions impacting the current user
            if (evt.type === 'muted' && evt.targetUserId === user._id) {
                setIsMuted(true);
            }
            if (evt.type === 'unmuted' && evt.targetUserId === user._id) {
                setIsMuted(false);
            }
            if (evt.type === 'chat-cleared') {
                setMessages((prev) => [...prev, { type: 'system', text: 'Chat history cleared by moderator' }]);
                // Optionally clear local array if desired, but adding a marker is often better
            }
        });

        return () => {
            if (socket) {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('message');
                socket.off('chat-history');
                socket.off('system');
                socket.emit('leave-room', { liveClassId });
                socket.disconnect();
            }
        };
    }, [liveClassId, token, user]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current || isMuted) return;

        const batchId = user?.batch?._id || user?.batch;

        socketRef.current.emit('send-message', {
            liveClassId,
            text: newMessage.trim(),
            batchId
        }, (ack) => {
            if (!ack?.ok) {
                console.error('Failed to send message:', ack?.error);
                if (ack?.error.includes('Muted')) {
                    setIsMuted(true);
                    alert('You have been muted by a moderator.');
                }
            } else {
                setNewMessage('');
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-white border border-admin-border rounded-lg shadow-sm">
            <div className="p-4 border-b border-admin-border flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-admin-text">Live Chat</h3>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-admin-text-muted">{connected ? 'Live' : 'Offline'}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-admin-text-muted opacity-60">
                        <p>No messages yet</p>
                        <p className="text-xs">Be the first to say hello! 👋</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        // System Message
                        if (msg.type === 'system') {
                            return (
                                <div key={index} className="flex justify-center my-2">
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full italic">
                                        {msg.text || msg.type}
                                    </span>
                                </div>
                            );
                        }

                        // Regular Message
                        const isMe = msg.senderId === user._id;
                        return (
                            <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-xs font-semibold text-admin-text-muted">
                                            {isMe ? 'You' : (msg.senderName || 'User')}
                                        </span>
                                        {msg.role === 'Teacher' && (
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded uppercase font-bold tracking-wider">
                                                TEACHER
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(msg.ts || msg.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <div
                                        className={`px-3 py-2 rounded-2xl text-sm ${isMe
                                                ? 'bg-violet-600 text-white rounded-tr-sm'
                                                : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                                            }`}
                                    >
                                        {msg.text || msg.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-admin-border bg-gray-50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isMuted ? "You have been muted" : "Type a message..."}
                        disabled={!connected || isMuted}
                        className="flex-1 px-4 py-2 bg-white border border-admin-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-60 disabled:bg-gray-100"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || !connected || isMuted}
                        className="btn btn-primary rounded-full w-10 h-10 flex items-center justify-center p-0 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-0.5">
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    </button>
                </div>
                {isMuted && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                        You are currently muted and cannot send messages.
                    </p>
                )}
            </form>
        </div>
    );
}
