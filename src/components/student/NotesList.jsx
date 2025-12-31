import EmptyState from '../shared/EmptyState';

export default function NotesList({ notes, loading }) {
    const handleDownload = (note) => {
        // Trigger download
        const link = document.createElement('a');
        link.href = note.fileUrl;
        link.download = note.fileName || 'note';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-admin-text-muted">Loading notes...</p>
            </div>
        );
    }

    if (!notes || notes.length === 0) {
        return <EmptyState message="No study materials available yet" />;
    }

    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-admin-border">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-admin-text">
                                Subject
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-admin-text">
                                Class/Batch
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-admin-text">
                                Upload Date
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-admin-text">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-border">
                        {notes.map((note) => (
                            <tr key={note._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-admin-text">
                                    {note.title || note.fileName}
                                </td>
                                <td className="px-6 py-4 text-sm text-admin-text-muted">
                                    {note.batch?.name || note.batch || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-admin-text-muted">
                                    {new Date(note.createdAt || note.uploadedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDownload(note)}
                                        className="text-admin-primary hover:text-admin-primary-dark font-medium text-sm"
                                    >
                                        Download
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
