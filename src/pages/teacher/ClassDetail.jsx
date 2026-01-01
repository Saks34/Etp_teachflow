import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StreamInfo from '../../components/teacher/StreamInfo';
import StatusBadge from '../../components/teacher/StatusBadge';
import ChatPanel from '../../components/teacher/ChatPanel';
import ModerationPanel from '../../components/ModerationPanel';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Video, FileText, Settings, Upload, Trash2, ExternalLink } from 'lucide-react';

export default function ClassDetail() {
    const { id: liveClassId } = useParams();
    console.log('ClassDetail params:', { liveClassId, type: typeof liveClassId });
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);
    const [streamKey, setStreamKey] = useState('');
    const [ingestionUrl, setIngestionUrl] = useState('');
    const [notes, setNotes] = useState([]);
    const [noteForm, setNoteForm] = useState({ title: '', fileUrl: '', fileType: 'pdf' });
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [scheduling, setScheduling] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('accessToken') || '';

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const cardBg = isDark
        ? 'bg-gray-900/60 backdrop-blur-xl border-white/10'
        : 'bg-white/60 backdrop-blur-xl border-gray-200/50';
    const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900';

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
        // ... existing logic ...
        // console.log('[Frontend] 🎬 Create Stream button clicked');

        const realId = classData?._id;
        // ... logs ...

        if (!realId) {
            return alert('Error: Class data not fully loaded');
        }

        setScheduling(true);
        try {
            const response = await api.post(`/live-classes/${realId}/schedule`);
            alert('Stream created successfully! Use the URL and Key in OBS.');
            await loadClassData();
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to create stream');
        } finally {
            setScheduling(false);
        }
    };

    const handleEndStream = async () => {
        // ... existing logic ...
        const realId = classData?._id;
        if (!realId) return;

        setScheduling(true);
        try {
            await api.post(`/live-classes/${realId}/end`);
            alert('Stream ended successfully');
            await loadClassData();
        } catch (error) {
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
                <button onClick={loadClassData} className="px-4 py-2 bg-gray-200 rounded text-gray-800">Retry</button>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="p-8 text-center">
                <p className={textSecondary}>Class not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Bar */}
            <div className={`${cardBg} border rounded-2xl p-6 shadow-xl`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-2xl font-bold ${textPrimary} flex items-center gap-3`}>
                            {classData.subject}
                            <StatusBadge status={classData.status} />
                        </h1>
                        <p className={`${textSecondary} mt-1 font-medium`}>
                            {classData.batch} • {classData.startTime} - {classData.endTime}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Create Stream Button */}
                        {!classData.streamInfo?.streamId && classData.status !== 'Completed' && classData.status !== 'Cancelled' && (
                            <button
                                onClick={handleCreateStream}
                                disabled={scheduling}
                                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all font-medium flex items-center gap-2"
                            >
                                <Video size={18} />
                                {scheduling ? 'Creating...' : 'Create Stream'}
                            </button>
                        )}

                        {/* End Stream Button */}
                        {(classData.status === 'Scheduled' || classData.status === 'Live') && classData.streamInfo?.streamId && (
                            <button
                                onClick={handleEndStream}
                                disabled={scheduling}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg hover:shadow-red-500/30 transition-all font-medium"
                            >
                                {scheduling ? 'Ending...' : 'End Stream'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Stream Info & Notes (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <StreamInfo
                        liveClassId={classData._id}
                        ytStatus={classData.ytStatus}
                        streamKey={streamKey}
                        ingestionUrl={ingestionUrl}
                        liveUrl={classData.streamInfo?.liveUrl}
                        broadcastId={classData.streamInfo?.broadcastId}
                    />

                    {/* Notes Section */}
                    <div className={`${cardBg} border rounded-2xl p-6 shadow-xl`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
                                <FileText size={20} className={isDark ? 'text-violet-400' : 'text-violet-600'} />
                                Class Notes
                            </h3>
                            <button
                                onClick={() => setShowNoteForm(!showNoteForm)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isDark ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'} transition-all flex items-center gap-2`}
                            >
                                {showNoteForm ? 'Cancel' : <><Upload size={14} /> Upload Note</>}
                            </button>
                        </div>

                        {showNoteForm && (
                            <form onSubmit={uploadNote} className={`space-y-4 mb-6 p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                <div>
                                    <label className={`block text-sm font-medium ${textPrimary} mb-1`}>
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-violet-500 outline-none transition-all ${inputBg}`}
                                        value={noteForm.title}
                                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                        placeholder="e.g., Chapter 5 Notes"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${textPrimary} mb-1`}>
                                        File URL
                                    </label>
                                    <input
                                        type="url"
                                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-violet-500 outline-none transition-all ${inputBg}`}
                                        value={noteForm.fileUrl}
                                        onChange={(e) => setNoteForm({ ...noteForm, fileUrl: e.target.value })}
                                        placeholder="https://..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${textPrimary} mb-1`}>
                                        File Type
                                    </label>
                                    <select
                                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-violet-500 outline-none transition-all ${inputBg}`}
                                        value={noteForm.fileType}
                                        onChange={(e) => setNoteForm({ ...noteForm, fileType: e.target.value })}
                                    >
                                        <option value="pdf">PDF</option>
                                        <option value="image">Image</option>
                                        <option value="doc">Document</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-indigo-500/30 transition-all">
                                    Upload
                                </button>
                            </form>
                        )}

                        {notes.length === 0 ? (
                            <div className="text-center py-8">
                                <p className={textSecondary}>No notes uploaded yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notes.map((note) => (
                                    <div
                                        key={note._id}
                                        className={`flex items-center justify-between p-4 border rounded-xl ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                                                <FileText size={18} className={textSecondary} />
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${textPrimary}`}>{note.title}</p>
                                                <p className={`text-xs ${textSecondary} uppercase`}>{note.fileType}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <a
                                                href={note.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-blue-500/20 text-blue-400' : 'hover:bg-blue-100 text-blue-600'} transition-all`}
                                                title="View"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                            <button
                                                onClick={() => deleteNote(note._id)}
                                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'} transition-all`}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Chat & Moderation (1/3 width) */}
                <div className="space-y-6">
                    {/* Integrated Chat Panel */}
                    <div className="h-[600px] flex flex-col">
                        <ChatPanel
                            liveClassId={classData._id}
                            batchId={classData.batchId}
                            token={token}
                            user={user}
                        />
                    </div>

                    <div className={`${cardBg} border rounded-2xl p-6 shadow-xl`}>
                        <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                            <Settings size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                            Moderation Controls
                        </h3>
                        <ModerationPanel
                            liveClassId={classData._id}
                            batchId={classData.batchId}
                            token={token}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
