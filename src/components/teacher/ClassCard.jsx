import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { useTheme } from '../../context/ThemeContext';
import { Clock, BookOpen } from 'lucide-react';

export default function ClassCard({ classData }) {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { _id, subject, batch, startTime, endTime } = classData;
    console.log('ClassCard render:', { classData, _id, typeOfId: typeof _id });

    // Determine actual status from liveClass or classData itself
    const status = classData.status || classData.liveClass?.status || 'Scheduled';

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const cardBg = isDark
        ? 'bg-gray-900 border-white/10 hover:bg-gray-800'
        : 'bg-white border-gray-200 hover:shadow-lg';
    const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

    const handleEnterClass = () => {
        // Navigate using the timetable ID, not liveClassId
        if (_id && status !== 'Cancelled') {
            navigate(`/teacher/class/${_id}`);
        }
    };

    return (
        <div className={`${cardBg} border ${borderColor} p-6 rounded-2xl transition-all duration-300 group`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-600'}`}>
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${textPrimary} leading-tight`}>{subject}</h3>
                        <p className={`text-sm ${textSecondary} mt-0.5`}>
                            Batch: {batch?.name || batch}
                        </p>
                    </div>
                </div>
                <StatusBadge status={status} />
            </div>

            <div className={`flex items-center gap-2 text-sm ${textSecondary} mb-6 bg-gray-50 dark:bg-white/5 p-3 rounded-xl`}>
                <Clock size={16} className={isDark ? 'text-violet-400' : 'text-violet-600'} />
                <span className="font-medium">{startTime} - {endTime}</span>
            </div>

            <button
                onClick={handleEnterClass}
                disabled={status === 'Cancelled' || !_id}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
                    ${status === 'Cancelled'
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-white/5 dark:text-gray-600 shadow-none'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
            >
                {status === 'Cancelled' ? 'Class Cancelled' : 'Enter Class'}
            </button>
        </div>
    );
}
