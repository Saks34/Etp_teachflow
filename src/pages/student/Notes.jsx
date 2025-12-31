import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import NotesList from '../../components/student/NotesList';
import { useAuth } from '../../context/AuthContext';

export default function StudentNotes() {
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();

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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-admin-text">Study Materials</h1>
                <p className="text-admin-text-muted mt-1">
                    Access and download your class notes and materials
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            <NotesList notes={notes} loading={loading} />
        </div>
    );
}
