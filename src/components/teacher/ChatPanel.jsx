import { useEffect, useRef, useState } from 'react';
import {
    Send,
    MessageCircle,
    Trash2,
    Pin,
    MoreVertical,
    Clock,
    Ban,
    Eye,
    UserX,
    AlertCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { API_BASE } from '../../services/api';

export default function ChatPanel({ liveClassId, batchId, token, user }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [hoveredMsg, setHoveredMsg] = useState(null);
    const [slowMode, setSlowMode] = useState(0); // seconds, 0 = off
    const [chatPaused, setChatPaused] = useState(false);
    const [showTopChat, setShowTopChat] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    const bottomRef = useRef(null);
    const socketRef = useRef(null);

    const isTeacher = user?.role?.toLowerCase() === 'teacher' || user?.role === 'admin';
    const isModerator = isTeacher || user?.role?.toLowerCase() === 'moderator'; // Assuming moderator role exists or teacher acts as one

    // Initial connection
    useEffect(() => {
        if (!liveClassId || !token) return;

        const socket = io(API_BASE + '/live-classes', {
            auth: { token },
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setSocketConnected(true);
            console.log('Connected to chat server');
            socket.emit('join-room', { liveClassId, batchId, historyLimit: 50 }, (ack) => {
                if (!ack?.ok) {
                    console.error('Failed to join chat room:', ack?.error);
                    toast.error('Failed to connect to chat');
                }
            });
        });

        socket.on('disconnect', () => {
            setSocketConnected(false);
            console.log('Disconnected from chat server');
        });

        socket.on('chat-history', (payload) => {
            if (payload.liveClassId === liveClassId) {
                setMessages(payload.messages || []);
                setChatPaused(!!payload.chatPaused);
                setSlowMode(payload.slowMode || 0);
            }
        });

        socket.on('message', (msg) => {
            if (msg.liveClassId === liveClassId) {
                setMessages(prev => [...prev, msg]);
            }
        });

        socket.on('user-joined', (evt) => {
            // Optional: show user joined? The user asked to remove "user joined" messages in previous task.
            // We will respect that request and NOT add them to the visible list.
            // But we might want to update participant count or similar if we had that feature.
        });

        socket.on('user-left', (evt) => {
            // Same as above
        });

        socket.on('system', (evt) => {
            if (evt.liveClassId !== liveClassId) return;

            // Handle specific system events that update state
            if (evt.type === 'chat-cleared') {
                setMessages([]);
                toast('Chat cleared by moderator');
            } else if (evt.type === 'class-ended') {
                toast('Class ended');
                setChatPaused(true);
            } else if (evt.type === 'muted' && evt.targetUserId === user?.id) {
                toast.error('You have been muted');
            } else if (evt.type === 'unmuted' && evt.targetUserId === user?.id) {
                toast.success('You have been unmuted');
            } else if (evt.type === 'removed' && evt.targetUserId === user?.id) {
                toast.error('You have been removed from the class');
                // Optionally redirect or disconnect
            }

            // Add system message to chat log if it's relevant to everyone
            // E.g. "Chat cleared", "Slow mode enabled" (though slow mode has its own event usually)
            if (['chat-cleared', 'class-ended'].includes(evt.type)) {
                setMessages(prev => [...prev, { ...evt, role: 'system', text: evt.text || evt.type }]);
            }
        });

        socket.on('message-pinned', ({ messageId, isPinned }) => {
            setMessages(prev => prev.map(m => m.id === messageId || m._id === messageId ? { ...m, isPinned } : m));
        });

        socket.on('message-deleted', ({ messageId }) => {
            // Remove from view
            setMessages(prev => prev.filter(m => m.id !== messageId && m._id !== messageId));
        });

        socket.on('slow-mode-updated', ({ slowMode }) => {
            setSlowMode(slowMode);
            toast(slowMode > 0 ? `Slow mode: ${slowMode}s` : 'Slow mode disabled');
        });

        socket.on('chat-pause-updated', ({ paused }) => {
            setChatPaused(paused);
            toast(paused ? 'Chat paused' : 'Chat resumed');
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [liveClassId, batchId, token, user?.id]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, showTopChat]);

    const send = (e) => {
        e?.preventDefault();
        const trimmed = (text || '').trim();
        if (!trimmed) return;
        if (chatPaused && !isModerator) return;

        // Optimistic UI update? No, let's wait for ack or echo to ensure consistency, 
        // but standard pattern is echo from server. 
        // We will clear input immediately though.
        // Check slow mode locally first if student
        if (!isModerator && slowMode > 0) {
            // Find last message by me
            const myMsgs = messages.filter(m => m.senderId === user.id && m.type !== 'system');
            const last = myMsgs[myMsgs.length - 1];
            if (last) {
                const diff = (Date.now() - new Date(last.ts).getTime()) / 1000;
                if (diff < slowMode) {
                    toast.error(`Slow mode: wait ${Math.ceil(slowMode - diff)}s`);
                    return;
                }
            }
        }

        if (socketRef.current) {
            socketRef.current.emit('send-message', { liveClassId, text: trimmed, batchId }, (ack) => {
                if (!ack?.ok) {
                    toast.error(ack?.error || 'Failed to send');
                }
            });
        }
        setText('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(e);
        }
    };

    // Moderation Actions
    const deleteMessage = (msgId) => {
        if (!socketRef.current) return;
        socketRef.current.emit('delete-message', { liveClassId, messageId: msgId });
    };

    const pinMessage = (msgId, currentPinnedState) => {
        if (!socketRef.current) return;
        socketRef.current.emit('pin-message', { liveClassId, messageId: msgId, isPinned: !currentPinnedState });
    };

    const timeoutUser = (userId) => {
        if (!socketRef.current) return;
        socketRef.current.emit('mute-user', { liveClassId, targetUserId: userId }, (ack) => {
            if (ack?.ok) toast.success('User muted');
            else toast.error('Failed to mute');
        });
    };

    const hideUser = (userId) => {
        // "Hide user" usually means ban or remove. Let's map to remove-user for now.
        if (!confirm('Hide/Remove this user from class?')) return;
        if (!socketRef.current) return;
        socketRef.current.emit('remove-user', { liveClassId, targetUserId: userId }, (ack) => {
            if (ack?.ok) toast.success('User removed');
            else toast.error('Failed to remove');
        });
    };

    const toggleSlowMode = () => {
        if (!socketRef.current) return;
        const newMode = slowMode === 0 ? 5 : 0; // Toggle 5s or Off
        socketRef.current.emit('toggle-slow-mode', { liveClassId, duration: newMode });
    };

    const toggleChatPause = () => {
        if (!socketRef.current) return;
        socketRef.current.emit('toggle-chat-pause', { liveClassId, paused: !chatPaused });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const displayedMessages = showTopChat
        ? messages.filter(m => m.isPinned || m.role === 'Teacher' || m.role === 'teacher') // 'Teacher' from backend is capitalized usually? Checked model, it just stores string. Assuming 'Teacher' or 'teacher'
        : messages;

    return (
        <div className="rounded flex flex-col h-full bg-[#212121]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#303030]">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        Live chat
                        {!socketConnected && <span className="text-[10px] text-red-500">(Connecting...)</span>}
                    </h3>
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

                {/* Moderation Controls */}
                {isModerator && (
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={toggleSlowMode}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1 ${slowMode > 0
                                ? 'bg-yellow-600 text-white'
                                : 'bg-[#282828] text-gray-400 hover:bg-[#303030]'
                                }`}
                            title="Slow mode - limits how often users can send messages"
                        >
                            <Clock className="w-3 h-3" />
                            {slowMode > 0 ? `${slowMode}s` : 'Slow'}
                        </button>
                        <button
                            onClick={toggleChatPause}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1 ${chatPaused
                                ? 'bg-red-600 text-white'
                                : 'bg-[#282828] text-gray-400 hover:bg-[#303030]'
                                }`}
                            title={chatPaused ? 'Resume chat' : 'Pause chat'}
                        >
                            <Ban className="w-3 h-3" />
                            {chatPaused ? 'Resume' : 'Pause'}
                        </button>
                    </div>
                )}

                {/* Status Messages */}
                {slowMode > 0 && (
                    <div className="text-xs px-2 py-1.5 rounded mb-2 bg-yellow-900/20 text-yellow-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Slow mode: {slowMode} sec limit
                    </div>
                )}
                {chatPaused && (
                    <div className="text-xs px-2 py-1.5 rounded mb-2 bg-red-900/20 text-red-400 flex items-center gap-2">
                        <Ban className="w-3 h-3" />
                        Chat is paused
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
                <div className="space-y-1">
                    {displayedMessages.length === 0 ? (
                        <div className="text-center py-8">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                            <p className="text-sm text-gray-500">
                                No messages yet
                            </p>
                        </div>
                    ) : (
                        displayedMessages.map((m) => {
                            // Normalize ID
                            const msgId = m.id || m._id;

                            if (m.type === 'system') {
                                return (
                                    <div key={msgId} className="flex items-center gap-3 py-2 text-gray-500">
                                        <div className="flex-1 h-px bg-[#303030]"></div>
                                        <span className="text-xs italic flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" />
                                            {m.text}
                                        </span>
                                        <div className="flex-1 h-px bg-[#303030]"></div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={msgId}
                                    onMouseEnter={() => setHoveredMsg(msgId)}
                                    onMouseLeave={() => setHoveredMsg(null)}
                                    className={`group p-2 rounded transition ${m.isPinned
                                        ? 'bg-[#263850]'
                                        : 'hover:bg-[#282828]'
                                        }`}
                                >
                                    {/* Pinned Indicator */}
                                    {m.isPinned && (
                                        <div className="flex items-center gap-1 mb-1">
                                            <Pin className="w-3 h-3 text-[#3ea6ff]" />
                                            <span className="text-xs text-[#3ea6ff]">
                                                Pinned
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-2">
                                        {/* Avatar */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${m.role === 'Teacher' || m.role === 'teacher'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-[#3ea6ff] text-black'
                                            }`}>
                                            {m.senderName ? m.senderName.charAt(0) : 'U'}
                                        </div>

                                        {/* Message Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`text-xs font-medium ${m.role === 'Teacher' || m.role === 'teacher'
                                                    ? 'text-red-400'
                                                    : 'text-[#3ea6ff]'
                                                    }`}>
                                                    {m.senderName || 'User'}
                                                </span>
                                                {(m.role === 'Teacher' || m.role === 'teacher') && (
                                                    <span className="text-[9px] px-1 py-0.5 rounded bg-red-600/20 text-red-400 font-bold">
                                                        MOD
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-600">
                                                    {formatTime(m.ts)}
                                                </span>
                                            </div>
                                            <p className="text-xs mt-0.5 break-words text-gray-300">
                                                {m.text}
                                            </p>
                                        </div>

                                        {/* Moderation Menu (YouTube-style) */}
                                        {isModerator && m.senderId !== user?.id && (
                                            <div className={`flex-shrink-0 transition-opacity ${hoveredMsg === msgId ? 'opacity-100' : 'opacity-0'
                                                }`}>
                                                <div className="flex gap-0.5 rounded p-0.5 bg-[#282828]">
                                                    <button
                                                        onClick={() => pinMessage(msgId, m.isPinned)}
                                                        className="p-1 rounded transition hover:bg-[#303030]"
                                                        title={m.isPinned ? 'Unpin message' : 'Pin message'}
                                                    >
                                                        <Pin className={`w-3 h-3 ${m.isPinned ? 'text-[#3ea6ff]' : 'text-gray-400'
                                                            }`} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteMessage(msgId)}
                                                        className="p-1 rounded transition hover:bg-[#303030]"
                                                        title="Delete message"
                                                    >
                                                        <Trash2 className="w-3 h-3 text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => timeoutUser(m.senderId)}
                                                        className="p-1 rounded transition hover:bg-[#303030]"
                                                        title="Timeout user (Mute)"
                                                    >
                                                        <Clock className="w-3 h-3 text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => hideUser(m.senderId)}
                                                        className="p-1 rounded transition hover:bg-[#303030]"
                                                        title="Hide user from chat (Remove)"
                                                    >
                                                        <Eye className="w-3 h-3 text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="px-3 py-3 border-t border-[#303030]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={chatPaused && !isModerator ? 'Chat is paused' : isModerator ? 'Chat as moderator...' : 'Say something...'}
                        disabled={(!isModerator && chatPaused) || !socketConnected}
                        className="flex-1 px-3 py-2 rounded text-sm outline-none transition bg-[#0f0f0f] border-[#303030] text-white placeholder-gray-500 focus:border-[#3ea6ff] border disabled:opacity-50"
                    />
                    <button
                        onClick={send}
                        disabled={!text.trim() || (!isModerator && chatPaused)}
                        className="px-3 py-2 rounded text-sm font-medium transition bg-[#3ea6ff] hover:bg-[#65b8ff] text-black disabled:opacity-50"
                    >
                        <MessageCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
