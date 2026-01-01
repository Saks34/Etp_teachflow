import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/teacher/StatusBadge';
import { useTheme } from '../../context/ThemeContext';
import { Clock, User } from 'lucide-react';

export default function ClassCard({ classData }) {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { _id, subject, teacher, startTime, endTime, liveClassId } = classData;

    // Determine actual status from liveClass or classData itself
    const status = classData.status || classData.liveClass?.status || 'Scheduled';

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const cardBg = isDark
        ? 'bg-gray-900 border-white/10 hover:bg-gray-800'
        : 'bg-white border-gray-200 hover:shadow-lg';
    const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

    const handleJoinClass = () => {
        // liveClassId is populated as an object from the backend
        const targetId = typeof liveClassId === 'object' ? liveClassId?._id : liveClassId;

        if (targetId && (status === 'Live' || status === 'Scheduled' || status === 'Completed')) {
            navigate(`/student/class/${targetId}`);
        }
    };

    const getButtonText = () => {
        if (status === 'Cancelled') return 'Class Cancelled';
        if (status === 'Live') return 'Join Live Class';
        if (status === 'Completed') return 'Watch Recording';
        return 'Join Class';
    };

    const getButtonStyles = () => {
        if (status === 'Cancelled') return `bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-white/5 dark:text-gray-600 shadow-none`;
        if (status === 'Live') return `bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] animate-pulse`;
        return `bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]`;
    };

    const isDisabled = status === 'Cancelled' || !liveClassId;

    return (
        <div className={`${cardBg} border ${borderColor} p-6 rounded-2xl transition-all duration-300 group`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                        <User size={20} />
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${textPrimary} leading-tight`}>{subject}</h3>
                        <p className={`text-sm ${textSecondary} mt-0.5`}>
                            {teacher?.name || teacher || 'Not assigned'}
                        </p>
                    </div>
                </div>
                <StatusBadge status={status} />
            </div>

            <div className={`flex items-center gap-2 text-sm ${textSecondary} mb-6 bg-gray-50 dark:bg-white/5 p-3 rounded-xl`}>
                <Clock size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                <span className="font-medium">{startTime} - {endTime}</span>
            </div>

            <button
                onClick={handleJoinClass}
                disabled={isDisabled}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${getButtonStyles()} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {getButtonText()}
            </button>
        </div>
    );
}
