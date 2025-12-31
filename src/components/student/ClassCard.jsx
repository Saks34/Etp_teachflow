import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/teacher/StatusBadge';

export default function ClassCard({ classData }) {
    const navigate = useNavigate();
    const { _id, subject, teacher, startTime, endTime, status, liveClassId } = classData;

    const handleJoinClass = () => {
        if (liveClassId && (status === 'Live' || status === 'Scheduled' || status === 'Completed')) {
            navigate(`/student/class/${liveClassId}`);
        }
    };

    const getButtonText = () => {
        if (status === 'Cancelled') return 'Class Cancelled';
        if (status === 'Live') return 'Join Now';
        if (status === 'Completed') return 'Watch Recording';
        return 'Join Class';
    };

    const isDisabled = status === 'Cancelled' || !liveClassId;

    return (
        <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-admin-text">{subject}</h3>
                    <p className="text-base text-admin-text-muted mt-2">
                        Teacher: {teacher?.name || teacher || 'Not assigned'}
                    </p>
                </div>
                <StatusBadge status={status} />
            </div>

            <div className="flex items-center gap-2 text-base text-admin-text-muted mb-5">
                <span className="text-lg">🕒</span>
                <span>{startTime} - {endTime}</span>
            </div>

            <button
                onClick={handleJoinClass}
                disabled={isDisabled}
                className="btn btn-primary w-full text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {getButtonText()}
            </button>
        </div>
    );
}
