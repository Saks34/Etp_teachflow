import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import NotesList from '../../components/student/NotesList';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen } from 'lucide-react';

export default function StudentNotes() {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const cardBg = isDark
        ? 'bg-gray-900/60 backdrop-blur-xl border-white/10'
        : 'bg-white/60 backdrop-blur-xl border-gray-200/50';

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        setLoading(true);
        setError(null);
        try {
            const batchId = user?.batch?._id || user?.batch;

            if (!batchId) {
                setError('No batch assigned to your account');
                setLoading(false);
                return;
            }

            const { data } = await api.get('/notes/by-batch', {
                params: { batchId },
            });

            setNotes(data.notes || []);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner centered />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-600'}`}>
                    <BookOpen size={24} />
                </div>
                <div>
                    <h1 className={`text-4xl font-bold ${textPrimary} mb-1`}>Study Materials</h1>
                    <p className={`${textSecondary} font-medium`}>
                        Access and download your class notes and materials
                    </p>
                </div>
            </div>

            {error && (
                <div className={`p-4 ${isDark ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-xl`}>
                    {error}
                </div>
            )}

            <NotesList notes={notes} loading={loading} />
        </div>
    );
}
