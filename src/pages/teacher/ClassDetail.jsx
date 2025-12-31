import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StreamInfo from '../../components/teacher/StreamInfo';
import StatusBadge from '../../components/teacher/StatusBadge';
import ChatModal from '../../components/ChatModal';
import ModerationPanel from '../../components/ModerationPanel';
import { useAuth } from '../../context/AuthContext';

export default function ClassDetail() {
    const { id: liveClassId } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);
    const [streamKey, setStreamKey] = useState('');
    const [ingestionUrl, setIngestionUrl] = useState('');
    const [notes, setNotes] = useState([]);
    const [chatOpen, setChatOpen] = useState(false);
    const [noteForm, setNoteForm] = useState({ title: '', fileUrl: '', fileType: 'pdf' });
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [scheduling, setScheduling] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('accessToken') || '';

    useEffect(() => {
        loadClassData();
        loadNotes();
    }, [liveClassId]);

    // When classData updates, fetch the stream key using the REAL ID
    useEffect(() => {
        if (classData && classData._id) {
            loadStreamKey(classData._id);
        }
    }, [classData]);

    const loadClassData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/live-classes/by-timetable/${liveClassId}`);
            setClassData(data);
        } catch (error) {
            console.error('Failed to load class:', error);
            setError('Failed to load class details');
        } finally {
            setLoading(false);
        }
    };

    const loadStreamKey = async (realLiveClassId) => {
        if (!realLiveClassId) return;
        try {
            const { data } = await api.get(`/live-classes/${realLiveClassId}/stream-key`);
            setStreamKey(data.streamKey);
            setIngestionUrl(data.ingestionAddress);
        } catch (error) {
            console.error('Failed to load stream key:', error);
        }
    };

    const loadNotes = async () => {
        try {
            const { data } = await api.get('/notes', {
                params: { liveClassId },
            });
            setNotes(data.notes || []);
        } catch (error) {
            console.error('Failed to load notes:', error);
        }
    };

    const uploadNote = async (e) => {
        e.preventDefault();
        const { title, fileUrl, fileType } = noteForm;
        if (!title || !fileUrl) return alert('Title and File URL are required');

        try {
            await api.post('/notes', {
                title,
                fileUrl,
                fileType,
                liveClassId,
                batchId: classData.batchId,
                subjectId: classData.subjectId,
            });
            alert('Note uploaded successfully');
            setNoteForm({ title: '', fileUrl: '', fileType: 'pdf' });
            setShowNoteForm(false);
            loadNotes();
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to upload note');
        }
    };

    const deleteNote = async (noteId) => {
        if (!confirm('Delete this note?')) return;
        try {
            await api.delete(`/notes/${noteId}`);
            alert('Note deleted');
            loadNotes();
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to delete note');
        }
    };

    const handleCreateStream = async () => {
        console.log('[Frontend] 🎬 Create Stream button clicked');

        const realId = classData?._id;
        console.log('[Frontend] 📋 Class data:', {
            realId,
            timetableId: liveClassId,
            subject: classData?.subject,
            batch: classData?.batch,
            hasStreamInfo: !!classData?.streamInfo?.streamId
        });

        if (!realId) {
            console.error('[Frontend] ❌ Error: Class data not fully loaded');
            return alert('Error: Class data not fully loaded');
        }

        setScheduling(true);
        try {
            console.log(`[Frontend] 🚀 Calling API: POST /live-classes/${realId}/schedule`);
            const response = await api.post(`/live-classes/${realId}/schedule`);
            console.log('[Frontend] ✅ Stream created successfully:', response.data);
            alert('Stream created successfully! Use the URL and Key in OBS.');
            await loadClassData();
        } catch (error) {
            console.error('[Frontend] ❌ Failed to create stream:', {
                message: error?.response?.data?.message || error.message,
                status: error?.response?.status,
                data: error?.response?.data
            });
            alert(error?.response?.data?.message || 'Failed to create stream');
        } finally {
            setScheduling(false);
        }
    };

    const handleEndStream = async () => {
        console.log('[Frontend] 🛑 End Stream button clicked');

        const realId = classData?._id;
        console.log('[Frontend] 📋 Ending stream for LiveClass:', realId);

        if (!realId) {
            console.error('[Frontend] ❌ No LiveClass ID available');
            return;
        }

        setScheduling(true);
        try {
            console.log(`[Frontend] 🚀 Calling API: POST /live-classes/${realId}/end`);
            const response = await api.post(`/live-classes/${realId}/end`);
            console.log('[Frontend] ✅ Stream ended successfully:', response.data);
            alert('Stream ended successfully');
            await loadClassData();
        } catch (error) {
            console.error('[Frontend] ❌ Failed to end stream:', {
                message: error?.response?.data?.message || error.message,
                status: error?.response?.status,
                data: error?.response?.data
            });
            alert(error?.response?.data?.message || 'Failed to end stream');
        } finally {
            setScheduling(false);
        }
    };

    if (loading) {
        return <LoadingSpinner centered />;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={loadClassData} className="btn btn-secondary">Retry</button>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="p-8 text-center">
                <p className="text-admin-text-muted">Class not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="card p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-admin-text">{classData.subject}</h1>
                        <p className="text-admin-text-muted mt-1">
                            {classData.batch} • {classData.startTime} - {classData.endTime}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Create Stream Button */}
                        {!classData.streamInfo?.streamId && classData.status !== 'Completed' && classData.status !== 'Cancelled' && (
                            <button
                                onClick={handleCreateStream}
                                disabled={scheduling}
                                className="btn btn-primary"
                            >
                                {scheduling ? 'Creating...' : 'Create Stream'}
                            </button>
                        )}

                        {/* End Stream Button */}
                        {(classData.status === 'Scheduled' || classData.status === 'Live') && classData.streamInfo?.streamId && (
                            <button
                                onClick={handleEndStream}
                                disabled={scheduling}
                                className="btn btn-danger bg-red-600 hover:bg-red-700 text-white"
                            >
                                {scheduling ? 'Ending...' : 'End Stream'}
                            </button>
                        )}

                        <StatusBadge status={classData.status} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Stream Info */}
                <div className="space-y-6">
                    <StreamInfo
                        liveClassId={classData._id}
                        ytStatus={classData.ytStatus}
                        streamKey={streamKey}
                        ingestionUrl={ingestionUrl}
                        liveUrl={classData.streamInfo?.liveUrl}
                        broadcastId={classData.streamInfo?.broadcastId}
                    />

                    {/* Notes Section */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-admin-text">Class Notes</h3>
                            <button
                                onClick={() => setShowNoteForm(!showNoteForm)}
                                className="btn btn-primary text-sm"
                            >
                                {showNoteForm ? 'Cancel' : '+ Upload Note'}
                            </button>
                        </div>

                        {showNoteForm && (
                            <form onSubmit={uploadNote} className="space-y-3 mb-4 p-4 bg-gray-50 rounded border border-admin-border">
                                <div>
                                    <label className="block text-sm font-medium text-admin-text mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={noteForm.title}
                                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                        placeholder="e.g., Chapter 5 Notes"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-admin-text mb-1">
                                        File URL
                                    </label>
                                    <input
                                        type="url"
                                        className="input"
                                        value={noteForm.fileUrl}
                                        onChange={(e) => setNoteForm({ ...noteForm, fileUrl: e.target.value })}
                                        placeholder="https://..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-admin-text mb-1">
                                        File Type
                                    </label>
                                    <select
                                        className="input"
                                        value={noteForm.fileType}
                                        onChange={(e) => setNoteForm({ ...noteForm, fileType: e.target.value })}
                                    >
                                        <option value="pdf">PDF</option>
                                        <option value="image">Image</option>
                                        <option value="doc">Document</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary w-full">
                                    Upload
                                </button>
                            </form>
                        )}

                        {notes.length === 0 ? (
                            <p className="text-admin-text-muted text-center py-4">No notes uploaded yet</p>
                        ) : (
                            <div className="space-y-2">
                                {notes.map((note) => (
                                    <div
                                        key={note._id}
                                        className="flex items-center justify-between p-3 border border-admin-border rounded"
                                    >
                                        <div>
                                            <p className="font-medium text-admin-text">{note.title}</p>
                                            <p className="text-xs text-admin-text-muted">{note.fileType.toUpperCase()}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteNote(note._id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Chat & Moderation */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-admin-text mb-4">Live Chat</h3>
                        <button
                            onClick={() => setChatOpen(true)}
                            className="btn btn-primary w-full"
                        >
                            Open Chat Window
                        </button>
                    </div>

                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-admin-text mb-4">Moderation Controls</h3>
                        <ModerationPanel
                            liveClassId={classData._id}
                            batchId={classData.batchId}
                            token={token}
                        />
                    </div>
                </div>
            </div>

            {/* Chat Modal */}
            <ChatModal
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                liveClassId={classData._id}
                batchId={classData.batchId}
                token={token}
                user={user}
            />
        </div>
    );
}
