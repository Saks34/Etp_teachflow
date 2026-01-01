import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
    Send,
    Users,
    MessageCircle,
    Shield,
    Ban,
    Trash2,
    Pin,
    UserX,
    Search,
    MoreVertical,
    Clock,
    Smile,
    X
} from 'lucide-react';

export default function ChatPanel({ liveClassId, batchId, token, user }) {
    const { isDark } = useTheme();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('chat'); // chat, participants
    const [slowMode, setSlowMode] = useState(false);
    const [chatPaused, setChatPaused] = useState(false);
    const [participants, setParticipants] = useState([]); // This would ideally come from socket too
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const bottomRef = useRef(null);
    const socketRef = useRef(null);

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
            const msgs = payload.messages || [];
            setMessages(msgs.filter(m => !(m.type === 'system' && m.text === 'user-joined')));
        });

        socket.on('message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on('system', (evt) => {
            if (evt.type === 'user-joined') return;
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
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const send = (e) => {
        e?.preventDefault();
        const s = socketRef.current;
        if (!s) return;

        const trimmed = (text || '').trim();
        if (!trimmed || chatPaused) return;

        s.emit('send-message', { liveClassId, text: trimmed, batchId }, (ack) => {
            if (!ack?.ok) console.warn('send failed', ack?.error);
        });
        setText('');
        setShowEmojiPicker(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(e);
        }
    };

    // Mock functions for UI only - backend implementation would be needed for real functionality
    const deleteMessage = (msgId) => {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        setSelectedMessage(null);
    };

    const pinMessage = (msgId) => {
        setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, isPinned: !m.isPinned } : m
        ));
        setSelectedMessage(null);
    };

    const muteUser = (userId) => {
        alert(`User ${userId} has been muted`);
        setSelectedMessage(null);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const filteredMessages = messages.filter(m =>
        !searchQuery ||
        (m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.senderName && m.senderName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const emojis = ['😊', '👍', '❤️', '🎉', '👏', '🔥', '💯', '✅'];

    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

    return (
        <div className={`rounded-2xl shadow-xl border flex flex-col h-full transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Live Chat
                            </h3>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {participants.length} online
                            </p>
                        </div>
                    </div>

                    {/* Moderation Controls (Teacher Only) */}
                    {isTeacher && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSlowMode(!slowMode)}
                                className={`p-2 rounded-lg transition-all ${slowMode
                                    ? 'bg-yellow-500 text-white'
                                    : isDark
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                title="Slow Mode"
                            >
                                <Clock className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setChatPaused(!chatPaused)}
                                className={`p-2 rounded-lg transition-all ${chatPaused
                                    ? 'bg-red-500 text-white'
                                    : isDark
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                title={chatPaused ? 'Resume Chat' : 'Pause Chat'}
                            >
                                {chatPaused ? <Ban className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'chat'
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                            : isDark
                                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        <MessageCircle className="w-4 h-4 inline mr-2" />
                        Messages
                    </button>
                    <button
                        onClick={() => setActiveTab('participants')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'participants'
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                            : isDark
                                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        Participants
                    </button>
                </div>

                {/* Search Bar */}
                {activeTab === 'chat' && (
                    <div className="mt-3 relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'
                            }`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search messages..."
                            className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none transition-all ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-violet-500'
                                } border`}
                        />
                    </div>
                )}

                {/* Status Messages */}
                {slowMode && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs text-yellow-700 dark:text-yellow-300">
                            Slow mode enabled: 5 second cooldown between messages
                        </span>
                    </div>
                )}
                {chatPaused && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                        <Ban className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs text-red-700 dark:text-red-300">
                            Chat is paused by teacher
                        </span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === 'chat' ? (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="space-y-3">
                                {filteredMessages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageCircle className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'
                                            }`} />
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {searchQuery ? 'No messages found' : 'No messages yet. Start the conversation!'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredMessages.map((m, idx) => (
                                        <div key={m.id || idx}>
                                            {m.type === 'system' ? (
                                                <div className={`text-xs text-center py-2 flex items-center justify-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'
                                                    }`}>
                                                    <div className={`h-px flex-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                                    <span className="italic">{m.text} {m.by?.name && `by ${m.by.name}`}</span>
                                                    <div className={`h-px flex-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                                </div>
                                            ) : (
                                                <div className={`group relative rounded-xl p-3 transition-all ${m.isPinned
                                                    ? isDark
                                                        ? 'bg-violet-900/20 border border-violet-700'
                                                        : 'bg-violet-50 border border-violet-200'
                                                    : isDark
                                                        ? 'bg-gray-700/50 hover:bg-gray-700'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                    }`}>
                                                    {m.isPinned && (
                                                        <div className="absolute -top-2 -right-2">
                                                            <div className="bg-violet-600 text-white rounded-full p-1">
                                                                <Pin className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <span className={`font-semibold text-sm ${m.role === 'teacher'
                                                                    ? 'text-violet-600 dark:text-violet-400'
                                                                    : isDark ? 'text-white' : 'text-gray-900'
                                                                    }`}>
                                                                    {m.senderName || 'User'}
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.role === 'teacher'
                                                                    ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300'
                                                                    : isDark
                                                                        ? 'bg-gray-600 text-gray-300'
                                                                        : 'bg-gray-200 text-gray-600'
                                                                    }`}>
                                                                    {m.role || 'student'}
                                                                </span>
                                                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                    {m.ts && formatTime(m.ts)}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm break-words ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                                {m.text}
                                                            </p>
                                                        </div>

                                                        {/* Message Actions */}
                                                        {isTeacher && (
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => setSelectedMessage(selectedMessage === m.id ? null : m.id)}
                                                                    className={`p-1.5 rounded-lg transition-colors ${isDark
                                                                        ? 'hover:bg-gray-600 text-gray-400'
                                                                        : 'hover:bg-gray-200 text-gray-500'
                                                                        }`}
                                                                >
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </button>

                                                                {selectedMessage === m.id && (
                                                                    <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border z-10 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                                                        }`}>
                                                                        <button
                                                                            onClick={() => pinMessage(m.id)}
                                                                            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${isDark
                                                                                ? 'hover:bg-gray-700 text-gray-300'
                                                                                : 'hover:bg-gray-50 text-gray-700'
                                                                                }`}
                                                                        >
                                                                            <Pin className="w-4 h-4" />
                                                                            {m.isPinned ? 'Unpin' : 'Pin'} Message
                                                                        </button>
                                                                        <button
                                                                            onClick={() => deleteMessage(m.id)}
                                                                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                            Delete Message
                                                                        </button>
                                                                        <button
                                                                            onClick={() => muteUser(m.userId)}
                                                                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                                                                        >
                                                                            <UserX className="w-4 h-4" />
                                                                            Mute User
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                                <div ref={bottomRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className={`mb-3 p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Quick Reactions
                                        </span>
                                        <button
                                            onClick={() => setShowEmojiPicker(false)}
                                            className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                                                }`}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        {emojis.map((emoji, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setText(prev => prev + emoji);
                                                    setShowEmojiPicker(false);
                                                }}
                                                className={`text-2xl p-2 rounded-lg transition-transform hover:scale-125 ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                                                    }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-2.5 rounded-lg transition-colors ${isDark
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    title="Emojis"
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={chatPaused ? 'Chat is paused' : 'Type a message...'}
                                    disabled={chatPaused}
                                    className={`flex-1 px-4 py-2.5 rounded-lg border outline-none transition-all text-sm ${isDark
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500'
                                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-violet-500'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                />
                                <button
                                    onClick={send}
                                    disabled={chatPaused || !text.trim()}
                                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span className="hidden sm:inline">Send</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Participants List */
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <div className="space-y-2">
                            {participants.length === 0 ? (
                                <div className="text-center py-8 text-sm text-gray-500">
                                    No active participants visible.
                                </div>
                            ) : (
                                participants.map((p) => (
                                    <div
                                        key={p.id}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${isDark
                                            ? 'bg-gray-700/50 hover:bg-gray-700'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${p.role === 'teacher'
                                                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                                                    : isDark
                                                        ? 'bg-gray-600 text-white'
                                                        : 'bg-gray-200 text-gray-700'
                                                    }`}>
                                                    {p.name.charAt(0)}
                                                </div>
                                                {p.isOnline && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {p.name}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.role === 'teacher'
                                                        ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300'
                                                        : isDark
                                                            ? 'bg-gray-600 text-gray-300'
                                                            : 'bg-gray-200 text-gray-600'
                                                        }`}>
                                                        {p.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {isTeacher && p.role !== 'teacher' && (
                                            <button
                                                onClick={() => muteUser(p.id)}
                                                className={`p-2 rounded-lg transition-colors ${isDark
                                                    ? 'hover:bg-gray-600 text-gray-400'
                                                    : 'hover:bg-gray-200 text-gray-500'
                                                    }`}
                                                title="Mute user"
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
