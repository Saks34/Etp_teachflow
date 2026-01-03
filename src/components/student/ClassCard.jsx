import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/teacher/StatusBadge';
import { useTheme } from '../../context/ThemeContext';
import { Clock, User, Play, Video, ArrowRight } from 'lucide-react';

export default function ClassCard({ classData }) {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { _id, subject, teacher, startTime, endTime, liveClassId } = classData;

    const status = classData.status || classData.liveClass?.status || 'Scheduled';

    const handleJoinClass = () => {
        const targetId = typeof liveClassId === 'object' ? liveClassId?._id : liveClassId;
        if (targetId && (status === 'Live' || status === 'Scheduled' || status === 'Completed')) {
            navigate(`/student/class/${targetId}`);
        }
    };

    const getButtonConfig = () => {
        if (status === 'Cancelled') return { text: 'Cancelled', icon: null, gradient: 'from-gray-400 to-gray-500', disabled: true };
        if (status === 'Live') return { text: 'Join Live', icon: Play, gradient: 'from-rose-500 to-red-600', pulse: true };
        if (status === 'Completed') return { text: 'Watch', icon: Video, gradient: 'from-violet-500 to-purple-600' };
        return { text: 'Join', icon: ArrowRight, gradient: 'from-blue-500 to-cyan-600' };
    };

    const buttonConfig = getButtonConfig();
    const isDisabled = status === 'Cancelled' || !liveClassId;
    const ButtonIcon = buttonConfig.icon;

    return (
        <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] ${isDark ? 'bg-[#16161d] hover:shadow-lg hover:shadow-blue-500/10' : 'bg-white hover:shadow-xl'} border ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}>
            {status === 'Live' && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-red-500 animate-pulse"></div>
            )}

            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl transition-all ${status === 'Live'
                            ? 'bg-gradient-to-br from-rose-500 to-red-600'
                            : isDark ? 'bg-blue-600/10' : 'bg-blue-50'
                            }`}>
                            <User size={16} className={status === 'Live' ? 'text-white' : (isDark ? 'text-blue-400' : 'text-blue-600')} />
                        </div>
                        <div>
                            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} leading-tight`}>{subject}</h3>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {teacher?.name || teacher || 'Not assigned'}
                            </p>
                        </div>
                    </div>
                    <StatusBadge status={status} />
                </div>

                {/* Time */}
                <div className={`flex items-center gap-2 mb-4 p-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <Clock size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {startTime} - {endTime}
                    </span>
                </div>

                {/* Button */}
                <button
                    onClick={handleJoinClass}
                    disabled={isDisabled}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                        ${isDisabled
                            ? `${isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                            : `bg-gradient-to-r ${buttonConfig.gradient} text-white hover:shadow-lg active:scale-[0.98]`
                        }
                        ${buttonConfig.pulse ? 'animate-pulse' : ''}
                    `}
                >
                    {ButtonIcon && <ButtonIcon size={16} />}
                    <span>{buttonConfig.text}</span>
                </button>
            </div>
        </div>
    );
}
