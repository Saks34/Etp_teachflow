import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    Send,
    MessageCircle,
    Users,
    Smile,
    X,
    Pin,
    AlertCircle,
    Wifi,
    WifiOff,
    Volume2,
    VolumeX,
    Clock,
    CheckCheck,
    Search
} from 'lucide-react';

export default function ChatPanel({ liveClassId }) {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [connected, setConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        if (!liveClassId || !token) return;

        // Connect to the Live Classes namespace
        const socket = io(`${API_BASE}/live-classes`, {
            auth: { token },
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);

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
            setConnected(false);
        });

        socket.on('message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on('chat-history', (payload) => {
            if (payload && payload.messages) {
                setMessages(payload.messages.filter(m => !(m.type === 'system' && (m.text === 'user-joined' || m.text === 'user-left'))));
            }
        });

        socket.on('system', (evt) => {
            if (evt.type === 'user-joined' || evt.type === 'user-left') return;
            setMessages((prev) => [...prev, { ...evt, type: 'system' }]);

            if (evt.type === 'muted' && evt.targetUserId === user._id) {
                setIsMuted(true);
            }
            if (evt.type === 'unmuted' && evt.targetUserId === user._id) {
                setIsMuted(false);
            }
            if (evt.type === 'chat-cleared') {
                setMessages((prev) => [...prev, { type: 'system', text: 'Chat history cleared by moderator' }]);
            }
        });

        // Mock listener for participant count if available in future
        // socket.on('room-users', ({ count }) => setOnlineCount(count));

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current || isMuted) return;

        const batchId = user?.batch?._id || user?.batch; // Ensure compatibility

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
                setShowEmojiPicker(false);
            }
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const emojis = ['😊', '👍', '❤️', '🎉', '👏', '🔥', '💯', '✅', '🤔', '📚', '✏️', '💡'];

    const filteredMessages = (searchQuery
        ? messages.filter(m =>
            m.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.senderName && m.senderName.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : messages).filter(m => !(m.type === 'system' && (m.text === 'user-joined' || m.text === 'user-left')));

    const pinnedMessages = messages.filter(m => m.isPinned);

    return (
        <div className={`flex flex-col h-full rounded-2xl shadow-xl border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Live Chat
                            </h3>
                            <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1.5">
                                    {connected ? (
                                        <>
                                            <Wifi className="w-3.5 h-3.5 text-green-500" />
                                            <span className={isDark ? 'text-green-400' : 'text-green-600'}>Connected</span>
                                        </>
                                    ) : (
                                        <>
                                            <WifiOff className="w-3.5 h-3.5 text-red-500" />
                                            <span className={isDark ? 'text-red-400' : 'text-red-600'}>Disconnected</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Pinned Messages */}
                {pinnedMessages.length > 0 && (
                    <div className={`mt-3 p-3 rounded-lg border ${isDark ? 'bg-violet-900/20 border-violet-800' : 'bg-violet-50 border-violet-200'
                        }`}>
                        <div className="flex items-start gap-2">
                            <Pin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-violet-400' : 'text-violet-600'
                                }`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-violet-300' : 'text-violet-700'
                                    }`}>
                                    Pinned by Teacher
                                </p>
                                <p className={`text-sm ${isDark ? 'text-violet-200' : 'text-violet-800'}`}>
                                    {pinnedMessages[0].text}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Messages */}
                {isMuted && (
                    <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                        }`}>
                        <VolumeX className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                        <span className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                            You have been muted by the teacher
                        </span>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-3">
                    {filteredMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-12">
                            <MessageCircle className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'
                                }`} />
                            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                {searchQuery ? 'No messages found' : 'No messages yet'}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {searchQuery ? 'Try a different search term' : 'Be the first to say hello! 👋'}
                            </p>
                        </div>
                    ) : (
                        filteredMessages.map((msg, idx) => {
                            if (msg.type === 'system') {
                                return (
                                    <div key={msg.id || idx} className={`flex items-center gap-3 py-2 ${isDark ? 'text-gray-500' : 'text-gray-400'
                                        }`}>
                                        <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                        <span className="text-xs italic flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" />
                                            {msg.text || msg.type}
                                        </span>
                                        <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                    </div>
                                );
                            }

                            const isMe = msg.senderId === user._id || msg.senderId === 'current';
                            const isTeacher = msg.role === 'Teacher';

                            return (
                                <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                        {/* Message Header */}
                                        <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <span className={`text-xs font-semibold ${isTeacher
                                                ? 'text-violet-600 dark:text-violet-400'
                                                : isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                {isMe ? 'You' : (msg.senderName || 'User')}
                                            </span>
                                            {isTeacher && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                                                    Teacher
                                                </span>
                                            )}
                                            <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {msg.ts && formatTime(msg.ts)}
                                            </span>
                                        </div>

                                        {/* Message Bubble */}
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl text-sm break-words ${isMe
                                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-tr-sm'
                                                : isTeacher
                                                    ? isDark
                                                        ? 'bg-violet-900/30 text-violet-200 border border-violet-700 rounded-tl-sm'
                                                        : 'bg-violet-50 text-violet-900 border border-violet-200 rounded-tl-sm'
                                                    : isDark
                                                        ? 'bg-gray-700 text-gray-200 rounded-tl-sm'
                                                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                                                }`}
                                        >
                                            {msg.text || msg.message}
                                        </div>

                                        {/* Read Receipt (for own messages) */}
                                        {isMe && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <CheckCheck className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                                                <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    Delivered
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className={`mb-3 p-3 rounded-xl border transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Quick Reactions
                            </span>
                            <button
                                onClick={() => setShowEmojiPicker(false)}
                                className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                                    }`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {emojis.map((emoji, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setNewMessage(prev => prev + emoji);
                                    }}
                                    className={`text-2xl p-2 rounded-lg transition-all hover:scale-125 ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message Input */}
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            disabled={!connected || isMuted}
                            className={`p-2.5 rounded-lg transition-all ${showEmojiPicker
                                ? 'bg-violet-600 text-white'
                                : isDark
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
                                }`}
                            title="Emojis"
                        >
                            <Smile className="w-5 h-5" />
                        </button>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={
                                !connected
                                    ? 'Connecting...'
                                    : isMuted
                                        ? 'You have been muted'
                                        : 'Type a message...'
                            }
                            disabled={!connected || isMuted}
                            className={`flex-1 px-4 py-2.5 rounded-xl border outline-none transition-all text-sm ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-violet-500'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        />

                        <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || !connected || isMuted}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </div>

                    {/* Helper Text */}
                    {!connected && (
                        <p className={`text-xs flex items-center gap-1.5 ${isDark ? 'text-orange-400' : 'text-orange-600'
                            }`}>
                            <Clock className="w-3 h-3" />
                            Reconnecting to chat...
                        </p>
                    )}
                    {isMuted && (
                        <p className={`text-xs flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'
                            }`}>
                            <VolumeX className="w-3 h-3" />
                            You are currently muted and cannot send messages
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
