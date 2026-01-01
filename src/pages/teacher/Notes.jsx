import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Table from '../../components/shared/Table';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { Eye, Trash2, FileText } from 'lucide-react';

export default function TeacherNotes() {
    const { isDark } = useTheme();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

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
        try {
            const { data } = await api.get('/notes');
            setNotes(data.notes || []);
        } catch (error) {
            console.error('Failed to load notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteNote = async (noteId) => {
        if (!confirm('Delete this note?')) return;
        try {
            await api.delete(`/notes/${noteId}`);
            toast.success('Note deleted successfully');
            loadNotes();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete note');
        }
    };

    const columns = [
        { header: 'Title', accessor: 'title' },
        {
            header: 'Subject',
            render: (row) => row.subjectId?.name || row.subjectId || 'N/A'
        },
        {
            header: 'Batch',
            render: (row) => row.batchId?.name || row.batchId || 'N/A'
        },
        {
            header: 'Type',
            render: (row) => (
                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {row.fileType}
                </span>
            ),
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <a
                        href={row.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-blue-500/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
                            }`}
                        title="View Note"
                    >
                        <Eye size={18} />
                    </a>
                    <button
                        onClick={() => deleteNote(row._id)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                            }`}
                        title="Delete Note"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        },
    ];

    if (loading) {
        return <LoadingSpinner centered />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className={`text-4xl font-bold ${textPrimary} mb-2`}>My Notes</h1>
                <p className={textSecondary}>View and manage all uploaded notes</p>
            </div>

            <div className={`${cardBg} border rounded-2xl p-6 shadow-xl`}>
                <Table
                    columns={columns}
                    data={notes}
                    emptyMessage="No notes uploaded yet. Notes uploaded from live classes will appear here."
                />
            </div>
        </div>
    );
}
