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
import { useTheme } from '../../context/ThemeContext';
import { Video, BookOpen, Clock, User } from 'lucide-react';

export default function StudentClassDetail() {
    const { id } = useParams();
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    usePageTitle(classData?.subject || 'Class Detail', 'Student');

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const cardBg = isDark
        ? 'bg-gray-900/60 backdrop-blur-xl border-white/10'
        : 'bg-white/60 backdrop-blur-xl border-gray-200/50';

    useEffect(() => {
        loadClassData();
        loadNotes();
    }, [id]);

    const loadClassData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/live-classes/${id}`);
            // console.log('Class Data Received:', data);
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
            <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {error || 'Class not found'}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Class Info Bar */}
            <div className={`${cardBg} border rounded-2xl p-6 shadow-xl`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className={`text-3xl font-bold ${textPrimary}`}>
                                {classData.subject}
                            </h1>
                            <StatusBadge status={classData.status} />
                        </div>

                        <div className={`flex flex-wrap items-center gap-6 text-sm ${textSecondary} font-medium`}>
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-violet-500" />
                                <span>Teacher: <span className={textPrimary}>{classData.teacher?.name || 'Not assigned'}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen size={16} className="text-violet-500" />
                                <span>Batch: <span className={textPrimary}>{classData.batch?.name || classData.batch}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-violet-500" />
                                <span>{classData.startTime} - {classData.endTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content: Video + Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Player */}
                <div className="lg:col-span-2">
                    <div className={`${cardBg} border rounded-2xl overflow-hidden shadow-2xl relative aspect-video group`}>
                        {/* LIVE Indicator Badge */}
                        {classData.status === 'Live' && (
                            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold shadow-lg shadow-red-600/20 animate-pulse pointer-events-none">
                                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                                <span>LIVE NOW</span>
                            </div>
                        )}

                        {/* Stream Ended Overlay */}
                        {classData.status === 'Completed' && (
                            <div className="absolute top-4 left-4 z-20 px-4 py-2 bg-zinc-900/90 backdrop-blur text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 pointer-events-none">
                                <Video size={14} className="text-emerald-400" />
                                Stream Ended • Recording Available
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
                            <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-900`}>
                                <div className={`p-6 rounded-full bg-zinc-800 mb-6 group-hover:scale-110 transition-transform`}>
                                    <Video size={48} className="text-zinc-600" />
                                </div>
                                <p className={`text-xl font-bold text-zinc-300 mb-2`}>
                                    {classData.status === 'Scheduled' ? 'Stream Not Started Yet' : 'No Stream Available'}
                                </p>
                                <p className={`text-zinc-500`}>
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
                        <div className={`${cardBg} border rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col`}>
                            <div className="p-4 border-b border-white/5 bg-white/5">
                                <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                                    Comments
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <CommentSection liveClassId={id} />
                            </div>
                        </div>
                    ) : (
                        <div className="h-[600px] flex flex-col">
                            <ChatPanel liveClassId={id} />
                        </div>
                    )}
                </div>
            </div>

            {/* Notes Section */}
            <section className="pt-4">
                <div className="flex items-center gap-2 mb-6">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-600'}`}>
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold ${textPrimary}`}>Study Materials</h2>
                        <p className={textSecondary}>Resources for this class</p>
                    </div>
                </div>
                <NotesList notes={notes} loading={false} />
            </section>
        </div>
    );
}
