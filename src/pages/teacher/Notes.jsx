import { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/shared/Table';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function TeacherNotes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

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
            alert('Note deleted successfully');
            loadNotes();
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to delete note');
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
                <span className="uppercase text-xs font-medium">{row.fileType}</span>
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
                        className="text-admin-primary hover:underline text-sm"
                    >
                        View
                    </a>
                    <button
                        onClick={() => deleteNote(row._id)}
                        className="text-red-600 hover:underline text-sm"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    if (loading) {
        return <LoadingSpinner centered />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-admin-text">My Notes</h1>
                <p className="text-admin-text-muted mt-1">View and manage all uploaded notes</p>
            </div>

            <Table
                columns={columns}
                data={notes}
                emptyMessage="No notes uploaded yet. Upload notes from class sessions."
            />
        </div>
    );
}
