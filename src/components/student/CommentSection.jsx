import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Send, MessageCircle, MoreVertical, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommentSection({ liveClassId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    // Hardcoded Dark Theme for consistency
    const isDark = true;

    useEffect(() => {
        loadComments();
    }, [liveClassId]);

    const loadComments = async () => {
        try {
            const { data } = await api.get('/comments', { params: { liveClassId } });
            setComments(data.comments || []);
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await api.post('/comments', { liveClassId, text: newComment });
            setNewComment('');
            loadComments();
            toast.success('Comment posted');
        } catch (error) {
            console.error('Failed to add comment:', error);
            toast.error('Failed to post comment');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await api.delete(`/comments/${commentId}`);
            loadComments();
            toast.success('Comment deleted');
        } catch (error) {
            console.error('Failed to delete comment:', error);
            toast.error('Failed to delete comment');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="h-full flex flex-col bg-[#212121]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                        <MessageCircle className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-sm">No comments yet.</p>
                        <p className="text-xs">Be the first to start the discussion!</p>
                    </div>
                ) : (
                    comments.map((comment) => {
                        const isMe = user?._id === comment.user?._id;
                        const isTeacher = comment.user?.role === 'Teacher' || comment.user?.role === 'Admin'; // Assuming Admin might comment too

                        return (
                            <div key={comment._id} className="flex gap-3 group">
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isTeacher ? 'bg-red-600 text-white' :
                                        isMe ? 'bg-purple-600 text-white' :
                                            'bg-[#3ea6ff] text-black'
                                    }`}>
                                    {comment.user?.name?.[0] || 'U'}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium ${isTeacher ? 'text-red-400' :
                                                    isMe ? 'text-purple-400' :
                                                        'text-white'
                                                }`}>
                                                {comment.user?.name || 'Unknown User'}
                                            </span>
                                            {isTeacher && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-900 font-medium">
                                                    Teacher
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        {(isMe || user?.role === 'Teacher' || user?.role === 'Admin') && (
                                            <button
                                                onClick={() => handleDelete(comment._id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#303030] text-gray-400 hover:text-red-400 transition"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1 break-words leading-relaxed">
                                        {comment.text}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#303030] bg-[#212121]">
                <form onSubmit={handleAddComment} className="flex gap-3 items-end">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user?.name?.[0] || 'Y'}
                    </div>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#303030] rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3ea6ff] transition pr-10"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !newComment.trim()}
                            className="absolute right-1 top-1 p-1.5 rounded-full bg-[#3ea6ff] text-black hover:bg-[#65b8ff] disabled:opacity-0 disabled:pointer-events-none transition"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
