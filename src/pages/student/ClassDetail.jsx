import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/teacher/StatusBadge';
import ChatPanel from '../../components/student/ChatPanel';
import NotesList from '../../components/student/NotesList';
import { useAuth } from '../../context/AuthContext';
import CustomYouTubePlayer from '../../components/shared/CustomYouTubePlayer';

export default function StudentClassDetail() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        loadClassData();
        loadNotes();
    }, [id]);

    const loadClassData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/live-classes/${id}`);
            console.log('Class Data Received:', data);
            setClassData(data);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to load class details');
        } finally {
            setLoading(false);
        }
    };

    const loadNotes = async () => {
        try {
            const batchId = user?.batch?._id || user?.batch;
            if (!batchId) return;

            const { data } = await api.get('/notes/by-batch', {
                params: { batchId },
            });
            setNotes(data.notes || []);
        } catch (e) {
            console.error('Failed to load notes:', e);
        }
    };

    if (loading) {
        return <LoadingSpinner centered />;
    }

    if (error || !classData) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error || 'Class not found'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Class Info Bar */}
            <div className="card p-5">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-admin-text">
                            {classData.subject}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-admin-text-muted">
                            <span>
                                Teacher: {classData.teacher?.name || 'Not assigned'}
                            </span>
                            <span>•</span>
                            <span>Batch: {classData.batch?.name || classData.batch}</span>
                            <span>•</span>
                            <span>
                                {classData.startTime} - {classData.endTime}
                            </span>
                        </div>
                    </div>
                    <StatusBadge status={classData.status} />
                </div>
            </div>

            {/* Main Content: Video + Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Player */}
                <div className="lg:col-span-2">
                    <div className="card p-0 overflow-hidden h-[450px]">
                        {classData.youtubeUrl || classData.streamInfo?.liveUrl || classData.streamInfo?.broadcastId ? (
                            <CustomYouTubePlayer
                                videoId={
                                    classData.streamInfo?.broadcastId ||
                                    classData.streamInfo?.liveUrl?.split('v=')[1]?.split('&')[0] ||
                                    classData.youtubeUrl?.split('v=')[1]?.split('&')[0]
                                }
                                autoplay={true}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <p className="text-admin-text-muted">
                                    Live stream will appear here
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Panel */}
                <div className="lg:col-span-1">
                    <div className="h-[500px]">
                        <ChatPanel liveClassId={id} />
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <section>
                <h2 className="text-xl font-semibold text-admin-text mb-4">
                    Study Materials
                </h2>
                <NotesList notes={notes} loading={false} />
            </section>
        </div>
    );
}
