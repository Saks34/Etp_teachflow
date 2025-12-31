import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CommentSection({ liveClassId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

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
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert('Failed to post comment');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await api.delete(`/comments/${commentId}`);
            loadComments();
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    return (
        <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-admin-text mb-4">Class Discussion</h3>

            {/* Input */}
            <form onSubmit={handleAddComment} className="mb-6 flex gap-3">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask a question or share your thoughts..."
                    className="flex-1 input"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="btn btn-primary whitespace-nowrap"
                    disabled={loading || !newComment.trim()}
                >
                    {loading ? 'Posting...' : 'Post Comment'}
                </button>
            </form>

            {/* List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-admin-text-muted text-center py-4">No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm shrink-0">
                                {comment.user?.name?.[0] || '?'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-medium text-admin-text">{comment.user?.name}</span>
                                    <span className="text-xs text-admin-text-muted">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                    {(user?._id === comment.user?._id || user?.role === 'Teacher') && (
                                        <button
                                            onClick={() => handleDelete(comment._id)}
                                            className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <p className="text-admin-text mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
