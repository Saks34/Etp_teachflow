import { useTheme } from '../../context/ThemeContext';
import { Download, FileText, Calendar, FolderOpen } from 'lucide-react';

export default function NotesList({ notes, loading }) {
    const { isDark } = useTheme();

    const handleDownload = (note) => {
        const link = document.createElement('a');
        link.href = note.fileUrl;
        link.download = note.fileName || 'note';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFileIcon = (fileName) => {
        const ext = fileName?.split('.').pop()?.toLowerCase();
        if (['pdf'].includes(ext)) return '📕';
        if (['doc', 'docx'].includes(ext)) return '📘';
        if (['ppt', 'pptx'].includes(ext)) return '📙';
        return '📄';
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className={`p-4 rounded-2xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <div className={`h-10 w-10 rounded-xl mb-3 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                        <div className={`h-4 rounded-lg mb-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                        <div className={`h-3 w-2/3 rounded-lg ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!notes || notes.length === 0) {
        return (
            <div className={`${isDark ? 'bg-[#111118]/60 border-white/5' : 'bg-white/60 border-gray-200/50'} backdrop-blur-xl border p-12 text-center rounded-2xl`}>
                <div className={`mx-auto w-14 h-14 rounded-2xl ${isDark ? 'bg-violet-600/10' : 'bg-violet-50'} flex items-center justify-center mb-4`}>
                    <FolderOpen size={24} className={isDark ? 'text-violet-400' : 'text-violet-600'} />
                </div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>No Materials Yet</h3>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Materials will appear once uploaded.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {notes.map((note) => (
                <div
                    key={note._id}
                    className={`group overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] ${isDark ? 'bg-[#16161d] hover:shadow-lg hover:shadow-violet-500/10' : 'bg-white hover:shadow-xl'} border ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}
                >
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-violet-600/10' : 'bg-violet-50'}`}>
                                <span className="text-xl">{getFileIcon(note.fileName)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                                    {note.title || note.fileName}
                                </h3>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} truncate flex items-center gap-1`}>
                                    <FileText size={10} /> {note.fileName}
                                </p>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`text-xs px-2 py-1 rounded-lg ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                {note.batch?.name || note.batch || 'N/A'}
                            </span>
                            <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                <Calendar size={10} />
                                {new Date(note.createdAt || note.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>

                        {/* Download */}
                        <button
                            onClick={() => handleDownload(note)}
                            className="w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg active:scale-[0.98]"
                        >
                            <Download size={16} />
                            Download
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
