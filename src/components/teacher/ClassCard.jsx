import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function ClassCard({ classData }) {
    const navigate = useNavigate();
    const { _id, subject, batch, startTime, endTime, status } = classData;

    const handleEnterClass = () => {
        // Navigate using the timetable ID, not liveClassId
        if (_id && status !== 'Cancelled') {
            navigate(`/teacher/class/${_id}`);
        }
    };

    return (
        <div className="card p-5">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-admin-text">{subject}</h3>
                    <p className="text-sm text-admin-text-muted mt-1">
                        Batch: {batch?.name || batch}
                    </p>
                </div>
                <StatusBadge status={status} />
            </div>

            <div className="flex items-center gap-4 text-sm text-admin-text-muted mb-4">
                <span>🕒 {startTime} - {endTime}</span>
            </div>

            <button
                onClick={handleEnterClass}
                disabled={status === 'Cancelled' || !_id}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status === 'Cancelled' ? 'Class Cancelled' : 'Enter Class'}
            </button>
        </div>
    );
}
