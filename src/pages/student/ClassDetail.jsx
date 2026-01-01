import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/teacher/StatusBadge';
import ChatPanel from '../../components/student/ChatPanel';
import NotesList from '../../components/student/NotesList';
import { useAuth } from '../../context/AuthContext';
import CustomYouTubePlayer from '../../components/shared/CustomYouTubePlayer';
import CommentSection from '../../components/student/CommentSection';
import usePageTitle from '../../hooks/usePageTitle';

export default function StudentClassDetail() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    usePageTitle(classData?.subject || 'Class Detail', 'Student');

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
                    <div className="card p-0 overflow-hidden h-[450px] relative">
                        {/* LIVE Indicator Badge */}
                        {classData.status === 'Live' && (
                            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold shadow-lg animate-pulse">
                                <span className="w-3 h-3 bg-white rounded-full"></span>
                                <span>LIVE NOW</span>
                            </div>
                        )}

                        {/* Stream Ended Overlay */}
                        {classData.status === 'Completed' && (
                            <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-gray-800 bg-opacity-90 text-white rounded-lg text-sm font-semibold shadow-lg">
                                📹 Stream Ended - Recording Available
                            </div>
                        )}

                        {classData.youtubeUrl || classData.streamInfo?.liveUrl || classData.streamInfo?.broadcastId ? (
                            <CustomYouTubePlayer
                                videoId={
                                    (classData.status === 'Completed' && classData.recordings?.length > 0)
                                        ? classData.recordings[0].youtubeVideoId
                                        : (classData.streamInfo?.broadcastId ||
                                            classData.streamInfo?.liveUrl?.split('v=')[1]?.split('&')[0] ||
                                            classData.youtubeUrl?.split('v=')[1]?.split('&')[0])
                                }
                                autoplay={true}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-8 text-center">
                                <div className="text-6xl mb-4">📺</div>
                                <p className="text-lg font-semibold text-admin-text mb-2">
                                    {classData.status === 'Scheduled' ? 'Stream Not Started Yet' : 'No Stream Available'}
                                </p>
                                <p className="text-sm text-admin-text-muted">
                                    {classData.status === 'Scheduled'
                                        ? 'The teacher will start the stream soon. Please wait...'
                                        : 'This class does not have a live stream.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Panel (Live) or Comments (VOD) */}
                <div className="lg:col-span-1">
                    {classData.status === 'Completed' ? (
                        <div className="h-[500px] overflow-y-auto">
                            {/* Comments are typically long lists, so let's put them below or replace chat? 
                               Actually, standard layout is chat on right for live. 
                               For VOD, chat usually disappears or becomes read-only replay. 
                               Requested feature is "Comments". Let's put comments below video or here. 
                               Putting here to maintain layout. */}
                            <CommentSection liveClassId={id} />
                        </div>
                    ) : (
                        <div className="h-[500px]">
                            <ChatPanel liveClassId={id} />
                        </div>
                    )}
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
