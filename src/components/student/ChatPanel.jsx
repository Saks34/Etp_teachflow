import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Send,
    MessageCircle,
    Smile,
    X,
    Pin,
    AlertCircle,
    Wifi,
    WifiOff,
    VolumeX,
    Clock,
    CheckCheck,
    Ban
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPanel({ liveClassId }) {
    // Hardcoded Dark Theme for consistency with Teacher Panel ("YouTube Studio" style)
    const isDark = true;
    const { user } = useAuth();

    // State
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [connected, setConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showTopChat, setShowTopChat] = useState(false);

    // Moderation State
    const [slowMode, setSlowMode] = useState(0); // seconds
    const [chatPaused, setChatPaused] = useState(false);
    const [lastMessageTime, setLastMessageTime] = useState(0);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const token = localStorage.getItem('accessToken');

    // Socket Connection
    useEffect(() => {
        if (!liveClassId || !token) return;

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
            if (msg.liveClassId === liveClassId) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        socket.on('chat-history', (payload) => {
            if (payload && payload.messages) {
                // Filter out join/leave messages as per request
                const filtered = payload.messages.filter(m => !(m.type === 'system' && (m.text === 'user-joined' || m.text === 'user-left')));
                setMessages(filtered);

                // Sync moderation state
                if (payload.slowMode !== undefined) setSlowMode(payload.slowMode);
                if (payload.chatPaused !== undefined) setChatPaused(payload.chatPaused);
            }
        });

        // Real-time Moderation Events
        socket.on('slow-mode-updated', ({ slowMode }) => {
            setSlowMode(slowMode);
            toast(slowMode > 0 ? `Slow mode: ${slowMode}s` : 'Slow mode disabled');
        });

        socket.on('chat-pause-updated', ({ paused }) => {
            setChatPaused(paused);
            toast(paused ? 'Chat paused by moderator' : 'Chat resumed');
        });

        socket.on('message-pinned', ({ messageId, isPinned }) => {
            setMessages(prev => prev.map(m => (m.id === messageId || m._id === messageId) ? { ...m, isPinned } : m));
        });

        socket.on('message-deleted', ({ messageId }) => {
            setMessages(prev => prev.filter(m => m.id !== messageId && m._id !== messageId));
        });

        socket.on('system', (evt) => {
            if (evt.liveClassId !== liveClassId) return;
            if (evt.type === 'user-joined' || evt.type === 'user-left') return;

            // Handle Mut/Unmute
            if (evt.type === 'muted' && evt.targetUserId === user._id) {
                setIsMuted(true);
                toast.error('You have been muted');
            }
            if (evt.type === 'unmuted' && evt.targetUserId === user._id) {
                setIsMuted(false);
                toast.success('You have been unmuted');
            }
            if (evt.type === 'chat-cleared') {
                setMessages([]);
                toast('Chat history cleared');
            }
            if (evt.type === 'class-ended') {
                setChatPaused(true);
                toast('Class ended');
            }

            // Show relevant system messages
            if (['chat-cleared', 'class-ended'].includes(evt.type)) {
                setMessages((prev) => [...prev, { ...evt, role: 'system', type: 'system', text: evt.text || evt.type }]);
            }
        });

        return () => {
            if (socket) {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('message');
                socket.off('chat-history');
                socket.off('system');
                socket.off('slow-mode-updated');
                socket.off('chat-pause-updated');
                socket.emit('leave-room', { liveClassId });
                socket.disconnect();
            }
        };
    }, [liveClassId, token, user]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showTopChat]);

    const handleSendMessage = (e) => {
        e?.preventDefault();
        const trimmed = newMessage.trim();

        if (!trimmed || !socketRef.current || isMuted) return;

        // Chat Pause Check
        if (chatPaused) {
            toast.error('Chat is currently paused');
            return;
        }

        // Slow Mode Check
        const now = Date.now();
        if (slowMode > 0) {
            const timeSinceLast = (now - lastMessageTime) / 1000;
            if (timeSinceLast < slowMode) {
                const waitTime = Math.ceil(slowMode - timeSinceLast);
                toast.error(`Slow mode: wait ${waitTime}s`);
                return;
            }
        }

        const batchId = user?.batch?._id || user?.batch;

        socketRef.current.emit('send-message', {
            liveClassId,
            text: trimmed,
            batchId
        }, (ack) => {
            if (!ack?.ok) {
                console.error('Failed to send message:', ack?.error);
                if (ack?.error.includes('Muted')) {
                    setIsMuted(true);
                    toast.error('You have been muted by a moderator.');
                }
            } else {
                setNewMessage('');
                setShowEmojiPicker(false);
                setLastMessageTime(Date.now());
            }
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const emojis = ['😊', '👍', '❤️', '🎉', '👏', '🔥', '💯', '✅', '🤔', '📚', '✏️', '💡'];

    const displayedMessages = showTopChat
        ? messages.filter(m => m.isPinned || m.role === 'Teacher' || m.role === 'teacher')
        : messages;

    return (
        <div className="flex flex-col h-full rounded bg-[#212121] border border-[#303030]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#303030]">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        Live chat
                        {!connected && <span className="text-[10px] text-red-500">(Connecting...)</span>}
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0f0f0f] border border-[#303030]">
                            {connected ? (
                                <Wifi className="w-3 h-3 text-green-500" />
                            ) : (
                                <WifiOff className="w-3 h-3 text-red-500" />
                            )}
                        </div>
                        <button
                            onClick={() => setShowTopChat(!showTopChat)}
                            className={`text-xs px-2 py-1 rounded font-medium transition ${showTopChat
                                ? 'bg-[#3ea6ff] text-black'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {showTopChat ? 'Show all' : 'Top chat'}
                        </button>
                    </div>
                </div>

                {/* Status Banners */}
                <div className="space-y-1">
                    {/* Pinned Messages */}
                    {messages.filter(m => m.isPinned).length > 0 && (
                        <div className="p-2 rounded bg-[#263850] border border-blue-900/50 mb-1">
                            <div className="flex items-start gap-2">
                                <Pin className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#3ea6ff]" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold text-[#3ea6ff] mb-0.5">
                                        Pinned by Teacher
                                    </p>
                                    <p className="text-xs text-white line-clamp-2">
                                        {messages.filter(m => m.isPinned)[0].text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {slowMode > 0 && (
                        <div className="text-xs px-2 py-1.5 rounded bg-yellow-900/20 text-yellow-400 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Slow mode: {slowMode} sec limit
                        </div>
                    )}
                    {chatPaused && (
                        <div className="text-xs px-2 py-1.5 rounded bg-red-900/20 text-red-400 flex items-center gap-2">
                            <Ban className="w-3 h-3" />
                            Chat is paused
                        </div>
                    )}
                    {isMuted && (
                        <div className="text-xs px-2 py-1.5 rounded bg-red-900/20 text-red-400 flex items-center gap-2">
                            <VolumeX className="w-3 h-3" />
                            You have been muted
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-3 py-2 bg-[#1f1f1f]">
                <div className="space-y-1">
                    {displayedMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-12 text-gray-500">
                            <MessageCircle className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-xs">Welcome to live chat!</p>
                        </div>
                    ) : (
                        displayedMessages.map((msg, idx) => {
                            if (msg.type === 'system') {
                                return (
                                    <div key={msg.id || idx} className="flex items-center gap-3 py-2 text-gray-500">
                                        <div className="flex-1 h-px bg-[#303030]"></div>
                                        <span className="text-xs italic flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" />
                                            {msg.text || msg.type}
                                        </span>
                                        <div className="flex-1 h-px bg-[#303030]"></div>
                                    </div>
                                );
                            }

                            const isMe = msg.senderId === user._id || msg.senderId === 'current';
                            const isTeacher = msg.role === 'Teacher' || msg.role === 'teacher';

                            return (
                                <div key={msg.id || idx} className={`group p-1.5 rounded hover:bg-[#282828] transition flex items-start gap-2 ${msg.isPinned ? 'bg-[#263850]/50' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0 ${isTeacher ? 'bg-red-600 text-white' :
                                            isMe ? 'bg-purple-600 text-white' : 'bg-[#3ea6ff] text-black'
                                        }`}>
                                        {isMe ? 'Y' : (msg.senderName ? msg.senderName.charAt(0) : 'U')}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`text-[11px] font-medium ${isTeacher ? 'text-red-400' :
                                                    isMe ? 'text-purple-400' : 'text-[#a2a2a2]'
                                                }`}>
                                                {isMe ? 'You' : (msg.senderName || 'User')}
                                            </span>
                                            {isTeacher && (
                                                <span className="text-[9px] px-1 py-0.5 rounded bg-red-600/20 text-red-400 font-bold leading-none">
                                                    MOD
                                                </span>
                                            )}
                                            <span className="text-[10px] text-gray-600">
                                                {msg.ts && formatTime(msg.ts)}
                                            </span>
                                        </div>
                                        <p className="text-[13px] leading-tight text-gray-300 break-words mt-0.5">
                                            {msg.text || msg.message}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="px-3 py-3 border-t border-[#303030] bg-[#212121]">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="mb-2 p-2 rounded bg-[#303030] border border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-400">Reactions</span>
                            <button onClick={() => setShowEmojiPicker(false)} className="text-gray-400 hover:text-white"><X className="w-3 h-3" /></button>
                        </div>
                        <div className="grid grid-cols-6 gap-1">
                            {emojis.map((emoji, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setNewMessage(prev => prev + emoji)}
                                    className="text-lg p-1 hover:bg-[#404040] rounded text-center transition"
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
                        disabled={!connected || isMuted || chatPaused}
                        className="p-2 rounded text-gray-400 hover:text-white transition disabled:opacity-50"
                    >
                        <Smile className="w-5 h-5" />
                    </button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            !connected ? 'Connecting...' :
                                chatPaused ? 'Chat is paused' :
                                    isMuted ? 'You are muted' :
                                        'Chat...'
                        }
                        disabled={!connected || isMuted || chatPaused}
                        className="flex-1 px-3 py-2 rounded-full text-sm outline-none bg-[#0f0f0f] border border-[#303030] text-white placeholder-gray-600 focus:border-[#3ea6ff] transition disabled:opacity-50"
                        maxLength={200}
                    />

                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !connected || isMuted || chatPaused}
                        className="p-2 rounded-full bg-[#303030] text-gray-400 hover:text-[#3ea6ff] hover:bg-[#263850] transition disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-[10px] text-gray-600 text-right mt-1 px-1">
                    {newMessage.length}/200
                </div>
            </div>
        </div>
    );
}
