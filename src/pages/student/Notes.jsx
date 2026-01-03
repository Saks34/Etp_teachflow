import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import NotesList from '../../components/student/NotesList';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen, Search, FolderOpen } from 'lucide-react';

export default function StudentNotes() {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    useEffect(() => { loadNotes(); }, []);

    const loadNotes = async () => {
        setLoading(true);
        setError(null);
        try {
            const batchId = user?.batch?._id || user?.batch;
            if (!batchId) { setError('No batch assigned'); setLoading(false); return; }
            const { data } = await api.get('/notes/by-batch', { params: { batchId } });
            setNotes(data.notes || []);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    const filteredNotes = notes.filter(note =>
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner centered />;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className={`relative overflow-hidden rounded-2xl ${isDark ? 'bg-[#111118]/60' : 'bg-white/60'} backdrop-blur-xl border ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}>
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl`}></div>

                <div className="relative p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600`}>
                                <BookOpen className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Study Materials</h1>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Download your class notes</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className={`flex items-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200/50'} border rounded-xl w-full md:w-64`}>
                            <Search size={14} className={`ml-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full py-2 px-2 bg-transparent ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'} focus:outline-none text-sm`}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <span className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1.5 ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                            <FolderOpen size={12} /> {notes.length} Materials
                        </span>
                    </div>
                </div>
            </div>

            {error && (
                <div className={`p-3 ${isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-xl text-sm`}>
                    {error}
                </div>
            )}

            <NotesList notes={filteredNotes} loading={loading} />
        </div>
    );
}
