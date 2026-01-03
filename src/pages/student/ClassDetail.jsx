import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ChatPanel from '../../components/student/ChatPanel';
// NotesList is being replaced by inline UI but we might need logic from it if it had any specific handling? 
// The existing NotesList just took props. We will implement the UI directly here as per request.
import { useAuth } from '../../context/AuthContext';
import CustomYouTubePlayer from '../../components/shared/CustomYouTubePlayer';
import CommentSection from '../../components/student/CommentSection';
import usePageTitle from '../../hooks/usePageTitle';
import { useTheme } from '../../context/ThemeContext';
import {
    Video,
    BookOpen,
    Clock,
    User,
    Download,
    MessageCircle,
    FileText,
    Radio,
    ArrowLeft
} from 'lucide-react';

export default function StudentClassDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    usePageTitle(classData?.subject || 'Class Detail', 'Student');

    useEffect(() => {
        loadClassData();
        // loadNotes is dependent on class/batch, usually done after we know the batch or concurrently if we trust the user context
        loadNotes();
    }, [id]);

    const loadClassData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/live-classes/${id}`);
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

    // Socket Logic for Real-time Status and Auto-refresh
    useEffect(() => {
        if (!classData?._id) return;

        const socket = io('http://localhost:5000/live-classes', {
            auth: { token: localStorage.getItem('accessToken') },
            transports: ['websocket']
        });

        socket.on('connect_error', (err) => console.error('Socket connection error:', err));

        socket.emit('join-room', { liveClassId: classData._id, batchId: user?.batch?._id || user?.batch });

        socket.on('class-live', (data) => {
            console.log('Class went live:', data);
            setClassData(prev => ({ ...prev, status: 'Live', streamInfo: data.streamInfo }));
        });

        socket.on('class-ended', () => {
            console.log('Class ended');
            setClassData(prev => ({ ...prev, status: 'Completed', streamInfo: { ...prev.streamInfo, broadcastId: null } }));
        });

        return () => {
            socket.disconnect();
        };
    }, [classData?._id]);

    const playerRef = useRef(null);

    const handleJumpToLive = () => {
        if (playerRef.current) {
            playerRef.current.seekToLive();
        }
    };

    const getStatusConfig = () => {
        if (!classData) return {};

        // Mapping backend status to UI config
        // Backend statuses: 'Live', 'Scheduled', 'Completed' (assuming caps, or standardize)
        const status = classData.status;

        const configs = {
            Live: {
                badge: 'bg-red-500',
                text: 'LIVE NOW',
                icon: Radio,
                pulse: true
            },
            Scheduled: {
                badge: 'bg-blue-500',
                text: 'UPCOMING',
                icon: Clock,
                pulse: false
            },
            Completed: {
                badge: 'bg-green-500',
                text: 'RECORDED',
                icon: Video,
                pulse: false
            }
        };
        return configs[status] || configs.Scheduled;
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

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon || Clock;

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
            }`}>
            <div className="max-w-[1920px] mx-auto">
                {/* Hero Section: Video + Chat */}
                <div className="flex flex-col lg:flex-row bg-black">
                    {/* Video Player Section - Flex-1 to take available space */}
                    <div className="flex-1 relative group bg-black">
                        {/* Aspect Ratio Container for Video */}
                        <div className="w-full aspect-video relative">
                            {/* Back Button Overlay */}
                            <div className="absolute top-4 left-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Status Overlay */}
                            {classData.status === 'Live' && (
                                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-bold shadow-xl animate-pulse pointer-events-none">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                                    <span>LIVE</span>
                                </div>
                            )}
                            {classData.status === 'Completed' && (
                                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-bold shadow-xl pointer-events-none">
                                    <Video className="w-3 h-3" />
                                    <span>RECORDING</span>
                                </div>
                            )}

                            {/* Video Logic */}
                            {classData.status === 'Live' || classData.status === 'Completed' ? (
                                <div className="absolute inset-0 group/player">
                                    <CustomYouTubePlayer
                                        ref={playerRef}
                                        videoId={
                                            (classData.status === 'Completed' && classData.recordings?.length > 0)
                                                ? classData.recordings[0].youtubeVideoId
                                                : (classData.streamInfo?.broadcastId ||
                                                    classData.streamInfo?.liveUrl?.split('v=')[1]?.split('&')[0] ||
                                                    classData.youtubeUrl?.split('v=')[1]?.split('&')[0])
                                        }
                                        autoplay={true}
                                    />

                                    {/* Jump to Live Button */}
                                    {classData.status === 'Live' && (
                                        <button
                                            onClick={handleJumpToLive}
                                            className="absolute bottom-16 right-4 z-40 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 opacity-0 group-hover/player:opacity-100 transition-opacity"
                                        >
                                            <Radio className="w-3 h-3" />
                                            JUMP TO LIVE
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white bg-black">
                                    <div className="p-6 rounded-full bg-gray-800 mb-4">
                                        <Video className="w-12 h-12 text-gray-600" />
                                    </div>
                                    <p className="text-xl font-bold text-gray-300 mb-2">
                                        {classData.status === 'Scheduled' ? 'Waiting for Stream' : 'No Stream Available'}
                                    </p>
                                    <p className="text-gray-500">
                                        {classData.status === 'Scheduled'
                                            ? 'The teacher will start soon. Please wait...'
                                            : 'This class does not have a stream.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Chat/Comments (Matches Video Height on Desktop) */}
                    <div className={`w-full lg:w-[350px] xl:w-[400px] flex flex-col border-l z-20 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                        {/* Force height to match parent (Video) on desktop, fixed height on mobile if needed or auto */}
                        {/* On lg, flex row means stretch, so h-auto here fills height. But inner content needs to scroll. */}
                        <div className="h-full relative min-h-[500px] lg:min-h-0">
                            {classData.status === 'Completed' ? (
                                <div className="absolute inset-0 flex flex-col">
                                    <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-violet-500/20">
                                                <MessageCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    Comments
                                                </h3>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    Discuss this class
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-hidden relative">
                                        <CommentSection liveClassId={id} />
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col">
                                    <ChatPanel liveClassId={id} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section (Below Header) */}
                <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">

                    {/* Header / Info Section */}
                    <div className="space-y-4">
                        {/* Title & Status */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className={`text-xl lg:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    {classData.subject}
                                </h1>

                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                            {/* Initials */}
                                            {classData.teacher?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'T'}
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {classData.teacher?.name}
                                            </p>
                                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                {classData.batch?.name || classData.batch}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`}>
                                        {classData.startTime} - {classData.endTime}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description Expansion */}
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {classData.description || 'No description provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Study Materials */}
                    {notes.length > 0 && (
                        <div className={`rounded-2xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Study Materials
                                </h2>
                            </div>

                            <div className="space-y-2">
                                {notes.map((note) => (
                                    <div
                                        key={note._id || note.id}
                                        className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${isDark
                                            ? 'bg-gray-700/30 hover:bg-gray-700/50'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                        onClick={() => window.open(note.secureUrl || note.fileUrl, '_blank')}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            <span className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-700'
                                                }`}>
                                                {note.title}
                                            </span>
                                        </div>
                                        <Download className="w-4 h-4 text-gray-400 hover:text-gray-200" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
